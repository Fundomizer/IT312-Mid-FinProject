import { HOST, PORT } from "./config.js";

/**
 * Check if the session is still valid
 */
async function checkSession() {
    try {
        const res = await fetch(`${HOST}:${PORT}/api/auth/profile`, {
            credentials: "include",
            method: "POST"
        });

        const data = await res.json();

        if (!data.loggedIn) {
            alert("Your session has expired. Please log in again.");
            window.location.href = "/IT312-Mid-FinProject/index.html";
        }
    } catch (err) {
        console.error("Session check failed:", err);
    }
}

// Periodically check if the session is still valid
checkSession();
let seconds = 60;
setInterval(checkSession, 1000 * seconds); // This in miliseconds

window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        // Page was restored from bfcache
        window.location.reload();
    }
});
