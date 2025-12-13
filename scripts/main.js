// login.js
import { HOST, PHP_HOST } from "./config.js";

const loginForm = document.getElementById('LoginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(loginForm).entries());

    try {
        const response = await fetch(`${HOST}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data)
        });

        const text = await response.text();
        let auth;
        try {
            auth = JSON.parse(text);
        } catch (err) {
            console.error("Failed to parse server response:", text);
            alert("Server returned invalid response.");
            return;
        }

        if (!auth.success) {
            alert(auth.message || "Invalid credentials");
            return;
        }

        if (auth.role === 'osa') {
            try {
                const phpResponse = await fetch(`${PHP_HOST}/IT312-Mid-FinProject/server/php/start_session.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ email: data.email })
                });

                if (!phpResponse.ok) {
                    console.error("PHP session error:", await phpResponse.text());
                    alert("Failed to start PHP session.");
                    return;
                }

                // Redirect after PHP session
                window.location.href = `${PHP_HOST}/IT312-Mid-FinProject/pages/osa/osa_page.html`;

            } catch (err) {
                console.error("Failed to start PHP session:", err);
                alert("Failed to start PHP session.");
            }

        } else {
            // Non-OSA users redirect
            window.location.href = `${HOST}${auth.redirect}`;
        }

        localStorage.setItem("username", auth.username);
        if (auth.organization) localStorage.setItem("org_name", auth.organization);

    } catch (err) {
        console.error("Login fetch error:", err);
        alert("Login has hit an unexpected error. Check console for details.");
    }
});
