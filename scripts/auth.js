import { HOST, PORT } from "./config.js";

/**
 * Check if the session is still valid
 */
async function checkSession() {
    try {
        const res = await fetch(`/api/auth/profile`, {
            method: "POST",
            credentials: "include"
        });

        console.log("Session is still valid");
        if (res.status === 401) {
            // Boot out if the session is now invalid or "expired"
            window.location.href = "/";
            return;
        }
    } catch (err) {
        console.error("Heartbeat error:", err);
    }
}

// Periodically check if the session is still valid
let seconds = 30;
setInterval(checkSession, 1000 * seconds); // This in miliseconds
