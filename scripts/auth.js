(async function protectPage() {
    const HOST = window.location.origin;
    const res = await fetch(`${HOST}:8123/api/auth/profile`, {
        credentials: "include",
        method: "POST"
    });

    const data = await res.json();

    if (!data.loggedIn) {
        window.location.href = "/IT312-Mid-FinProject/index.html";
    }
})();
