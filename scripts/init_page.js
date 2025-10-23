import { createNavItem } from "./components.js";

// This script will be for dynamically generating the buttons for the navigation.
const sideNavContent = document.getElementsByClassName("SideNavContent")
const sideNavButton = document.getElementById("ToggleSideNavButton");
const sideNav = document.getElementById("SideNav");

// TODO This code doesn't feel safe
// Might need a better way for structuring this thing
const navButs = {
    admin: [
        {
            label: "Users", icon: "📊", onClick: () => loadPage("../pages/admin/users_page.html")
        },
        {
            label: "Logs", icon: "👥", onClick: () => loadPage("../pages/admin/logs_page.html")
        }
    ],
    osa: [
        {
            label: "Overview", icon: "📊", onClick: () => console.log("Navigating to overview")
        },
        {
            label: "Forms", icon: "👥", onClick: () => console.log("Navigating to forms")
        },
        {
            label: "Forms", icon: "🏫", onClick: () => console.log("Navigating to repository")
        }
    ],
    org: [
        {
            label: "Assigned forms", icon: "📊", onClick: () => console.log("Navigating to assigned forms")
        },
        {
            label: "Manual submit", icon: "👥", onClick: () => console.log("Navigating to manual submit")
        },
        {
            label: "History", icon: "🏫", onClick: () => console.log("Navigating to history")
        }
    ]

}

// NOTE change userType to either admin, osa, or org
// This default value will be changed later on
function loadNav(userType = "admin") {
    console.log(userType);

    const list = document.createElement("ul")
    navButs[userType].forEach(element => {
        list.appendChild(createNavItem(element))
    })

    sideNavContent[0].appendChild(list);
}

function loadPage(page) {
    fetch(page)
        .then(result => result.text()) // Convert into html text
        .then(html => document.getElementsByClassName("Content")[0].innerHTML = html);
}

loadNav()

sideNavButton.addEventListener("click", function () {
    sideNav.classList.toggle("expanded");
    console.log("Clicked");
});

loadPage("../pages/admin/users_page.html")
