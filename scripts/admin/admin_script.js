import { loadPage, fetchCollection, setupPopup } from "../utilities.js"
import { createButton, createTableRow } from "../components.js"

const dashbaordNavBut = document.getElementById("dashboardButton")
const usersNavBut = document.getElementById("usersButton")
const logsNavBut = document.getElementById("activityLogButton")
let users = []
let logs = []

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
            let tr = createTableRow(item, ["name", "email", "role", "date_created"])
            let container = document.createElement("td")
            let viewButton = createButton("View", "")
            let deleteButton = createButton("Delete", deleteFunction)

            container.appendChild(viewButton)
            container.appendChild(deleteButton)
            tr.appendChild(container)

            userTableView.appendChild(tr)
            viewFunction(viewButton, item)
        });

        function viewFunction(openBtn, details) {
            let popup = document.getElementById("DetailsPopup")
            let xButton = document.getElementById("XButton")
            setupPopup(popup, openBtn, xButton, onOpen, onClose)

            function onOpen() {
                Object.entries(details).forEach(([key, value]) => {
                    const element = document.querySelector(`#DetailsForm #${key}`)
                    if (element) {
                        element.value = value != null ? value : "";
                    }
                })

                const roleSelect = document.getElementById('AssignedRole');
                if (roleSelect) {
                    let role = details['role']
                    switch (role.toLowerCase()) {
                        case 'osa':
                            roleSelect.value = "OSA"
                            break
                        case 'admin':
                            roleSelect.value = "Admin"
                            break
                        case 'student organization user':
                            roleSelect.value = "ORG"
                            break
                    }

                }

                const osaForm = document.getElementById("DetailsOsaForm");
                const orgForm = document.getElementById("DetailsOrgForm");

                if (details['department']) {
                    osaForm.classList.remove("Hidden");
                    orgForm.classList.add("Hidden");
                } else if (details['organization']) {
                    orgForm.classList.remove("Hidden");
                    osaForm.classList.add("Hidden");
                } else {
                    osaForm.classList.add("Hidden");
                    orgForm.classList.add("Hidden");
                }
            }

            function onClose() {
                // Clear the inptus
                let elementIds = ['name', 'email', 'password', 'department', 'organization']
                elementIds.forEach(id => {
                    const element = document.querySelector(`#DetailsForm #${id}`)
                    if (element) {
                        element.innerHTML = ""
                    }
                });
            }

            function onEdit() {
                
            }
        }

        function deleteFunction() {
            
        }

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

dashbaordNavBut.addEventListener('click', loadDashboardPage)

usersNavBut.addEventListener('click', loadUsersPage)

logsNavBut.addEventListener('click', loadLogsPage)

loadDashboardPage()