import { setupPopup } from "../utilities"

const PopUp = document.getElementById("AddPopup")
const PopUpContent = document.getElementById("AddPopupContent")
const addUserButton = document.getElementById("AddUserButton")

addUserButton.addEventListener("click", () => {
    setupPopup("AddPopup", "AddUserButton", "EkisButton")

    const roleSelect = document.getElementById("UserRole")

    roleSelect.addEventListener("change", function () {
        const osaForm = document.getElementById("OsaForm")
        const orgForm = document.getElementById("OrgForm")

        osaForm.classList.add("Hidden");
        orgForm.classList.add("Hidden");

        if (this.value === "OSA") {
            osaForm.classList.remove("Hidden");
        } else if (this.value === "ORG") {
            orgForm.classList.remove("Hidden");
        }
    });

})
