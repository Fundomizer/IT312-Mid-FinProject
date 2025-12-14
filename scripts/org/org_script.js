import { fetchCollection, loadPage } from "../utilities.js"

const dashboard = document.getElementById("dashboardButton")
const history = document.getElementById("historyButton")

async function getProfile() {
    let me = await fetch("/api/auth/profile", {
        method: "POST",
        credentials: "include"
    })
        .then(res => res.json())

    return me
}

async function loadDashboard() {
    loadPage('org', 'dashboard_page.html')

    const profile = await getProfile()

    let forms = await fetch(`/api/orgs/rsc/forms/${profile.user.organization}`, {
        method: "GET",
        credentials: "include"
    })
        .then(res => res.json());

    let totalSubmissions = await fetch(`/api/orgs/rsc/history/${profile.user.organization}`, {
        method: "GET",
        credentials: "include"
    })
        .then(res => res.json());

    const totalSubs = document.querySelector("#TotalSubmissions b");
    const totalAssForms = document.querySelector("#AssignedForms b");

    totalSubs.textContent = Object.keys(totalSubmissions.history.requirements).length;
    totalAssForms.textContent = forms.requirements.length;
    document.getElementById('OrgName').innerText = await profile.name
}


// this fucntion is currently reading all requirements from
//student organization use session handling to specify org
//and also add fields as necessary
async function loadHistory() {
    await loadPage('org', 'history_page.html');

    const profile = await getProfile()

    // Fetch all student organizations
    let response = await fetch(`/api/orgs/rsc/history/${profile.user.organization}`, {
        method: "GET",
        credentials: "include"
    })
        .then(res => res.json())

    let history = response.history.requirements

    // Collect all requirements from all orgs
    let allRequirements = [];
    Object.entries(history).forEach(([name, details]) => {
        allRequirements.push({
            name,
            ...details
        });
    });

    displayHistory(allRequirements);

    function displayHistory(requirements) {

        console.log("All requirements: ", requirements);

        const logsDisplay = document.getElementById("History");
        if (!logsDisplay) return;
        logsDisplay.innerHTML = "";

        requirements.forEach(item => {
            logsDisplay.appendChild(createLog(item));
        });
    }

    function createLog(requirement) {
        const wrapper = document.createElement("div");
        wrapper.className = "SubCard Log";

        wrapper.appendChild(createLogDetails());
        wrapper.appendChild(createStyledButtonDiv());

        return wrapper;

        function createLogDetails() {
            const logDetails = document.createElement("div");
            logDetails.className = "LogDetails";

            // Requirement Name
            const titleBlock = document.createElement("div");
            const titleEl = document.createElement("h4");
            titleEl.textContent = requirement.name || "No name";
            titleBlock.appendChild(titleEl);

            // Last Updated
            const updatedEl = document.createElement("p");
            updatedEl.textContent = `Last Updated: ${requirement.last_updated || "N/A"}`;

            // Tags
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

            return logDetails;
        }

        function createStyledButtonDiv() {
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

            return buttonWrapper;
        }
    }
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
            ${(requirement.fields || []).map(field => `
                <div class="FieldBlock">
                    <p><b>${field.question}</b></p>
                    <p>${field.content || "<i>No content</i>"}</p>
                </div>
            `).join("")}

            ${requirement.filename
                ? `<hr />
                   <h3>Uploaded File</h3>
                   <a href="/uploads/${requirement.filename}" target="_blank">
                       View uploaded file
                   </a>`
                : ""}
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".ModalClose").onclick = () => modal.remove();
    modal.onclick = e => {
        if (e.target === modal) modal.remove();
    };
}



// Assign event handlers for navigation
if (dashboard) dashboard.addEventListener('click', loadDashboard)
if (history) history.addEventListener('click', loadHistory)


loadDashboard() // Load dashboard by default