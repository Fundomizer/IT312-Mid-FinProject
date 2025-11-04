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
  `;

        return wrapper;
    }

}

function loadHistory() {
    loadPage('org', 'history_page.html')
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

loadDashboard() // Load dashboard by default