import { loadPage } from "../utilities.js"


const dashboard = document.getElementById("dashboardButton")
const forms = document.getElementById("formsButton")
const history = document.getElementById("historyButton")
const popupButtons = document.querySelectorAll(".StyledButton");
let popup = document.getElementsByClassName("PopupForm");
const cancel = document.getElementById("CancelForm");

function loadDashboard() {
    loadPage('org', 'dashboard_page.html')
}

function loadForms() {
    loadPage('org', 'assigned_form_page.html')
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
popupButtons.addEventListener('click', openForm)
cancel.addEventListener('click', closeForm)

loadDashboard() // Load dashboard by default