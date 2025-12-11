import { checkOSA } from "./osa_auth.js";

const HOST = window.location.origin;
let selectedForm = null;

// --- Load active forms ---
async function loadActiveForms() {
  const response = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=forms`, {
    credentials: "include",
  });
  const forms = await response.json();

  const formsContainer = document.getElementById("forms-list");
  formsContainer.innerHTML = "";

  forms.forEach(form => {
    const formItem = document.createElement("div");
    formItem.classList.add("SubCard", "form-item");

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
      <div class="form-header">${form.requirement_name || "Untitled Form"}
        <div class="form-tag">${(form.tags || []).join(", ")}</div>
      </div>
      <div class="form-description">${form.description || "No description available."}</div>
      <div class="form-assigned">Assigned to: ${(form.assigned_to || ["all"]).join(", ")}</div>
      <div class="form-field-count">${form.fields ? form.fields.length : 0} field(s)</div>
      <div class="form-buttons">
        <button class="form-action-btn view-fields-btn">View Fields</button>
        <button class="form-action-btn update-form-btn">Update</button>
        <button class="form-action-btn delete-form-btn">Delete</button>
      </div>
    `;

    formItem.appendChild(fieldsContainer);
    formsContainer.prepend(formItem);

    formItem.querySelector(".view-fields-btn").addEventListener("click", () => {
      checkOSA();
      if (fieldsContainer.style.display === "none") {
        fieldsContainer.style.display = "block";
        formItem.querySelector(".view-fields-btn").textContent = "Hide Fields";
      } else {
        fieldsContainer.style.display = "none";
        formItem.querySelector(".view-fields-btn").textContent = "View Fields";
      }
    });

    formItem.querySelector(".update-form-btn").addEventListener("click", () => {
      checkOSA();
      selectedForm = form;
      openModal(form);
    });

    formItem.querySelector(".delete-form-btn").addEventListener("click", async () => {
      checkOSA();
      if (!confirm(`Delete form "${form.requirement_name}"?`)) return;

      const res = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/forms.php`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: form._id.$oid || form._id })
      });

      if (res.ok) {
        alert("Form deleted successfully!");
        loadActiveForms();
      } else {
        alert("Failed to delete form.");
      }
    });
  });
}

// --- Open modal ---
function openModal(form) {
  const modal = document.getElementById("form-modal");
  modal.style.display = "flex";

  document.getElementById("modal-title").textContent = "Update Form";
  document.getElementById("modal-requirement-name").value = form.requirement_name || "";
  const desc = document.getElementById("modal-description");
  desc.value = form.description || "";
  desc.style.height = "auto";
  desc.style.height = desc.scrollHeight + "px";

  document.getElementById("modal-tags").value = (form.tags || []).join(", ");
  document.getElementById("modal-assigned").value = (form.assigned_to || []).join(",");

  const fieldsContainer = document.getElementById("modal-fields");
  fieldsContainer.innerHTML = "";

  if (form.fields && form.fields.length > 0) {
    form.fields.forEach((field, index) => {
      const fieldDiv = document.createElement("div");
      fieldDiv.classList.add("modal-form-field");
      fieldDiv.dataset.index = index;
      fieldDiv.dataset.type = field.field_type;

      const label = document.createElement("label");
      label.textContent = `Question ${index + 1}`;
      fieldDiv.appendChild(label);

      const input = document.createElement("input");
      input.type = "text";
      input.classList.add("field-title");
      input.value = field.question;
      fieldDiv.appendChild(input);

      const requiredLabel = document.createElement("label");
      requiredLabel.classList.add("required-toggle");
      requiredLabel.innerHTML = `<input type="checkbox" class="required-checkbox" ${field.required ? "checked" : ""}> Required`;
      fieldDiv.appendChild(requiredLabel);

      const optionsDiv = document.createElement("div");
      optionsDiv.classList.add("field-options");
      if (field.field_type === "checkbox" || field.field_type === "radio") {
        (field.options || []).forEach(opt => {
          const optionDiv = document.createElement("div");
          optionDiv.classList.add("option-item");
          optionDiv.innerHTML = `<input type="text" class="option-text" value="${opt}"><button type="button" class="remove-option-btn">×</button>`;
          optionDiv.querySelector(".remove-option-btn").addEventListener("click", e => optionDiv.remove());
          optionsDiv.appendChild(optionDiv);
        });
      }
      fieldDiv.appendChild(optionsDiv);

if (field.field_type === "checkbox" || field.field_type === "radio") {
  const addOptionBtn = document.createElement("button");
  addOptionBtn.type = "button";
  addOptionBtn.classList.add("add-option-btn");
  addOptionBtn.textContent = "+ Add Option";
  addOptionBtn.addEventListener("click", () => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("option-item");
    optionDiv.innerHTML = `<input type="text" class="option-text" placeholder="New Option"><button type="button" class="remove-option-btn">×</button>`;
    optionDiv.querySelector(".remove-option-btn").addEventListener("click", e => optionDiv.remove());
    optionsDiv.appendChild(optionDiv);
  });
  fieldDiv.appendChild(addOptionBtn);
}


      const removeFieldBtn = document.createElement("button");
      removeFieldBtn.type = "button";
      removeFieldBtn.classList.add("remove-field-btn");
      removeFieldBtn.textContent = "Remove Question";
      removeFieldBtn.addEventListener("click", () => fieldDiv.remove());
      fieldDiv.appendChild(removeFieldBtn);

      fieldsContainer.appendChild(fieldDiv);
    });
  } else {
    fieldsContainer.innerHTML = "<em>No fields added yet.</em>";
  }
}

// --- Modal close ---
document.getElementById("modal-close").addEventListener("click", () => {
  checkOSA();
  document.getElementById("form-modal").style.display = "none";
});
document.getElementById("form-modal").addEventListener("click", e => {
  checkOSA();
  if (e.target.id === "form-modal") e.currentTarget.style.display = "none";
});

// --- Update form ---
document.getElementById("modal-update-btn").addEventListener("click", async () => {
  if (!selectedForm) return;

  const fields = [...document.querySelectorAll("#modal-fields .modal-form-field")].map(fieldDiv => {
    const question = fieldDiv.querySelector(".field-title").value.trim();
    const required = fieldDiv.querySelector(".required-checkbox").checked;

    let options = [];
    const optionInputs = fieldDiv.querySelectorAll(".option-text");
    if (optionInputs.length) options = [...optionInputs].map(o => o.value.trim()).filter(o => o);

    return {
      question,
      field_type: fieldDiv.dataset.type || "text",
      required,
      options
    };
  });

  const updatedForm = {
    _id: selectedForm._id.$oid || selectedForm._id,
    requirement_name: document.getElementById("modal-requirement-name").value,
    description: document.getElementById("modal-description").value,
    tags: document.getElementById("modal-tags").value.split(",").map(t => t.trim()),
    fields,
    assigned_to: document.getElementById("modal-assigned").value.split(",").map(x => x.trim()).filter(x => x) || ["all"]
  };

  const res = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/forms.php`, {
    method: "PUT",
    credentials: "include",
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

loadActiveForms();
