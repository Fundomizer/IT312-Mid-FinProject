import { loadPage } from "../utilities.js"


const dashboard = document.getElementById("dashboardButton")
const forms = document.getElementById("formsButton")
const history = document.getElementById("historyButton")

function loadDashboard() {
    loadPage('org', 'dashboard_page.html')
}

function loadForms() {
    loadPage('org', 'assigned_form_page.html')
}

function loadHistory() {
    loadPage('org', 'history_page.html')
}

// Assing even hanlders
dashboard.addEventListener('click', loadDashboard)
forms.addEventListener('click', loadForms)
history.addEventListener('click', loadHistory)

loadDashboard() // Load dashboard by default