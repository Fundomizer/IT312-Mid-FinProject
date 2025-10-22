const sideNavButton = document.getElementById("ToggleSideNavButton");
const sideNav = document.getElementById("SideNav");

sideNavButton.addEventListener("click", function(){
    sideNav.classList.toggle("expanded");
    console.log("Clicked");
});