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

//logout button
logoutButton.addEventListener("click", async () => {
  try {
    let role = null;

    try {
      const phpCheck = await fetch(`${PHP_HOST}/IT312-Mid-FinProject/server/php/osa_check.php`, {
        credentials: "include"
      });
      const phpData = await phpCheck.json();
      if (phpData.loggedIn) role = phpData.user.role;
    } catch {
      role = null;
    }

    localStorage.clear();

    if (role === 'OSA') {
      const phpLogout = await fetch(`${PHP_HOST}/IT312-Mid-FinProject/server/php/logout.php`, {
        method: "POST",
        credentials: "include"
      });
      const phpLogoutData = await phpLogout.json();
      console.log("PHP logout:", phpLogoutData);

      window.location.href = `${HOST}:${PORT}`;
    } else {
      // FOR NODE SERVER
      const nodeLogout = await fetch(`/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      const nodeData = await nodeLogout.json();
      console.log("Node logout:", nodeData);

      if (!nodeData.success) {
        alert("Node logout failed");
        return;
      }

     window.location.href = `${HOST}`;
    }
  } catch (err) {
    console.error("Logout error:", err);
    alert("Unexpected logout error");
  }
});

