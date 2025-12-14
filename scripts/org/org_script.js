import { fetchCollection, loadPage } from "../utilities.js";

const dashboard = document.getElementById("dashboardButton");
const history = document.getElementById("historyButton");

async function getProfile() {
    return await fetch("/api/auth/profile", {
        method: "POST",
        credentials: "include"
    }).then(res => res.json());
}

async function loadDashboard() {
    loadPage("org", "dashboard_page.html");

    const profile = await getProfile();

    const forms = await fetch(
        `/api/orgs/rsc/forms/${profile.user.organization}`,
        { method: "GET", credentials: "include" }
    ).then(res => res.json());

    const totalSubmissions = await fetch(
        `/api/orgs/rsc/history/${profile.user.organization}`,
        { method: "GET", credentials: "include" }
    ).then(res => res.json());

    const totalSubs = document.querySelector("#TotalSubmissions b");
    const totalAssForms = document.querySelector("#AssignedForms b");

    totalSubs.textContent = Object.keys(totalSubmissions.history.requirements).length;
    totalAssForms.textContent = forms.requirements.length;
    document.getElementById('OrgName').innerHTML = profile.user.organization
    handleLogout()
}

async function loadHistory() {
    await loadPage("org", "history_page.html");

    const profile = await getProfile();

    const response = await fetch(
        `/api/orgs/rsc/history/${profile.user.organization}`,
        { method: "GET", credentials: "include" }
    ).then(res => res.json());

    const history = response.history.requirements;

    let allRequirements = Object.entries(history).map(([name, details]) => ({
        name,
        ...details
    }));

    const searchInput = document.getElementById("SearchInput");

    function displayHistory(requirements) {
        const logsDisplay = document.getElementById("History");
        if (!logsDisplay) return;

        logsDisplay.innerHTML = "";
        requirements.forEach(item => {
            logsDisplay.appendChild(createLog(item));
        });
    }

   function filterHistory() {
    const term = searchInput.value.toLowerCase();

    const filtered = allRequirements.filter(req => {
        const nameMatch = req.name?.toLowerCase().includes(term);
        const tagMatch = (req.tags || []).some(tag =>
            tag.toLowerCase().includes(term)
        );
        const fieldMatch = (req.fields || []).some(field =>
            field.question?.toLowerCase().includes(term) ||
            field.content?.toLowerCase().includes(term)
        );
        const fileMatch =
            req.filename?.toLowerCase().includes(term) ||
            req.file_path?.toLowerCase().includes(term); 

        return nameMatch || tagMatch || fieldMatch || fileMatch;
    });

    displayHistory(filtered);
}


    searchInput.addEventListener("input", filterHistory);

    displayHistory(allRequirements);

    function createLog(requirement) {
        const wrapper = document.createElement("div");
        wrapper.className = "SubCard Log";

        const logDetails = document.createElement("div");
        logDetails.className = "LogDetails";

        const titleBlock = document.createElement("div");
        const titleEl = document.createElement("h4");
        titleEl.textContent = requirement.name || "No name";
        titleBlock.appendChild(titleEl);

        const updatedEl = document.createElement("p");
        updatedEl.textContent = `Last Updated: ${requirement.last_updated || "N/A"}`;

        const tagsContainer = document.createElement("div");
        tagsContainer.className = "Tags";
        (requirement.tags || []).forEach(tag => {
            const tagEl = document.createElement("p");
            tagEl.className = "Tag";
            tagEl.textContent = tag;
            tagsContainer.appendChild(tagEl);
        });

        logDetails.appendChild(titleBlock);
        logDetails.appendChild(updatedEl);
        logDetails.appendChild(tagsContainer);

        const buttonWrapper = document.createElement("div");
        const button = document.createElement("button");
        button.className = "StyledButton";

        const imgWrapper = document.createElement("div");
        imgWrapper.className = "ImageWrapper";

        const icon = document.createElement("img");
        icon.src = "../../assets/images/org_icons/view.png";
        icon.alt = "Eye icon";

        imgWrapper.appendChild(icon);

        const label = document.createElement("span");
        label.textContent = "View details";

        button.appendChild(imgWrapper);
        button.appendChild(label);

        button.addEventListener("click", () => {
            showRequirementModal(requirement);
        });

        buttonWrapper.appendChild(button);

        wrapper.appendChild(logDetails);
        wrapper.appendChild(buttonWrapper);

        return wrapper;
    }
}


// Assign event handlers for navigation
if (dashboard) dashboard.addEventListener('click', loadDashboard)
if (history) history.addEventListener('click', loadHistory)


async function setTexts() {
    const profile = await getProfile()
    document.getElementById('UsernameLabel').innerHTML = profile.user.email
}

function handleLogout() {
    let logoutButton = document.getElementById('LogoutButton')
    logoutButton.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            console.log(data);

            if (res.ok && data.success) {
                window.location.href = '/';
            } else {
                alert('Logout failed.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while logging out.');
        }
    });

}
function showRequirementModal(requirement) {
    const modal = document.createElement("div");
    modal.className = "ModalOverlay";

    modal.innerHTML = `
        <div class="ModalContent">
            <span class="ModalClose">&times;</span>

            <h2>${requirement.name}</h2>
            <p><b>Last Updated:</b> ${requirement.last_updated || "N/A"}</p>

            <div class="Tags">
                ${(requirement.tags || [])
                    .map(tag => `<span class="Tag">${tag}</span>`)
                    .join("")}
            </div>

            <hr />

            <h3>Submitted Fields</h3>
            ${(requirement.fields || [])
                .map(
                    field => `
                <div class="FieldBlock">
                    <p><b>${field.question}</b></p>
                    <p>${field.content || "<i>No content</i>"}</p>
                </div>
            `
                )
                .join("")}

            ${
                      requirement.file_path
                         ? `<hr />
                           <h3>Uploaded File</h3>
                             <a href="${requirement.file_path}" target="_blank">
                                View uploaded file
           </a>`
        : ""
            }
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".ModalClose").onclick = () => modal.remove();
    modal.onclick = e => {
        if (e.target === modal) modal.remove();
    };
}

if (dashboard) dashboard.addEventListener("click", loadDashboard);
if (history) history.addEventListener("click", loadHistory);

loadDashboard() // Load dashboard by default
setTexts()