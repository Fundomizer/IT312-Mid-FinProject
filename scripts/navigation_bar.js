import { HOST, PHP_HOST, PORT } from "./config.js";

const sideNavButton = document.getElementById("ToggleSideNavButton");
const sideNav = document.getElementById("SideNav");
const logoutButton = document.getElementById("Logout");
const usernameLabel = document.getElementById('UsernameLabel');
usernameLabel.innerText = localStorage.getItem("username") || "";

// Toggle SideNav + overlay
sideNavButton.addEventListener("click", () => {
  sideNav.classList.toggle("expanded");
  document.body.classList.toggle("nav-open");
});

// Close SideNav if overlay is clicked
document.body.addEventListener("click", (e) => {
  if (document.body.classList.contains("nav-open")) {
    if (e.target === document.body) {
      sideNav.classList.remove("expanded");
      document.body.classList.remove("nav-open");
    }
  }
});

// Logout button
if (logoutButton) logoutButton.addEventListener("click", () => {
  localStorage.clear();
  fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include"
  })
    .then(res => res.json())
    .then(async data => {
      console.log(data);
      if (data.success) {

        await fetch(`${HOST}/IT312-Mid-FinProject/server/php/logout.php`, {
          method: "POST",
          credentials: "include"
        });

        window.location.href = "/IT312-Mid-FinProject/index.html";
      } else {
        alert("Logout failed");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Unexpected logout error");
    });
});
