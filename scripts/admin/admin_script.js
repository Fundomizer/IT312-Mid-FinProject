import { loadPage } from "../utilities.js"

const dashboard = document.getElementById("dashboardButton")
const users = document.getElementById("usersButton")
const logs = document.getElementById("activityLogButton")

console.log(dashboard);
console.log(users);
console.log(logs);

dashboard.addEventListener('click', () => {
    console.log("Loading dashboard");
    loadPage("admin", "dashboard_page.html")
})

users.addEventListener('click', () => {
    console.log("Loading users page");
    loadPage("admin", "users_page.html")
})

logs.addEventListener('click', () => {
    console.log("Loading activity logs");
    loadPage("admin", "logs_page.html")
})
