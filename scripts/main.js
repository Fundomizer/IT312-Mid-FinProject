const idInput = document.getElementById("IdInput");
const passwordInput = document.getElementById("PasswordInput");
const loginButton = document.getElementById("LoginButton");
const googleLogButton = document.getElementById("GoogleLogin");

loginButton.addEventListener("click", () => {

    if (!idInput.value || !passwordInput.value) {
        alert("ID and Password must not be empty"); // TODO add a proper alert later on
        return;
    }

    // TODO remove these
    console.log(idInput.value);
    console.log(passwordInput.value);

    // Add site redirect here
    window.location.href = "./pages/landing_page.html"; // TODO once database is implemented add a secure way to fix to redirect

});

googleLogButton.addEventListener("click", () => {
    // Add google login through here
});
