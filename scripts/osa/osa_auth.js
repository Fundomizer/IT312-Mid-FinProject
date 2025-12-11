const HOST = window.location.origin;

export async function checkOSA() {
    const usernameLabel = document.getElementById("UsernameLabel");

    try {
        // checks session validity if inactive or no active session
        const res = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/osa_check.php`, {
            credentials: "include",
            method: "POST"
        });

        let data;
        try {
            data = await res.json();
        } catch (jsonErr) {
            alert("Your session is invalid. Please log in again.");
            window.location.href = "/IT312-Mid-FinProject/index.html";
            return;
        }

        console.log("OSA Auth Response:", data);

        if (!data.loggedIn) {
            alert(data.error ?? "Your session has expired. Please log in again.");
            window.location.href = "/IT312-Mid-FinProject/index.html";
            return;
        }

        if (usernameLabel) {
            usernameLabel.textContent = data.user?.email || "OSA User";
        }

    } catch (err) {
        console.error("Session check failed:", err);
        alert("Unable to verify your session. Please log in again.");
        window.location.href = "/IT312-Mid-FinProject/index.html";
    }
}
