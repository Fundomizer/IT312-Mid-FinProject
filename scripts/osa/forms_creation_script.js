

function loadFormCreation() {

const formFields = document.getElementById("formFields");
const addFieldBtn = document.getElementById("addFieldBtn");
const fieldTypeSelect = document.getElementById("fieldType");
const submitFormBtn = document.getElementById("submitFormBtn");

let fieldCounter = 0;

addFieldBtn.addEventListener("click", () => {
  const fieldType = fieldTypeSelect.value;
  fieldCounter++;

  const field = document.createElement("div");
  field.classList.add("form-field");

  let fieldHTML = `
    <label>Question ${fieldCounter}</label>
    <input type="text" placeholder="Enter question title" class="field-title">
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

  field.querySelector(".remove-field-btn").addEventListener("click", () => field.remove());

  if (fieldType === "checkbox" || fieldType === "radio") {
    const optionsContainer = field.querySelector(".options-container");
    const addOptionBtn = field.querySelector(".add-option-btn");

    addOptionBtn.addEventListener("click", () => {
      const optionCount = optionsContainer.children.length + 1;
      const optionItem = document.createElement("div");
      optionItem.classList.add("option-item");

      optionItem.innerHTML = `
        <input type="${fieldType}" disabled>
        <input type="text" class="option-text" placeholder="Option ${optionCount}">
        <button type="button" class="remove-option-btn">×</button>
      `;

      optionItem.querySelector(".remove-option-btn").addEventListener("click", () => {
        optionItem.remove();
      });

      optionsContainer.appendChild(optionItem);
    });

    field.querySelector(".remove-option-btn").addEventListener("click", (e) => {
      e.target.parentElement.remove();
    });
  }
});


}

loadFormCreation();