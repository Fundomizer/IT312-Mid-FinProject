import { API_BASE_URL } from "./config.js";

/**
 * Check if the session is still valid
 */
async function checkSession() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            credentials: "include",
            method: "POST"
        });

        console.log("Heartbeat, Current time ", new Date());


        const data = await res.json();

        console.log("Data", data);

        if (!data.loggedIn) {
            alert("Your session has expired. Please log in again.");
            window.location.href = "/IT312-Mid-FinProject/index.html";
        }
    } catch (err) {
        console.error("Session check failed:", err);
    }
}

checkSession();
let seconds = 60;
setInterval(checkSession, 1000 * seconds); // This in miliseconds
