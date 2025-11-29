import { loadPage, fetchCollection } from "../utilities.js"
import { createTableRow } from "../components.js"

const dashboard = document.getElementById("dashboardButton")
const users = document.getElementById("usersButton")
const logs = document.getElementById("activityLogButton")

async function loadDashboardPage() {

    loadPage("admin", "dashboard_page.html")

    let users = await fetchCollection('users')
    let logs = await fetchCollection('log')

    const totalUsers = document.querySelector("#TotalUsers b");
    const totalLogs = document.querySelector("#ActivityLogs b");

    totalUsers.textContent = users.length;
    totalLogs.textContent = logs.length;
}

async function loadUsersPage() {
    console.log("Loading users page");
    loadPage("admin", "users_page.html", "", "users_script.js")

    let users = await fetchCollection('users')

    displayUsers(users)

    function displayUsers(list) {
        const userTableView = document.getElementById("AccountsTableView")

        list.forEach(item => {
            userTableView.appendChild(createTableRow(item, ["name", "email", "role", "date_created"]))
        });

    }

}

async function loadLogsPage() {
    console.log("Loading activity logs");
    loadPage("admin", "logs_page.html")

    let logs = await fetchCollection('log')

    displayLog(logs)

    /**
     * Displays the list of logs, appends a "Log" into the "Logs" div
     * @param {JSON} logs 
     */
    function displayLog(logs) {
        const logsDisplay = document.getElementById("AccountsTableView")

        logs.forEach(item => {
            logsDisplay.appendChild(createTableRow(item, ["action", "name", "activity", "date", "time"]))
        });
    }

}

dashboard.addEventListener('click', loadDashboardPage)

users.addEventListener('click', loadUsersPage)

logs.addEventListener('click', loadLogsPage)

loadDashboardPage()