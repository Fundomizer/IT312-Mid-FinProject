import { API_BASE_URL } from "./config.js";

(async function protectPage() {

    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        credentials: "include",
        method: "POST"
    });

    const data = await res.json();

    if (!data.loggedIn) {
        window.location.href = "/IT312-Mid-FinProject/index.html";
    }
})();
