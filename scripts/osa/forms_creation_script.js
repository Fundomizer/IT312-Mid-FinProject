import { checkOSA } from "./osa_auth.js";

import { PHP_HOST } from "../config.js";

function logAction(code, details = "", activity = "") {
    fetch(`${PHP_HOST}/IT312-Mid-FinProject/server/php/log_event.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, details, activity }) 
    })
    .then(res => res.json())
    .then(data => console.log("Log:", data))
    .catch(err => console.error("Logging error:", err));
}


// Load Organizations 
async function loadOrganizations() {
  const orgSelect = document.getElementById("orgSelect");

//request to fetch organizations
   try {
    const response = await fetch(`${PHP_HOST }/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`, {
      credentials: "include"
    });
    const orgs = await response.json();




    orgs.forEach(org => {
      const option = document.createElement("option");
      option.value = org.short_name;
      option.textContent = org.org_name;
      orgSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading organizations:", err);
  }
}





loadOrganizations();

// Form Creation Logic
function loadFormCreation() {
    const formFields = document.getElementById("formFields");
    const addFieldBtn = document.getElementById("addFieldBtn");
    const fieldTypeSelect = document.getElementById("fieldType");

    addFieldBtn.addEventListener("click", () => {
        const fieldType = fieldTypeSelect.value;
        const questionNumber = formFields.querySelectorAll(".form-field").length + 1;

        // Create field container
        const field = document.createElement("div");
        field.classList.add("form-field");
        field.dataset.type = fieldType;

        // Build field HTML
        let fieldHTML = `
            <label>Question ${questionNumber}</label>
            <input type="text" placeholder="Enter question title" class="field-title" required>
            <label class="required-toggle">
                <input type="checkbox" class="required-checkbox">
                Required
            </label>
        `;

        if (fieldType === "textarea") {
            fieldHTML += `<textarea disabled placeholder="Paragraph answer"></textarea>`;
        } else if (fieldType === "checkbox" || fieldType === "radio") {
            fieldHTML += `
                <div class="options-container">
                    <div class="option-item">
                        <input type="${fieldType}" disabled>
                        <input type="text" class="option-text" placeholder="Option 1">
                        <button type="button" class="remove-option-btn">×</button>
                    </div>
                </div>
                <button type="button" class="add-option-btn">+ Add Option</button>
            `;
        } else {
            fieldHTML += `<input type="text" disabled placeholder="Short answer">`;
        }

        fieldHTML += `<button class="remove-field-btn">Remove Question</button>`;
        field.innerHTML = fieldHTML;
        formFields.appendChild(field);

        // Get question title dynamically
        const getQuestionTitle = () => field.querySelector(".field-title").value || `Question ${questionNumber}`;

        // Log field creation
        logAction(3, `Added field #${questionNumber} of type ${fieldType}`, "Form Creation");

        // Remove field
        field.querySelector(".remove-field-btn").addEventListener("click", () => {
            checkOSA();
            logAction(4, `Removed field: ${getQuestionTitle()}`, "Form Creation");
            field.remove();
        });

        // Handle checkbox/radio options
        if (fieldType === "checkbox" || fieldType === "radio") {
            const optionsContainer = field.querySelector(".options-container");
            const addOptionBtn = field.querySelector(".add-option-btn");

            addOptionBtn.addEventListener("click", () => {
                checkOSA();
                const optionCount = optionsContainer.children.length + 1;
                const optionItem = document.createElement("div");
                optionItem.classList.add("option-item");

                optionItem.innerHTML = `
                    <input type="${fieldType}" disabled>
                    <input type="text" class="option-text" placeholder="Option ${optionCount}">
                    <button type="button" class="remove-option-btn">×</button>
                `;
                optionsContainer.appendChild(optionItem);

                // Log option creation
                logAction(3, `Added option #${optionCount} for question: ${getQuestionTitle()}`, "Form Creation");

                // Remove option
                optionItem.querySelector(".remove-option-btn").addEventListener("click", () => {
                    checkOSA();
                    logAction(4, `Removed option for question: ${getQuestionTitle()}`, "Form Creation");
                    optionItem.remove();
                });
            });

            // Remove the default first option's remove button
            const firstRemoveBtn = optionsContainer.querySelector(".remove-option-btn");
            firstRemoveBtn.addEventListener("click", () => {
                checkOSA();
                logAction(4, `Removed option for question: ${getQuestionTitle()}`, "Form Creation");
                firstRemoveBtn.parentElement.remove();
            });
        }
    });
}


loadFormCreation();
document.getElementById("submitFormBtn").addEventListener("click", async (event) => {
    checkOSA();
     event.preventDefault();



  const requirement_name = document.getElementById("formTitle").value.trim();
  const description = document.getElementById("formDescription").value.trim();

  if (!requirement_name) return alert("Please enter a form title.");

    const formFieldsElements = [...document.querySelectorAll(".form-field")];




    if (formFieldsElements.length === 0) {
      return alert("Please add at least one question.");
    }
    const confirmSubmit = confirm("Are you sure you want to create this form?");
    if (!confirmSubmit) return; 
const fields = [...document.querySelectorAll(".form-field")].map((field) => {
  const question = field.querySelector(".field-title").value.trim();
  const field_type = field.dataset.type || "text";
  const required = field.querySelector(".required-checkbox").checked;

  let options = [];
  if (field_type === "checkbox" || field_type === "radio") {
    options = [...field.querySelectorAll(".option-text")]
      .map(opt => opt.value.trim())
      .filter(opt => opt);
  }
        logAction(6, `Submitted form: ${document.getElementById("formTitle").value}`, "Form Submission");

  return { question, field_type, required, options };
});





  const tags = document.getElementById("tagInput").value
    .split(",")
    .map(tag => tag.trim())
    .filter(tag => tag);


  const fileRequiredCheckbox = document.getElementById("formFileRequired");
  const upload = fileRequiredCheckbox.checked;


  const selectedOrgOptions = [...document.getElementById("orgSelect").selectedOptions];
  const assigned_to = selectedOrgOptions.length > 0
                      ? selectedOrgOptions.map(opt => opt.value)
                      : ["all"];




  const formData = { requirement_name, description, fields, tags, assigned_to,upload
  };




  try {
    const response = await fetch(`${PHP_HOST }/IT312-Mid-FinProject/server/php/forms.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });




    const result = await response.json();




    if (result.success) {
      alert("Form successfully saved!");




      document.getElementById("formTitle").value = "";
      document.getElementById("formDescription").value = "";
      document.getElementById("formFields").innerHTML = "";
      document.getElementById("tagInput").value = "";
      document.getElementById("orgSelect").selectedIndex = -1;
      document.getElementById("formFileRequired").checked = false;
    } else {
      alert("Error saving form: " + (result.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Failed to connect to the server.");
  }
});
// For saving data on back
function saveFormData() {
  const data = {
    requirement_name: document.getElementById("formTitle").value,
    description: document.getElementById("formDescription").value,
    tags: document.getElementById("tagInput").value,
    upload: document.getElementById("formFileRequired").checked,
    assigned_to: [...document.getElementById("orgSelect").selectedOptions].map(opt => opt.value),
    fields: [...document.querySelectorAll(".form-field")].map(field => {
      const question = field.querySelector(".field-title").value;
      const field_type = field.dataset.type;
      const required = field.querySelector(".required-checkbox").checked;
      const options = field_type === "checkbox" || field_type === "radio"
        ? [...field.querySelectorAll(".option-text")].map(opt => opt.value)
        : [];
      return { question, field_type, required, options };
    })
  };
  localStorage.setItem("savedFormData", JSON.stringify(data));
}

document.getElementById("formTitle").addEventListener("input", saveFormData);
document.getElementById("formDescription").addEventListener("input", saveFormData);
document.getElementById("tagInput").addEventListener("input", saveFormData);
document.getElementById("formFileRequired").addEventListener("change", saveFormData);
document.getElementById("orgSelect").addEventListener("change", saveFormData);
document.getElementById("formFields").addEventListener("input", saveFormData);
document.getElementById("formFields").addEventListener("change", saveFormData);


//loading saved form
function loadSavedForm() {
  const savedData = JSON.parse(localStorage.getItem("savedFormData"));
  if (!savedData) return;

  document.getElementById("formTitle").value = savedData.requirement_name || "";
  document.getElementById("formDescription").value = savedData.description || "";
  document.getElementById("tagInput").value = savedData.tags || "";
  document.getElementById("formFileRequired").checked = savedData.upload || false;

  const orgSelect = document.getElementById("orgSelect");
  if (savedData.assigned_to) {
    [...orgSelect.options].forEach(option => {
      option.selected = savedData.assigned_to.includes(option.value);
    });
  }

  if (savedData.fields && savedData.fields.length > 0) {
    savedData.fields.forEach(fieldData => {

      const fieldTypeSelect = document.getElementById("fieldType");
      fieldTypeSelect.value = fieldData.field_type;
      document.getElementById("addFieldBtn").click();

      const lastField = document.querySelector(".form-field:last-child");
      lastField.querySelector(".field-title").value = fieldData.question;
      lastField.querySelector(".required-checkbox").checked = fieldData.required;

      if (fieldData.options && fieldData.options.length > 0) {
        const optionsContainer = lastField.querySelector(".options-container");
        optionsContainer.innerHTML = ""; 
        fieldData.options.forEach((optText, idx) => {
          const optionItem = document.createElement("div");
          optionItem.classList.add("option-item");
          optionItem.innerHTML = `
            <input type="${fieldData.field_type}" disabled>
            <input type="text" class="option-text" placeholder="Option ${idx + 1}" value="${optText}">
            <button type="button" class="remove-option-btn">×</button>
          `;
          optionItem.querySelector(".remove-option-btn").addEventListener("click", e => e.target.parentElement.remove());
          optionsContainer.appendChild(optionItem);
        });
      }
    });
  }
}


loadSavedForm();
