  const HOST = window.location.origin;
  // Check OSA Authentication
(async function checkOSA() {
        const usernameLabel = document.getElementById("UsernameLabel");

    try {
        const res = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/osa_check.php`, {
            credentials: "include",
            method: "POST"
        });

        const data = await res.json();

        if (!data.loggedIn) {
            console.log("Not logged in as OSA, redirecting to login page");
            window.location.href = "/IT312-Mid-FinProject/index.html";
        }
                usernameLabel.textContent = data.user?.email || "OSA User";

    } catch (err) {
        console.error("Session check failed", err);

    }
})();
