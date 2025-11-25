import { fetchCollection, loadPage } from "../utilities.js"

const dashboard = document.getElementById("dashboardButton")
const forms = document.getElementById("formsButton")
const history = document.getElementById("historyButton")

async function loadDashboard() {
    loadPage('org', 'dashboard_page.html')

    let orgs = await fetchCollection('student_organization');
    let totalSubmissions = 0;
    orgs.forEach(org => {
        const reqs = org.requirements || {};
        totalSubmissions += Object.keys(reqs).length;
    });

    let assignedForms = await fetchCollection('forms')

    const totalSubs = document.querySelector("#TotalSubmissions b");
    const totalAssForms = document.querySelector("#AssignedForms b");

    totalSubs.textContent = totalSubmissions;
    totalAssForms.textContent = assignedForms.length;
}

async function loadForms() {
    loadPage('org', 'assigned_form_page.html')

    let forms = await fetchCollection('forms')

    displayForm(forms)

    function displayForm(forms) {
        const formDisplay = document.getElementById('Forms')

        forms.forEach(item => {
            formDisplay.appendChild(createForm(item))
        });
    }

    function createForm(form) {
        // Parent wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "SubCard Form";

        // Attach the two big parts
        wrapper.appendChild(createFormDetails());
        wrapper.appendChild(createStyledButtonDiv());

        return wrapper;

        function createFormDetails() {
            const formDetails = document.createElement("div");
            formDetails.className = "FormDetails";

            // Title + Action
            const titleBlock = document.createElement("span");
            const titleEl = document.createElement("h3");
            titleEl.className = "FormTitle";
            titleEl.textContent = form.requirement_name;



            titleBlock.appendChild(titleEl);


            // Description
            const descEl = document.createElement("p");
            descEl.className = "FormDescription";
            descEl.textContent = form.description;

            // Requirements
            const requirements = document.createElement("div");
            requirements.className = "FormRequirements";

            const reqSpan = document.createElement("span");

            const imageWrapper = document.createElement("div");
            imageWrapper.className = "ImageWrapper";

            const icon = document.createElement("img");
            icon.src = "../../assets/images/org_icons/document_icon.png";
            icon.alt = "Document icon";

            imageWrapper.appendChild(icon);

            const reqText = document.createElement("p");
            reqText.textContent = `${form.fields.length} Fields required`;

            reqSpan.appendChild(imageWrapper);
            reqSpan.appendChild(reqText);
            requirements.appendChild(reqSpan);

            // Tags
            const tagsContainer = document.createElement("div");
            tagsContainer.className = "Tags";
            form.tags.forEach(tag => {
                const tagEl = document.createElement("p");
                tagEl.className = "Tag";
                tagEl.textContent = tag;
                tagsContainer.appendChild(tagEl);
            });

            // Assemble FormDetails
            formDetails.appendChild(titleBlock);
            formDetails.appendChild(descEl);
            formDetails.appendChild(requirements);
            formDetails.appendChild(tagsContainer);

            return formDetails;
        }

        // --- Internal function: Styled button ---
        function createStyledButtonDiv() {
            const buttonWrapper = document.createElement("div");

            const button = document.createElement("button");
            button.className = "StyledButton";

            const iconSpan = document.createElement("span");
            const formIcon = document.createElement("img");
            formIcon.src = "../../assets/images/icons/forms_icon.png";
            formIcon.alt = "Form icon";
            iconSpan.appendChild(formIcon);

            const labelSpan = document.createElement("span");
            labelSpan.textContent = "Fill Out form";

            button.appendChild(iconSpan);
            button.appendChild(labelSpan);
            buttonWrapper.appendChild(button);

            return buttonWrapper;
        }
    }


}

// this fucntion is currently reading all requirements from
//student organization use session handling to specify org
//and also add fields as necessary
async function loadHistory() {
    await loadPage('org', 'history_page.html');

    // Fetch all student organizations
    let orgs = await fetchCollection('student_organization');

    // Collect all requirements from all orgs
    let allRequirements = [];
    orgs.forEach(org => {
        const reqs = org.requirements || {};
        Object.keys(reqs).forEach(key => {
            // key is the requirement name, reqs[key] is the details
            allRequirements.push({
                name: key,
                ...reqs[key]
            });
        });
    });

    displayHistory(allRequirements);

    function displayHistory(requirements) {
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
            buttonWrapper.appendChild(button);

            return buttonWrapper;
        }
    }
}



function openForm() {
    const popup = document.querySelector(".PopupForm");
    if (popup) {
        popup.style.display = "block";
    } else {
        console.error("Popup element not found");
    }
}

function closeForm() {
    const popup = document.querySelector(".PopupForm");
    if (popup) {
        popup.style.display = "none";
    }
}

// Assign event handlers for navigation
if (dashboard) dashboard.addEventListener('click', loadDashboard)
if (forms) forms.addEventListener('click', loadForms)
if (history) history.addEventListener('click', loadHistory)

// EventHandlers for popup forms
document.addEventListener("click", (e) => {
    if (e.target.closest(".StyledButton")) {
        openForm();
    }
    if (e.target.id === "CancelForm") {
        closeForm();
    }
    if (e.target.closest("#EkisButton")) {
        closeForm();
    }
});

loadDashboard() // Load dashboard by default