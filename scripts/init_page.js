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
            label: "Repository", icon: "🏫", onClick: () => console.log("Navigating to repository")
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

/**
 * Dynamically loads and injects a HTML file into the container, "Content".
 * @param {String} role User type. Should match the directory name. Values should be "admin", "org", or "osa".
 * @param {String} page HTML page being loaded into the container, "Content".
 * @param {String} style File name of the style sheet the page uses, it should include the file exntension.
 * @param {String} script File name of the script the page uses, it should include the file extension.
 * @param {String} loadInto Default as "Content". ID of the container to load the page into
 */
function loadPage(role="admin", page="users_page.html",
    style="users_style.css", script="users_script.js",
    loadInto = "Content") {

    let pathToPage = `../../pages/${role}/${page}`
    let pathToScript = `../../scripts/${role}/${script}`
    let pathToStyle = `../../styles/${role}/${style}`

    fetch(pathToPage)
        .then(result => result.text()) // Convert into html text
        .then(htmlText => {
            // Parse and grab the #PageContent only to ensure that you don't get the Head tag from the HTML element
            const parser = new DOMParser()
            const html = parser.parseFromString(htmlText, "text/html")
            const mainContent = html.querySelector("#PageContent");
            document.getElementById(loadInto).innerHTML = mainContent.innerHTML

            // Load CSS and Script into assigned to that page
            if (pathToStyle) loadCSS(pathToStyle);
            if (pathToScript) loadScript(pathToScript);
        });

    function loadScript(src) {
        if (!document.querySelector(`script[src="${src}"]`)) {
            const script = document.createElement("script");
            script.src = src;
            script.defer = true;
            document.body.appendChild(script);
        }
    }

    function loadCSS(href) {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            document.head.appendChild(link);
        }
    }

}

// initalise side bar buttons
sideNavButton.addEventListener("click", function () {
    sideNav.classList.toggle("expanded");
    console.log("Clicked");
});

loadPage()