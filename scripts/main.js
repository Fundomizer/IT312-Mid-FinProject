// Element selectors
const idInput = document.getElementById("IdInput");
const passwordInput = document.getElementById("PasswordInput");
const loginButton = document.getElementById("LoginButton");
const googleLogButton = document.getElementById("GoogleLogin");

loginButton.addEventListener("click", () => {

    if (!idInput.value || !passwordInput.value) {
        alert("ID and Password must not be empty"); // TODO add a proper alert later on
        return;
    }

    console.log(idInput.value);

    let userType = validate(idInput.value, passwordInput.value)
    console.log(userType);

    switch (userType) {
        case "osa":
            window.location.href = "./pages/osa/osa_page.html";
            break;
        case "org":
            window.location.href = "./pages/org/org_page.html";
            break;
        case "admin":
            window.location.href = "./pages/admin/admin_page.html";
            break;
        default:
            console.log("unknown ID");
            return;
    }

    function validate(ID, password) {

        // TODO change this later on when we implement a database.
        let prefix = ID.substring(0, 2);

        switch (prefix) {
            case "11": return "org";
            case "22": return "osa";
            case "33": return "admin";
            default: return null;
        }

    }
});

googleLogButton.addEventListener("click", () => {
    // Add google login through here
});
