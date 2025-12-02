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

        let editButton = document.getElementById("EditButton")
        let saveButton = document.getElementById("SaveButton")
        let form = document.getElementById('DetailsForm')

        editButton.addEventListener('click', handleEdit)
        form.addEventListener('submit', (e) => handleSave(e))

        list.forEach(item => {
            let tr = createTableRow(item, ["name", "email", "role", "date_created"])
            let container = document.createElement("td")
            let viewButton = createButton("View")
            let deleteButton = createButton("Delete")

            // Attach the MongoDB _id to the buttons
            viewButton.dataset.userId = item._id;
            deleteButton.dataset.userId = item._id;
            deleteButton.addEventListener('click', (event) => handleDelete(event.currentTarget))

            container.appendChild(viewButton)
            container.appendChild(deleteButton)
            tr.appendChild(container)

            userTableView.appendChild(tr)
            handleView(viewButton, item)
        });

        function handleView(openBtn, details) {
            let popup = document.getElementById("DetailsPopup")
            let xButton = document.getElementById("XButton")
            setupPopup(popup, openBtn, xButton, onOpen, onClose)

            function onOpen() {
                form.dataset.userId = openBtn.dataset.userId
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
                    const element = document.getElementById(id)
                    if (element) {
                        element.disabled = true
                        element.innerHTML = ""
                        saveButton.classList.add("Hidden")
                    }
                });
            }
        }

        function handleEdit() {
            let elementIds = ['name', 'email', 'password', 'department', 'organization']
            elementIds.forEach(id => {
                const element = document.getElementById(id)
                if (element) element.disabled = false
                saveButton.classList.remove('Hidden')
            });
        }

        function handleSave(e) {
            e.preventDefault();
            const userId = form.dataset.userId;
            const data = Object.fromEntries(new FormData(form).entries());
            console.log("User ID ", userId);

            const HOST = window.location.origin;
            fetch(`${HOST}:8123/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(response => response.json())
                .then(result => alert(result['message']))
                .catch(err => console.error("Error:", err));

        }

        function handleDelete(button) {
            const confirmed = confirm(`Are you sure you want to delete user?`);
            if (!confirmed) {
                alert("Delete cancelled.");
                return;
            }

            let userId = button.dataset.userId
            console.log("Deleting ", userId);

            const HOST = window.location.origin;
            fetch(`${HOST}:8123/api/users/${userId}`, {
                method: "DELETE"
            }).then(response => response.json())
                .then(result => alert(result['message']))
                .catch(err => console.error("Error:", err));
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