import { fetchCollection, loadPage } from "../utilities.js";
import {HOST} from "../config.js"

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
    let logoutButton = document.getElementById('Logout')
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
    modal.style.zIndex = 1000; 
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
                .map(field => `
                    <div class="FieldBlock">
                        <p><b>${field.question}</b></p>
                        <p>${field.content || "<i>No content</i>"}</p>
                    </div>
                `).join("")}
        </div>
    `;

    // Add uploaded files section
    if (requirement.filepaths && requirement.filepaths.length) {
        const filesDiv = document.createElement("div");
        filesDiv.innerHTML = `<hr /><h3>Uploaded Files</h3>`;
        
        requirement.filepaths.forEach((path, i) => {
            // Fix relative path to absolute URL
            const filename = requirement.filenames[i] || "View File";
            const absolutePath = path.replace(/^\.\/uploads/, `${HOST}/uploads`);
            
            const fileButton = document.createElement("button");
            fileButton.textContent = filename;
            fileButton.style.display = "block";
            fileButton.style.marginTop = "4px";
            fileButton.style.padding = "6px 12px";
            fileButton.style.cursor = "pointer";

            fileButton.addEventListener("click", () => {
                const overlay = document.createElement("div");
                overlay.style.position = "fixed";
                overlay.style.top = 0;
                overlay.style.left = 0;
                overlay.style.width = "100%";
                overlay.style.height = "100%";
                overlay.style.background = "rgba(0,0,0,0.8)";
                overlay.style.display = "flex";
                overlay.style.justifyContent = "center";
                overlay.style.alignItems = "center";
                overlay.style.zIndex = 3000;

                const viewer = document.createElement("div");
                viewer.style.background = "#fff";
                viewer.style.padding = "10px";
                viewer.style.borderRadius = "10px";
                viewer.style.width = "90%";
                viewer.style.height = "90%";
                viewer.style.display = "flex";
                viewer.style.flexDirection = "column";
                viewer.style.position = "relative";

                // Toolbar with download button
                const toolbar = document.createElement("div");
                toolbar.style.display = "flex";
                toolbar.style.justifyContent = "flex-end";
                toolbar.style.gap = "10px";
                toolbar.style.marginBottom = "5px";

                const downloadBtn = document.createElement("button");
                downloadBtn.textContent = "Download";
                downloadBtn.style.cursor = "pointer";
                downloadBtn.addEventListener("click", () => {
                    const link = document.createElement("a");
                    link.href = absolutePath;
                    link.download = filename;
                    link.click();
                });
                toolbar.appendChild(downloadBtn);

                const contentDiv = document.createElement("div");
                contentDiv.style.flex = "1";
                contentDiv.style.overflow = "auto";
                contentDiv.style.display = "flex";
                contentDiv.style.justifyContent = "center";
                contentDiv.style.alignItems = "center";

                const ext = filename.split('.').pop().toLowerCase();
                if (ext === "pdf") {
                    const iframe = document.createElement("iframe");
                    iframe.src = absolutePath;
                    iframe.style.width = "100%";
                    iframe.style.height = "100%";
                    contentDiv.appendChild(iframe);
                } else if (["png","jpg","jpeg","gif"].includes(ext)) {
                    const img = document.createElement("img");
                    img.src = absolutePath;
                    img.style.maxWidth = "100%";
                    img.style.maxHeight = "100%";
                    contentDiv.appendChild(img);
                } else {
                    contentDiv.textContent = "Cannot preview this file type.";
                }

                const closeBtn = document.createElement("button");
                closeBtn.textContent = "Close";
                closeBtn.style.position = "absolute";
                closeBtn.style.top = "10px";
                closeBtn.style.right = "10px";
                closeBtn.style.padding = "6px 12px";
                closeBtn.style.cursor = "pointer";
                closeBtn.addEventListener("click", () => overlay.remove());

                viewer.appendChild(toolbar);
                viewer.appendChild(contentDiv);
                viewer.appendChild(closeBtn);
                overlay.appendChild(viewer);
                document.body.appendChild(overlay);
            });

            filesDiv.appendChild(fileButton);
        });

        modal.querySelector(".ModalContent").appendChild(filesDiv);
    }

    document.body.appendChild(modal);

    modal.querySelector(".ModalClose").onclick = () => modal.remove();
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
}


if (dashboard) dashboard.addEventListener("click", loadDashboard);
if (history) history.addEventListener("click", loadHistory);

loadDashboard() // Load dashboard by default
setTexts()