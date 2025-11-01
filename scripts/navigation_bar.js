const sideNavContent = document.getElementsByClassName("SideNavContent")
const sideNavButton = document.getElementById("ToggleSideNavButton");
const sideNav = document.getElementById("SideNav");
const logoutButton = document.getElementById("Logout")

sideNavButton.addEventListener("click", function () {
    sideNav.classList.toggle("expanded");
    console.log("Clicked");
});

logoutButton.addEventListener('click', () => {
    window.location.href = "/index.html";
})