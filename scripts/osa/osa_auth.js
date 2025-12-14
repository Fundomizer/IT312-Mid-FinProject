import { PHP_HOST,HOST, PORT } from "../config.js";

export async function checkOSA() {

    try {
        // checks session validity if inactive or no active session
        const res = await fetch(`${PHP_HOST}/IT312-Mid-FinProject/server/php/osa_check.php`, {
            credentials: "include",
            method: "POST"
        });

        let data;
        try {
            data = await res.json();
        } catch (jsonErr) {
            alert("Your session is invalid. Please log in again.");
            window.location.href = HOST + ":" + PORT;
            return;
        }

        console.log("OSA Auth Response:", data);

        if (!data.loggedIn) {
            alert(data.error ?? "Your session has expired or doesnt exist Please log in again.");
            window.location.href = HOST + ":" + PORT;
            return;
        }

    
    } catch (err) {
        console.error("Session check failed:", err);
        alert("Unable to verify your session. Please log in again.");
        window.location.href = HOST + ":" + PORT;
    }
}
checkOSA();
