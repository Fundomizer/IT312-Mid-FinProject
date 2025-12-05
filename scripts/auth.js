async function protectPage() {
    try {
        const HOST = window.location.origin;
        const res = await fetch(`${HOST}:8123/api/auth/profile`, {
            credentials: "include"
        });
        const data = await res.json();

        if (!data.loggedIn || data.role !== "admin") {
            window.location.href = "/IT312-Mid-FinProject/index.html";
        }
    } catch (err) {
        window.location.href = "/IT312-Mid-FinProject/index.html";
    }
}

protectPage();