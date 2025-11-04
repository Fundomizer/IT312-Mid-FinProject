import { loadPage, fetchCollection } from "../utilities.js"
import { createTableRow } from "../components.js"

const dashboard = document.getElementById("dashboardButton")
const users = document.getElementById("usersButton")
const logs = document.getElementById("activityLogButton")

async function loadDashboard() {

    loadPage("admin", "dashboard_page.html")

    let users = await fetchCollection('users')
    let logs = await fetchCollection('log')

    const totalUsers = document.querySelector("#TotalUsers b");
    const totalLogs = document.querySelector("#ActivityLogs b");

    totalUsers.textContent = users.length;
    totalLogs.textContent = logs.length;
}

async function loadUsers() {
    console.log("Loading users page");
    loadPage("admin", "users_page.html")

    let users = await fetchCollection('users')

    displayUsers(users)

    function displayUsers(list) {
        const userTableView = document.getElementById("AccountsTableView")

        list.forEach(item => {
            userTableView.appendChild(createTableRow(item, ["name", "email", "role", "date_created"]))
        });

    }

}

async function loadLogs() {
    console.log("Loading activity logs");
    loadPage("admin", "logs_page.html")

    let logs = await fetchCollection('log')

    displayLog(logs)

    /**
     * Displays the list of logs, appends a "Log" into the "Logs" div
     * @param {JSON} logs 
     */
    function displayLog(logs) {
        const logsDisplay = document.getElementById("Logs")

        logs.forEach(item => {
            logsDisplay.appendChild(createLog(item))
        });
    }

    function createLog(log) {

        // Create main container
        const card = document.createElement("div");
        card.className = "SubCard Log";

        // User section
        const userDiv = document.createElement("div");
        const userLabel = document.createElement("p");
        userLabel.textContent = log["name"];

        const activityType = document.createElement("p");
        activityType.className = "Tag";
        activityType.textContent = log["action"];

        userDiv.appendChild(userLabel);
        userDiv.appendChild(activityType);

        // Activity, date, and time
        const activityDiv = document.createElement("div");
        const activityLabel = document.createElement("p");
        activityLabel.textContent = log["activity"];

        const timeStamp = document.createElement("p");
        timeStamp.textContent = `${log["date"]}, ${log["time"]}`;


        activityDiv.appendChild(activityLabel);
        activityDiv.appendChild(timeStamp);


        // Put it all together
        card.appendChild(userDiv);
        card.appendChild(activityDiv);

        return card;
    }



}

dashboard.addEventListener('click', loadDashboard)

users.addEventListener('click', loadUsers)

logs.addEventListener('click', () => {
    loadLogs()
})

loadDashboard() // Load the dashboard by default. There is probably a better way of doing this