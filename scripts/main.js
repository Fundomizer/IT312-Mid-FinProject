import { HOST, API_BASE_URL } from "./config";

// Element selectors
const idInput = document.getElementById("IdInput");
const passwordInput = document.getElementById("PasswordInput");
const loginButton = document.getElementById("LoginButton");
const googleLogButton = document.getElementById("GoogleLogin");
const loginForm = document.getElementById('LoginForm')

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm).entries());

    console.log("Raw ", data);
    console.log("Stringify ", JSON.stringify(data));

    fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    }).then(res => res.json())
        .then(auth => {
            console.log(auth);
            if (auth.success) {
                window.location.href = `${HOST}/IT312-Mid-FinProject${auth.redirect}`
            } else {
                alert('Invalid credentials')
            }
        })
        .catch(err => alert("Login has hit an unexpected error"));
})

googleLogButton.addEventListener("click", () => {
    // Add google login through here
    alert("Under construction!");
});
