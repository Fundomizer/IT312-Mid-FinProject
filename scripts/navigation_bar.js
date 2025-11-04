const sideNavButton = document.getElementById("ToggleSideNavButton");
const sideNav = document.getElementById("SideNav");
const logoutButton = document.getElementById("Logout");

// Toggle SideNav + overlay
sideNavButton.addEventListener("click", () => {
  sideNav.classList.toggle("expanded");
  document.body.classList.toggle("nav-open");
});

// Close SideNav if overlay is clicked
document.body.addEventListener("click", (e) => {
  if (document.body.classList.contains("nav-open")) {
    // if click is on the overlay (the ::after pseudo-element)
    if (e.target === document.body) {
      sideNav.classList.remove("expanded");
      document.body.classList.remove("nav-open");
    }
  }
});

// Logout button
logoutButton.addEventListener("click", () => {
  window.location.href = "/IT312-Mid-FinProject/index.html";
});