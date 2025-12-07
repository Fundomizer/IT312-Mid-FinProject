import { HOST } from "../config";

let selectedForm = null;
async function loadActiveForms() {
  const response = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=forms`);
  const forms = await response.json();


  const formsContainer = document.getElementById("forms-list");
  formsContainer.innerHTML = "";


  forms.forEach(form => {
    const formItem = document.createElement("div");
    formItem.classList.add("form-item");


    const fieldsContainer = document.createElement("div");
    fieldsContainer.classList.add("form-fields-container");
    fieldsContainer.style.display = "none";


    if (form.fields && form.fields.length > 0) {
      form.fields.forEach((field, index) => {
        const fieldDiv = document.createElement("div");
        fieldDiv.innerHTML = `<strong>Field ${index + 1}:</strong> ${field.question} (${field.field_type}) ${field.required ? '[Required]' : '[Optional]'}`;
        fieldsContainer.appendChild(fieldDiv);
      });
    } else {
      fieldsContainer.innerHTML = "<em>No fields available.</em>";
    }


    formItem.innerHTML = `
      <div class="form-header">
        ${form.requirement_name || "Untitled Form"}
        <div class="form-tag">${(form.tags || []).join(", ")}</div>
      </div>
      <div class="form-description">
        ${form.description || "No description available."}
      </div>
      <div class="form-field-count">
        ${form.fields ? form.fields.length : 0} field(s)
      </div>
      <div class="form-buttons">
        <button class="form-action-btn view-fields-btn">View Fields</button>
        <button class="form-action-btn update-form-btn">Update</button>
        <button class="form-action-btn delete-form-btn">Delete</button>
      </div>
    `;


    formItem.appendChild(fieldsContainer);
    formsContainer.appendChild(formItem);


    formItem.querySelector(".view-fields-btn").addEventListener("click", () => {
      if (fieldsContainer.style.display === "none") {
        fieldsContainer.style.display = "block";
        formItem.querySelector(".view-fields-btn").textContent = "Hide Fields";
      } else {
        fieldsContainer.style.display = "none";
        formItem.querySelector(".view-fields-btn").textContent = "View Fields";
      }
    });


    formItem.querySelector(".update-form-btn").addEventListener("click", () => openModal(form));
    formItem.querySelector(".delete-form-btn").addEventListener("click", () => {
      selectedForm = form;
      document.getElementById("modal-delete-btn").click();
    });
  });
}


function openModal(form) {
  selectedForm = form;
  const modal = document.getElementById("form-modal");
  modal.style.display = "flex";
  document.getElementById("modal-title").textContent = "Update Form";
  document.getElementById("modal-requirement-name").value = form.requirement_name || "";
  document.getElementById("modal-description").value = form.description || "";
  document.getElementById("modal-tags").value = (form.tags || []).join(", ");
}


document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("form-modal").style.display = "none";
});


document.getElementById("modal-update-btn").addEventListener("click", async () => {
  if (!selectedForm) return;


  const updatedForm = {
    ...selectedForm,
    requirement_name: document.getElementById("modal-requirement-name").value,
    description: document.getElementById("modal-description").value,
    tags: document.getElementById("modal-tags").value.split(",").map(t => t.trim())
  };


  const res = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=forms&id=${selectedForm._id.$oid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedForm)
  });


  if (res.ok) {
    alert("Form updated successfully!");
    document.getElementById("form-modal").style.display = "none";
    loadActiveForms();
  } else {
    alert("Failed to update form.");
  }
});


document.getElementById("modal-delete-btn").addEventListener("click", async () => {
  if (!selectedForm) return;
  if (!confirm("Are you sure you want to delete this form?")) return;


  const res = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=forms&id=${selectedForm._id.$oid}`, {
    method: "DELETE"
  });


  if (res.ok) {
    alert("Form deleted successfully!");
    document.getElementById("form-modal").style.display = "none";
    loadActiveForms();
  } else {
    alert("Failed to delete form.");
  }
});


loadActiveForms();
