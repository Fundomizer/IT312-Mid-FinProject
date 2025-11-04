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

    let users = await fetchUsers()

    displayUsers(users)

    function displayUsers(list) {
        const userTableView = document.getElementById("AccountsTableView")

        list.forEach(item => {
            userTableView.appendChild(createTableRow(item, ["name", "email", "role", "date_created"]))
        });



    }

    async function fetchUsers() {
        return fetch(`http://localhost/MongoDB/index.php?collection=users`)
            .then(request => request.json())
            .then(data => data)
    }

}

async function loadLogs() {
    console.log("Loading activity logs");
    loadPage("admin", "logs_page.html")

    let logs = await fetchLogs();

    displayLog(logs)

    async function fetchLogs() {
        return fetch('http://localhost/MongoDB/index.php?collection=log')
            .then(request => request.json())
            .then(data => {
                console.log("Logs: ", data);
                return data
            })
    }

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