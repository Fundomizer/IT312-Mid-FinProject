/**
 * Dynamically loads and injects a HTML file into the container, "Content". Provide the file name for the style and script if you intend to use a different file for them.
 * 
 * @param {String} role User type. Should match the directory name. Values should be "admin", "org", or "osa".
 * @param {String} page HTML page being loaded into the container, "Content".
 * @param {String} style Defaults to an empty string. File name of the style sheet the page uses, it should include the file exntension.
 * @param {String} script Defaults to an empty string. File name of the script the page uses, it should include the file extension.
 * @param {String} loadInto Default as "Content". ID of the container to load the page into
 */
export function loadPage(role, page, style, script,
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
            if (style) loadCSS(pathToStyle);
            if (script) loadScript(pathToScript);
        });

    function loadScript(src) {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) existingScript.remove();

        const script = document.createElement("script");
        script.src = `${src}?v=${Date.now()}`; // cache busting to ensure latest version is loaded
        script.defer = true;
        document.body.appendChild(script);
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
/**
 * Loads the default OSA page
 */
document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "create-form-btn") {
        loadPage("osa", "forms_creation.html", "osa_forms_creation_style.css", "forms_creation_script.js");
    }
});
document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "backBtn") {
        loadPage("osa", "forms_page.html", "osa_forms_style.css", "forms_script.js");
    }
});
/**
 * Fetches data from an endpoint
 * @param {String} collection Name of the collection
 * @param {*} URI 
 * @returns 
 */
export async function fetchCollection(collection, URI = "") {
    const endpoint = URI || `http://localhost/MongoDB/index.php?collection=${collection}`;
    return fetch(endpoint)
        .then(request => request.json())
        .then(data => data)
}
