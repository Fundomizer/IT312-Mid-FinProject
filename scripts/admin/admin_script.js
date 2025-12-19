import { loadPage, fetchCollection, setupPopup } from "../utilities.js"
import { createButton, createTableRow } from "../components.js"
import { HOST, PORT } from "../config.js"
import { displayOrgs } from "./org_script.js"
import { renderDashboard } from "./dashboard_script.js"

const dashbaordNavBut = document.getElementById("dashboardButton")
const usersNavBut = document.getElementById("usersButton")
const logsNavBut = document.getElementById("activityLogButton")
const orgsBut = document.getElementById("orgsButton")
let users = []
let logs = []

async function getProfile() {
    let me = await fetch("/api/auth/profile", {
        method: "POST",
        credentials: "include"
    })
        .then(res => res.json())

    return me
}

async function loadDashboardPage() {

    await loadPage("admin", "dashboard_page.html")
    renderDashboard()
    handleLogout()
}

async function loadUsersPage() {

    await loadPage("admin", "users_page.html", "", "users_script.js")

    users = await fetch("/api/admin/rsc/users", {
        method: "GET",
        credentials: "include"
    }).then(res => res.json())

    displayUsers(users.users)

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
                let elementIds = ['name', 'email', 'password']
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
            let elementIds = ['name', 'email', 'password', 'department', 'organization',]
            elementIds.forEach(id => {
                const element = document.getElementById(id)
                if (element) element.disabled = false
                saveButton.classList.remove('Hidden')
            });
        }

        function handleSave(e) {
            e.preventDefault();
            const userId = form.dataset.userId;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Remove password field if it's empty (don't update password)
            if (!data.password || data.password.trim() === '') {
                delete data.password;
            }

            // Remove empty fields to avoid overwriting with nulls
            Object.keys(data).forEach(key => {
                if (data[key] === '' || data[key] === null) {
                    delete data[key];
                }
            });

            console.log("Sending update data:", data);

            fetch(`/api/admin/user/upd/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(result => {
                    alert(result['message']);
                    loadUsersPage()
                })
                .catch(err => {
                    console.error("Error:", err);
                    alert("Failed to update user: " + err.message);
                });
        }

        function handleDelete(button) {
            const confirmed = confirm(`Are you sure you want to delete user?`);
            if (!confirmed) {
                alert("Delete cancelled.");
                return;
            }

            let userId = button.dataset.userId

            fetch(`/api/admin/user/del/${userId}`, {
                method: "DELETE"
            }).then(response => response.json())
                .then(result => {
                    alert(result['message'])
                    loadUsersPage()
                })
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

        let filtered = users.users;

        filtered = users.users.filter(user =>
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

    // Handle adding the list of organizations to the dropdown
    const orgs = await fetchCollection('org_names')

    let orgsListAdd = document.getElementById('OrgListAdd')
    let orgsListEdit = document.getElementById('organization')
    orgsListAdd.innerHTML = ""
    orgsListEdit.innerHTML = ""
    orgs.forEach(org => {
        const option = document.createElement("option");
        option.value = org['org_name'];
        option.textContent = org['org_name'];

        orgsListAdd.appendChild(option);
        orgsListEdit.appendChild(option.cloneNode(true));
    })
}

async function loadLogsPage() {

    await loadPage("admin", "logs_page.html")

    logs = await fetch("/api/admin/rsc/log", {
        method: "GET",
        credentials: "include"
    }).then(res => res.json())

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

    displayLog(logs.logs)

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

        let filtered = logs.logs

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

async function loadOrgsPage() {

    await loadPage("admin", "student_org_page.html", "", "")

    displayOrgs()

}

function handleLogout() {
    let logoutButton = document.getElementById('LogoutButton')
    logoutButton.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            console.log(data);

            if (res.ok && data.success) {
                window.location.href = '/';
            } else {
                alert('Logout failed.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while logging out.');
        }
    });

}

async function setTexts() {
    const profile = await getProfile()
    document.getElementById('UsernameLabel').innerHTML = profile.user.email
}

dashbaordNavBut.addEventListener('click', loadDashboardPage)

usersNavBut.addEventListener('click', loadUsersPage)

logsNavBut.addEventListener('click', loadLogsPage)

orgsBut.addEventListener('click', loadOrgsPage)

loadDashboardPage()
setTexts()
