import { loadPage } from "../utilities.js";

const overview = document.getElementById("overviewButton");
const forms = document.getElementById("formsButton");
const repository = document.getElementById("repositoryButton");
    loadPage("osa", "overview_page.html", "osa_overview_style.css", "overview_script.js");

overview.addEventListener("click", function(){
    console.log("Loading overview page");
    loadPage("osa", "overview_page.html", "osa_overview_style.css", "overview_script.js");
});

forms.addEventListener("click", function(){
    console.log("Loading forms page");
    loadPage("osa", "forms_page.html", "osa_forms_style.css", "forms_script.js");
});

repository.addEventListener("click", function(){
    console.log("Loading repository page");
    loadPage("osa", "repository_page.html", "osa_repository_style.css", "repository_script.js");
});