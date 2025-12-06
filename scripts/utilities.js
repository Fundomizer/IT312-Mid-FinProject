import { HOST } from "./config";

/**
 * Dynamically loads and injects a HTML file into the container, "Content". Provide the file name for the style and script if you intend to use a different file for them.
 *
 * @param {String} role User type. Should match the directory name. Values should be "admin", "org", or "osa".
 * @param {String} page HTML page being loaded into the container, "Content".
 * @param {String} style Defaults to an empty string. File name of the style sheet the page uses, it should include the file exntension.
 * @param {String} script Defaults to an empty string. File name of the script the page uses, it should include the file extension.
 * @param {String} loadInto Default as "Content". ID of the container to load the page into
 */
export function loadPage(role, page, style, script, loadInto = "Content") {
  let pathToPage = `../../pages/${role}/${page}`;
  let pathToScript = `../../scripts/${role}/${script}`;
  let pathToStyle = `../../styles/${role}/${style}`;
  const HOST = window.location.origin;
  fetch(pathToPage)
    .then((result) => result.text()) // Convert into html text
    .then((htmlText) => {
      // Parse and grab the #PageContent only to ensure that you don't get the Head tag from the HTML element
      const parser = new DOMParser();
      const html = parser.parseFromString(htmlText, "text/html");
      const mainContent = html.querySelector("#PageContent");
      document.getElementById(loadInto).innerHTML = mainContent.innerHTML;




      // Load CSS and Script into assigned to that page
      if (style) loadCSS(pathToStyle);
      if (script) loadScript(pathToScript);
    });




  function loadScript(src) {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) existingScript.remove();




    const script = document.createElement("script");
    script.src = `${src}?v=${Date.now()}`; // cache busting to ensure latest version is loaded
    script.type = "module";
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
    loadPage(
      "osa",
      "forms_creation.html",
      "osa_forms_creation_style.css",
      "forms_creation_script.js"
    );
  }
});
document.addEventListener("click", (event) => {
  if (event.target && event.target.id === "backBtn") {
    loadPage(
      "osa",
      "forms_page.html",
      "osa_forms_style.css",
      "forms_script.js"
    );
  }
});






/**
 * Fetches data from an endpoint.
 * NOTE: This function is specifically for fetching from the Node server and not PHP server
 * @param {String} collection Name of the collection
 * @param {String} URI
 * @returns
 */
export async function fetchCollection(collection, URI = "", Port = 8123) {




  const HOST = window.location.origin; // Host machine's IP
  const endpoint =
    URI ||
    `${HOST}:${Port}/api/${collection}`;




  return fetch(endpoint)
    .then((request) => request.json())
    .then((data) => data);
}




/**
 * @param {HTMLElement} popup The popup container element.
 * @param {HTMLElement} openBtn The button that triggers opening the popup.
 * @param {HTMLElement} closeBtn The button that closes the popup.
 * @param {Function} onOpen - Optional callback to run when popup opens.
 */
export function setupPopup(popup, openBtn, closeBtn, onOpen = null, onClose = null) {
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      popup.style.display = "block";
      if (typeof onOpen === "function") onOpen();
    });
  }




  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
      if (typeof onOpen === "function") onClose();
    });
  }




  window.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.style.display = "none";
      if (typeof onOpen === "function") onClose();
    }
  });
}
