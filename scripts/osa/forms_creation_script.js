import { checkOSA } from "./osa_auth.js";

const HOST = window.location.origin;



// Load Organizations 
async function loadOrganizations() {
  const orgSelect = document.getElementById("orgSelect");


   try {
    const response = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`, {
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


function loadFormCreation() {
  const formFields = document.getElementById("formFields");
  const addFieldBtn = document.getElementById("addFieldBtn");
  const fieldTypeSelect = document.getElementById("fieldType");
  let fieldCounter = 0;




  addFieldBtn.addEventListener("click", () => {
    const fieldType = fieldTypeSelect.value;
    const questionNumber = formFields.querySelectorAll(".form-field").length + 1;






    const field = document.createElement("div");
    field.classList.add("form-field");
    field.dataset.type = fieldType;




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




field.querySelector(".remove-field-btn").addEventListener("click", () => {
    checkOSA();
    field.remove();
});




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
optionItem.querySelector(".remove-option-btn").addEventListener("click", () => {
    checkOSA();
    optionItem.remove();
});
        optionsContainer.appendChild(optionItem);
      });




      field.querySelector(".remove-option-btn").addEventListener("click", (e) => e.target.parentElement.remove());
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

  return { question, field_type, required, options };
});





  const tags = document.getElementById("tagInput").value
    .split(",")
    .map(tag => tag.trim())
    .filter(tag => tag);




  const selectedOrgOptions = [...document.getElementById("orgSelect").selectedOptions];
  const assigned_to = selectedOrgOptions.length > 0
                      ? selectedOrgOptions.map(opt => opt.value)
                      : ["all"];




  const formData = { requirement_name, description, fields, tags, assigned_to,
  };




  try {
    const HOST = window.location.origin;
    const response = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/forms.php`, {
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
    } else {
      alert("Error saving form: " + (result.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Failed to connect to the server.");
  }
});
