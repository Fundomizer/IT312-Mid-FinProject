import { HOST, API_BASE_URL } from "./config.js";

const loginForm = document.getElementById('LoginForm');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm).entries());

    fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(auth => {
            if (!auth.success) {
                alert('Invalid credentials');
                return;
            }

            if (auth.role === 'osa') {
                console.log("Starting PHP session for OSA");
                fetch(`${HOST}/IT312-Mid-FinProject/server/php/start_session.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ email: data.email })
                })
                    .then(() => {
                        window.location.href = `${HOST}/IT312-Mid-FinProject${auth.redirect}`;
                    })
                    .catch(err => {
                        console.error("Failed to start PHP session:", err);
                        alert("Failed to start session.");
                    });
            } else {
                window.location.href = `${HOST}/IT312-Mid-FinProject${auth.redirect}`;
            }
            localStorage.setItem("username", auth.username);
        })
        .catch(err => alert("Login has hit an unexpected error"));
});
