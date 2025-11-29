import { setupPopup } from "../utilities"

const addUserButton = document.getElementById("AddUserButton")
const userForm = document.getElementById("UserForm")

addUserButton.addEventListener("click", () => {
    setupPopup("AddPopup", "AddUserButton", "EkisButton")

    const roleSelect = document.getElementById("UserRole")

    roleSelect.addEventListener("change", function () {
        const osaForm = document.getElementById("OsaForm")
        const orgForm = document.getElementById("OrgForm")

        osaForm.classList.add("Hidden");
        orgForm.classList.add("Hidden");
        osaForm.required = false
        orgForm.required = false


        if (this.value === "OSA") {
            osaForm.classList.remove("Hidden");
            osaForm.required = true
        } else if (this.value === "ORG") {
            orgForm.classList.remove("Hidden");
            orgForm.required = true
        }
    });

})

userForm.addEventListener('submit', (e) => {
    console.log("Adding user");
    e.preventDefault();

    let data = new FormData(userForm)

    const entries = Array.from(data.entries());
    const filtered = entries.filter(([key, value]) => value && value.trim() !== "");
    const obj = Object.fromEntries(filtered);

    const HOST = window.location.origin;
    fetch(`${HOST}:8123/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj)
    })
        .then(res => res.json())
        .then(result => {
            alert(result['message'])
        })
        .catch(err => console.error("Error:", err));
})