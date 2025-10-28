import { loadPage } from "../utilities.js"
import { createTableRow } from "../components.js"

const dashboard = document.getElementById("dashboardButton")
const users = document.getElementById("usersButton")
const logs = document.getElementById("activityLogButton")


function loadDashboard() {
    console.log("Loading dashboard");
    loadPage("admin", "dashboard_page.html")
}

async function loadUsers() {
    console.log("Loading users page");
    loadPage("admin", "users_page.html")

    let user = await requestUsers()

    loadUserList(user)

    function loadUserList(list) {
        const userTableView = document.getElementById("AccountsTableView")

        list.forEach(item => {
            userTableView.appendChild(createTableRow(item))
        });
    }

}

function loadLogs() {
    console.log("Loading activity logs");
    loadPage("admin", "logs_page.html")
}

async function requestUsers() {
    return fetch("../../database/sample_users.json")
        .then(request => request.json())
        .then(data => {
            console.log(data);// TODO remove after testing
            return data
        })
}

dashboard.addEventListener('click', loadDashboard)

users.addEventListener('click', loadUsers)

logs.addEventListener('click', () => {
    loadLogs()
})

loadDashboard() // Load the dashboard by default. There is probably a better way of doing this