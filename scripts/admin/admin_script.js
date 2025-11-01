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

    displayUsers(user)

    function displayUsers(list) {
        const userTableView = document.getElementById("AccountsTableView")

        list.forEach(item => {
            userTableView.appendChild(createTableRow(item, ["name", "email", "role", "date_created"]))
        });

        

    }

    async function requestUsers() {
        let PORT = 3000; // TODO hard code the port for now
        return fetch(`http://localhost:${PORT}/api/users`)
            .then(request => request.json())
            .then(data => {
                console.log(data);// TODO remove after testing
                return data
            })
    }

}

function loadLogs() {
    console.log("Loading activity logs");
    loadPage("admin", "logs_page.html")


    /**
     * Displays the list of logs
     * @param {JSON} logs 
     */
    function displayLog(logs) {
        const logsDisplay = document.getElementById("Logs")

        logs.forEach(item => {
            logsDisplay.appendChild(createLog(item))
        });
    }

    /**
     * Creates a log card element based on the object passed.
     * @param {Object} log - The log object
     * @param {string} log.user - The user name
     * @param {string} log.activity - The activity description
     * @param {string} log.timestamp - The date/time string
     * @returns {HTMLDivElement} The constructed log card
     */
    function createLog(log) {
        const div = document.createElement("div");
        div.classList.add("Log", "SubCard");

        const userP = document.createElement("p");
        userP.id = "UserLogLabel";
        userP.textContent = log.user;

        const activityP = document.createElement("p");
        activityP.id = "ActivityLogLabel";
        activityP.textContent = log.activity;

        const timeP = document.createElement("p");
        timeP.id = "TimeStampLogLabel";
        timeP.textContent = log.timestamp;

        div.appendChild(userP);
        div.appendChild(activityP);
        div.appendChild(timeP);

        return div;
    }



}

dashboard.addEventListener('click', loadDashboard)

users.addEventListener('click', loadUsers)

logs.addEventListener('click', () => {
    loadLogs()
})

loadDashboard() // Load the dashboard by default. There is probably a better way of doing this