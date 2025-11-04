import { fetchCollection, loadPage } from "../utilities.js"

const dashboard = document.getElementById("dashboardButton")
const forms = document.getElementById("formsButton")
const history = document.getElementById("historyButton")

function loadDashboard() {
    loadPage('org', 'dashboard_page.html')
}

async function loadForms() {
    loadPage('org', 'assigned_form_page.html')

    let forms = await fetchCollection('org_forms')

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
            titleEl.textContent = form.title;

            const actionEl = document.createElement("p");
            actionEl.className = "Tag";
            actionEl.textContent = form.action;

            titleBlock.appendChild(titleEl);
            titleBlock.appendChild(actionEl);

            // Description
            const descEl = document.createElement("p");
            descEl.className = "FormDescription";
            descEl.textContent = form.activity;

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
            reqText.textContent = `${form.field_num} Fields required`;

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

async function loadHistory() {
    loadPage('org', 'history_page.html')

    let history = await fetchCollection('history')

    displayHistory(history)

    function displayHistory(history) {

        const logsDisplay = document.getElementById("History")

        history.forEach(item => {
            logsDisplay.appendChild(createLog(item))
        });

    }

    function createLog(log) {
        // Create parent Wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "SubCard Log";

        wrapper.appendChild(createLogDetails())
        wrapper.appendChild(createStyledButtonDiv())

        return wrapper

        function createLogDetails() {
            // Log details
            const logDetails = document.createElement("div");
            logDetails.className = "LogDetails";

            // For the title and the action
            const titleBlock = document.createElement("div");
            const titleEl = document.createElement("h4");
            titleEl.textContent = log['title'];
            const actionEl = document.createElement("p");
            actionEl.textContent = log['action'];
            titleBlock.appendChild(titleEl);
            titleBlock.appendChild(actionEl);

            const activityEl = document.createElement("p");
            activityEl.textContent = log['activity'];

            // Date details, time of activity and submission, A.Y. and semester
            const logDate = document.createElement("div");
            logDate.className = "LogDate";

            const dateSpan = document.createElement("span");
            const imgWrapper = document.createElement("div");
            imgWrapper.className = "ImageWrapper";
            const calendarImg = document.createElement("img");
            calendarImg.src = "../../assets/images/icons/calendar.png";
            calendarImg.alt = "Calendar icon";
            imgWrapper.appendChild(calendarImg);

            // Time of submission
            const submittedText = document.createElement("p");
            submittedText.textContent = `Submitted: ${log['submission_date']}`;

            dateSpan.appendChild(imgWrapper);
            dateSpan.appendChild(submittedText);

            // Academic year + Semester
            const academicYear = document.createElement("p");
            academicYear.textContent = `Academic Year: ${log['academic_yr']}`;
            const semester = document.createElement("p");
            semester.textContent = `Semester: ${log['semester']}`;

            logDate.appendChild(dateSpan)
            logDate.appendChild(academicYear)
            logDate.appendChild(semester)

            // Tags section
            const tagsContainer = document.createElement("div");
            tagsContainer.className = "Tags";
            log['tags'].forEach(tag => {
                const tagEl = document.createElement("p");
                tagEl.className = "Tag";
                tagEl.textContent = tag;
                tagsContainer.appendChild(tagEl);
            });

            // Assemble everything into LogDetails
            logDetails.appendChild(titleBlock);
            logDetails.appendChild(activityEl);
            logDetails.appendChild(logDate);
            logDetails.appendChild(tagsContainer);

            return logDetails
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

// Use event delegation for dynamically loaded elements
document.addEventListener("click", (e) => {
    // Check if clicked element is a StyledButton
    if (e.target.closest(".StyledButton")) {
        openForm();
    }
    // Check if clicked element is the cancel button
    if (e.target.id === "CancelForm") {
        closeForm();
    }
});

loadHistory() // Load dashboard by default