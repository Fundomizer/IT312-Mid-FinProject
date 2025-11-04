// Element selectors
const idInput = document.getElementById("IdInput");
const passwordInput = document.getElementById("PasswordInput");
const loginButton = document.getElementById("LoginButton");
const googleLogButton = document.getElementById("GoogleLogin");

loginButton.addEventListener("click", () => {
    if (!idInput.value || !passwordInput.value) {
        alert("Email and Password must not be empty");
        return;
    }

    console.log(idInput.value , passwordInput.value);
    

    fetch("http://localhost/IT312-Mid-FinProject/php/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: idInput.value,
            password: passwordInput.value
        })
    })
        .then(res => {
            let json = res.json()
            console.log("Json: ", json);
            return json
        })
        .then(data => {
            console.log("Current data: ", data);

            if (data['success']) {
                switch (data['role'].toLowerCase()) {
                    case "student organization user":
                        window.location.href = "./pages/org/org_page.html";
                        break;
                    case "osa":
                        window.location.href = "./pages/osa/osa_page.html";
                        break;
                    case "admin":
                        window.location.href = "./pages/admin/admin_page.html";
                        break;
                    default:
                        alert("Unknown role");
                }
            } else {
                alert(data.message || "Login failed");
            }
        })
        .catch(err => console.error("Error:", err));
});


googleLogButton.addEventListener("click", () => {
    // Add google login through here
    console.log("Under construction!");
});
