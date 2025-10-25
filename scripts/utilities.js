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
            label: "Overview", icon: "📊", onClick: () => loadPage("osa", "overview_page.html", "osa_overview_style.css", "overview_script.js")
        },
        {
            label: "Forms", icon: "👥", onClick: () => loadPage("osa", "forms_page.html", "osa_forms_style.css", "forms_script.js")
        },
        {
            label: "Repository", icon: "🏫", onClick: () => loadPage("osa", "repository_page.html", "osa_repository_style.css", "repository_script.js")
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
function loadNav(userType = "osa") {
    console.log(userType);

    const list = document.createElement("ul")
    navButs[userType].forEach(element => {
        list.appendChild(createNavItem(element))
    })

    sideNavContent[0].appendChild(list);
}


/**
 * Dynamically loads and injects a HTML file into the container, "Content". Provide the file name for the style and script if you intend to use a different file for them.
 * 
 * @param {String} role User type. Should match the directory name. Values should be "admin", "org", or "osa".
 * @param {String} page HTML page being loaded into the container, "Content".
 * @param {String} style Defaults to an empty string. File name of the style sheet the page uses, it should include the file exntension.
 * @param {String} script Defaults to an empty string. File name of the script the page uses, it should include the file extension.
 * @param {String} loadInto Default as "Content". ID of the container to load the page into
 */
export function loadPage(role, page,
    style = "", script = "",
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
