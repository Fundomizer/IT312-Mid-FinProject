  const HOST = window.location.origin;
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


  });
}

loadActiveForms();
