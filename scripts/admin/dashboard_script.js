
export function renderDashboard() {
    getLogsCount()
    getUserCount()
}

async function getUserCount() {
    let users = await fetch("/api/admin/rsc/users", {
        method: "GET",
        credentials: "include"
    }).then(res => res.json())

    const totalUsers = document.querySelector("#TotalUsers b");
    totalUsers.textContent = users['users'].length;
}

async function getLogsCount() {
    let logs = await fetch("/api/admin/rsc/log", {
        method: "GET",
        credentials: "include"
    }).then(res => res.json())

    const totalLogs = document.querySelector("#ActivityLogs b");
    totalLogs.textContent = logs['logs'].length;
}