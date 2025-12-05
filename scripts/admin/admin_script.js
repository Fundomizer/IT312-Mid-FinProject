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

    loadPage("admin", "users_page.html", "", "users_script.js")

    users = await fetchCollection('users')

    displayUsers(users)

    // Hook functions to filtering stuff
    document.getElementById('SearchInput').addEventListener('input', handleFilter)
    document.getElementById('RolesFilter').addEventListener('change', handleFilter)
    document.getElementById('DateFilter').addEventListener('change', handleFilter)
    document.getElementById('AlphaFilter').addEventListener('change', handleFilter)
    document.getElementById('StartDate').addEventListener('change', handleFilter)
    document.getElementById('EndDate').addEventListener('change', handleFilter)


    function displayUsers(list) {
        const userTableView = document.getElementById("AccountsTableView")
        let editButton = document.getElementById("EditButton")
        let saveButton = document.getElementById("SaveButton")
        let form = document.getElementById('DetailsForm')

        userTableView.innerHTML = `<tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Action</th>
                    </tr>`;

        editButton.addEventListener('click', handleEdit)
        form.addEventListener('submit', (e) => handleSave(e))

        list.forEach(item => {
            let tr = createTableRow(item, ["name", "email", "role", "date_created"])
            let container = document.createElement("td")
            let viewButton = createButton("View")
            let deleteButton = createButton("Delete")



            viewButton.dataset.userId = item._id;
            deleteButton.dataset.userId = item._id;
            handleView(viewButton, item)
            deleteButton.addEventListener('click', (event) => handleDelete(event.currentTarget))

            container.appendChild(viewButton)
            container.appendChild(deleteButton)
            tr.appendChild(container)

            userTableView.appendChild(tr)
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


            const HOST = window.location.origin;
            fetch(`${HOST}:8123/api/users/${userId}`, {
                method: "DELETE"
            }).then(response => response.json())
                .then(result => alert(result['message']))
                .catch(err => console.error("Error:", err));
        }

    }

    function handleFilter() {
        const term = document.getElementById('SearchInput').value.toLowerCase();
        const role = document.getElementById('RolesFilter').value
        const dateSort = document.getElementById('DateFilter').value
        const alphaSort = document.getElementById('AlphaFilter').value
        const startDate = document.getElementById('StartDate').value
        const endDate = document.getElementById('EndDate').value

        let filtered = users;

        filtered = users.filter(user =>
            user['name']?.toLowerCase().includes(term) ||
            user['email']?.toLowerCase().includes(term) ||
            user['organization']?.toLowerCase().includes(term) ||
            user['department']?.toLowerCase().includes(term)
        );

        // Role filter
        if (role && role !== "All") {
            filtered = filtered.filter(user => {

                return user['role'] === role
            });
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            filtered = filtered.filter(user => {
                const userDate = new Date(user.date_created);
                return userDate >= start && userDate <= end;
            });
        }

        if (dateSort === "newest") {
            filtered.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
        } else if (dateSort === "oldest") {
            filtered.sort((a, b) => new Date(a.date_created) - new Date(b.date_created));
        }

        if (alphaSort === "asc") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (alphaSort === "desc") {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        }

        displayUsers(filtered)
    }
}

async function loadLogsPage() {

    loadPage("admin", "logs_page.html")

    logs = await fetchCollection('log')

    let searchInput = document.getElementById('SearchInput')
    let dateFilter = document.getElementById('DateFilter')
    let alphaFilter = document.getElementById('AlphaFilter')
    let startDateFilter = document.getElementById('StartDate')
    let endDateFilter = document.getElementById('EndDate')

    searchInput.addEventListener('input', handleFilter)
    dateFilter.addEventListener('change', handleFilter)
    alphaFilter.addEventListener('change', handleFilter)
    startDateFilter.addEventListener('change', handleFilter)
    endDateFilter.addEventListener('change', handleFilter)

    displayLog(logs)

    /**
     * Displays the list of logs, appends a "Log" into the "Logs" div
     * @param {JSON} logs 
     */
    function displayLog(logs) {
        const logsDisplay = document.getElementById("LogsTableView")

        logsDisplay.innerHTML = `<tr>
                        <th>Action</th>
                        <th>User</th>
                        <th>Activity</th>
                        <th>Date</th>
                        <th>Time</th>
                    </tr>`

        logs.forEach(item => {
            logsDisplay.appendChild(createTableRow(item, ["action", "name", "activity", "date", "time"]))
        });
    }

    function handleFilter() {

        const term = searchInput.value.toLowerCase();
        const dateSort = dateFilter.value
        const alphaSort = alphaFilter.value
        const startDate = startDateFilter.value
        const endDate = endDateFilter.value

        let filtered = logs

        if (term) {
            filtered = filtered.filter(log =>
                log["name"]?.toLowerCase().includes(term) ||
                log["action"]?.toLowerCase().includes(term) ||
                log['activity']?.toLowerCase().includes(term) ||
                log['date']?.toLowerCase().includes(term) ||
                log['time']?.toLowerCase().includes(term)
            );
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            filtered = filtered.filter(log => {
                const logDate = new Date(log['date']); // assumes YYYY-MM-DD
                return logDate >= start && logDate <= end;
            });
        }

        if (dateSort === "newest") {
            filtered.sort((a, b) => new Date(b['date']) - new Date(a['date']));
        } else if (dateSort === "oldest") {
            filtered.sort((a, b) => new Date(a['date']) - new Date(b['date']));
        }

        if (alphaSort === "asc") {
            filtered.sort((a, b) => a['name'].localeCompare(b['name']));
        } else if (alphaSort === "desc") {
            filtered.sort((a, b) => b['name'].localeCompare(a['name']));
        }

        displayLog(filtered)
    }
}

dashbaordNavBut.addEventListener('click', loadDashboardPage)

usersNavBut.addEventListener('click', loadUsersPage)

logsNavBut.addEventListener('click', loadLogsPage)

loadDashboardPage()