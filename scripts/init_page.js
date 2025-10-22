// This script will be for dynamically generating the buttons for the navigation.
const sideNavContent = document.getElementsByClassName("SideNavContent")
const sideNavButton = document.getElementById("ToggleSideNavButton");
const sideNav = document.getElementById("SideNav");

// TODO This code doesn't feel safe
const navButs = {
    admin: [
        {
            label: "Users", icon: "📊", onClick: () => console.log("Navigating to users")
        },
        {
            label: "Logs", icon: "👥", onClick: () => console.log("Navigating to logs")
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
function loadNav(userType = "org") {
    console.log(userType);

    const list = document.createElement("ul")
    navButs[userType].forEach(element => {
        list.appendChild(createNavItem(element))
    })

    sideNavContent[0].appendChild(list);
}


// Reusable function for creating nav bar buttons
function createNavItem({ icon, label, onClick }) {
    const li = document.createElement("li");

    const button = document.createElement("button");
    button.classList.add("NavItems");

    const iconSpan = document.createElement("span");
    iconSpan.classList.add("icon");
    iconSpan.textContent = icon;

    const labelSpan = document.createElement("span");
    labelSpan.classList.add("label");
    labelSpan.textContent = label;

    button.appendChild(iconSpan);
    button.appendChild(labelSpan);

    if (onClick) button.addEventListener("click", onClick);

    li.appendChild(button);
    return li;
}

loadNav()

sideNavButton.addEventListener("click", function () {
    sideNav.classList.toggle("expanded");
    console.log("Clicked");
});

function loadPage(page) {
    fetch(page)
        .then(result => result.text()) // Convert into html text
        .then(html => document.getElementsByClassName("Content")[0].innerHTML = html);
}

loadPage("../pages/admin/users_page.html")