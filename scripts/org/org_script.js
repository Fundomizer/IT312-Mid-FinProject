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

loadDashboard() // Load dashboard by default