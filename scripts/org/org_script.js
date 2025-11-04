import { fetchCollection, loadPage } from "../utilities.js"


const dashboard = document.getElementById("dashboardButton")
const forms = document.getElementById("formsButton")
const history = document.getElementById("historyButton")
// const popupButtons = document.querySelectorAll(".StyledButton");
let popup = document.getElementsByClassName("PopupForm");
const cancel = document.getElementById("CancelForm");

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
        const wrapper = document.createElement("div");
        wrapper.className = "SubCard Form";

        // Build the inner HTML
        wrapper.innerHTML = `
      <div class="FormDetails">
      <span>
        <h3 class="FormTitle">${form["title"]}</h3>
        <p class="Tag">${form["action"]}</p>
      </span>
      <p class="FormDescription">${form["activity"]}</p>
      <div class="FormRequirements">
        <span>
          <div class="ImageWrapper">
            <img src="../../assets/images/org_icons/document_icon.png" alt="Document icon">
          </div>
          <p>${form["field_num"]} Fields required</p>
        </span>
      </div>
      <div class="Tags">
        ${form["tags"].map(tag => `<p class="Tag">${tag}</p>`).join("")}
      </div>
     </div>
     <div>
        <button class="StyledButton">
            <span><img src="../../assets/images/icons/forms_icon.png" alt="Form icon"></span>
            <span>Fill Out form</span>
            </button>
    </div>
  `;

        return wrapper;
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
            academicYear.textContent = log['academic_yr'];
            const semester = document.createElement("p");
            semester.textContent = log['semester'];

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
    popup.style.display = block;
    loadForms()
}

function closeForm() {
    popup.style.display = none;
    loadForms()
}

// Assing even hanlders
dashboard.addEventListener('click', loadDashboard)
forms.addEventListener('click', loadForms)
history.addEventListener('click', loadHistory)
// popupButtons.addEventListener('click', openForm)
// cancel.addEventListener('click', closeForm)

loadHistory() // Load dashboard by default