import { HOST, PORT } from "../config.js";
import { fetchCollection, loadPage } from "../utilities.js";
import { createFilters, toggleFilter, clearFilters, applyFilter } from "./org_form_filter_script.js";

const objForm = {
  filters: null,
  formModule: null,
  selectedFiles: [],
  requirements: [],
  orgName: null
};

async function getProfile() {
  let me = await fetch("/api/auth/profile", {
    method: "POST",
    credentials: "include"
  })
    .then(res => res.json())

  return me
}

//---------------------------------------------------------------------------
// Setup Forms
async function createForms() {
  loadPage('org', 'assigned_form_page.html');

  let profile = await getProfile()
  console.log(profile);

  const response = await await fetch(`/api/orgs/rsc/forms/${profile.user.organization}`, {
    method: "GET",
    credentials: "include"
  })
    .then(res => res.json());

  console.log("Organization forms:", response);

  if (!response.success) {
    console.error("Failed to fetch forms");
    return null;
  }

  objForm.requirements = requirementsToArray(response.requirements);

  renderForms(objForm.requirements);
  setupFilters(objForm.requirements, response.requirements);
  setupEventListeners();

  return getFormFunctions();
}

//---------------------------------------------------------------------------
// Transform values
function requirementsToArray(requirements) {
  return Object.entries(requirements).map(([key, value]) => ({
    requirement_name: key,
    ...value
  }));
}

function formatTitle(text) {
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

//---------------------------------------------------------------------------
// Rendering Forms
function renderForms(forms) {
  const container = document.getElementById('Forms');
  container.innerHTML = '';

  if (forms.length === 0) {
    container.innerHTML = '<div class="NoResults"><p>No forms found matching your filters</p></div>';
    return;
  }

  forms.forEach(form => {
    container.insertAdjacentHTML("beforeend", createFormCard(form));
  });
}

function createFormCard(form) {
  const { requirement_name, description, fields, tags, last_updated, form_id } = form;

  return `
    <div class="SubCard Form">
      <div class="FormDetails">
        <span>
          <h2 class="FormTitle">${formatTitle(requirement_name)}</h2>
        </span>
        
        ${description ? `<p class="FormDescription">${description}</p>` : ""}
        
        <div class="FormRequirements">
          <span>
            <div class="ImageWrapper">
              <img src="../../assets/images/org_icons/document_icon.png" alt="Document icon">
            </div>
            <p>${fields.length} Fields required</p>
          </span>
        </div>
        
        <div class="Tags">
          ${tags.map(tag => `<p class="Tag">${tag}</p>`).join("")}
        </div>
        
        ${last_updated ? `<p class="LastUpdated">Last updated: ${last_updated}</p>` : ""}
      </div>
      
      <div>
        <button class="StyledButton" data-form-id="${form_id}" data-requirement-name="${requirement_name}">
          <span>
            <img src="../../assets/images/icons/forms_icon.png" alt="Form icon">
          </span>
          <span>Fill Out Form</span>
        </button>
      </div>
    </div>
  `;
}

//---------------------------------------------------------------------------
// Populate Form Popup
function populateFormPopup(formData) {
  const popup = document.querySelector(".PopupForm");
  const formElement = popup?.querySelector(".Form");

  if (!popup || !formElement) {
    console.error("Popup or form element not found");
    return;
  }

  popup.dataset.formId = formData.form_id;
  popup.dataset.requirementName = formData.requirement_name;

  formElement.innerHTML = '';

  appendFormHeader(formElement, formData);
  appendFormFields(formElement, formData.fields);

  if (formData.upload) {
    appendFileUpload(formElement);
  }

  appendFormButtons(formElement);
}

function appendFormHeader(container, formData) {
  const titleLabel = document.createElement("label");
  titleLabel.htmlFor = "FormTitle";

  const title = document.createElement("h3");
  title.textContent = formatTitle(formData.requirement_name);
  titleLabel.appendChild(title);

  container.appendChild(titleLabel);
  container.appendChild(document.createElement("br"));

  if (formData.description) {
    const descLabel = document.createElement("label");
    descLabel.textContent = formData.description;
    container.appendChild(descLabel);
    container.appendChild(document.createElement("br"));
  }
}

function appendFormFields(container, fields) {
  if (!fields || fields.length === 0) return;

  fields.forEach((field, index) => {
    const fieldWrapper = document.createElement("div");
    fieldWrapper.className = "FormFields";

    const label = createFieldLabel(field, index);
    const input = createFieldInput(field, index);

    fieldWrapper.appendChild(label);
    fieldWrapper.appendChild(input);
    container.appendChild(fieldWrapper);
  });
}

function createFieldLabel(field, index) {
  const label = document.createElement("label");
  label.htmlFor = `field_${index}`;

  const span = document.createElement("span");
  span.textContent = field.question;

  if (field.required === "true" || field.required === true) {
    span.textContent += " *";
  }

  label.appendChild(span);
  return label;
}

function createFieldInput(field, index) {
  const isRequired = field.required === "true" || field.required === true;
  const inputId = `field_${index}`;

  const inputConfig = {
    number: () => createInput("number", inputId, isRequired),
    date: () => createInput("date", inputId, isRequired),
    array: () => createTextarea(inputId, isRequired, "Enter items separated by commas"),
    object: () => createTextarea(inputId, isRequired, "Enter JSON object"),
    text: () => createInput("text", inputId, isRequired)
  };

  const input = (inputConfig[field.field_type] || inputConfig.text)();
  input.name = `field_${index}`;

  return input;
}

function createInput(type, id, required) {
  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  input.required = required;
  return input;
}

function createTextarea(id, required, placeholder) {
  const textarea = document.createElement("textarea");
  textarea.id = id;
  textarea.required = required;
  textarea.placeholder = placeholder;
  return textarea;
}

function appendFileUpload(container) {
  const uploadDiv = document.createElement("div");
  uploadDiv.className = "FormUpload";
  uploadDiv.innerHTML = `
    <span>Supporting Documents</span>
    <label for="UploadButton">Upload File</label>
    <input type="file" id="UploadButton" multiple>
    <div id="UploadedFilesContainer"></div>
  `;
  container.appendChild(uploadDiv);
}

function appendFormButtons(container) {
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'FormButtons';
  buttonContainer.innerHTML = `
    <button type="button" id="CancelForm">Cancel</button>
    <button type="submit" id="SubmitForm">Submit Form</button>
  `;
  container.appendChild(buttonContainer);
}

//---------------------------------------------------------------------------
// Form Submission
async function handleFormSubmit(event) {
  event.preventDefault();

  const popup = document.querySelector(".PopupForm");
  const requirementName = popup.dataset.requirementName;

  if (!requirementName) {
    console.error("No requirement name found");
    return;
  }

  const formData = collectFormData(popup);

  try {
    const response = await submitForm(requirementName, formData);
    handleSubmitResponse(response, popup);
  } catch (error) {
    console.error("Form submission error:", error);
    alert("An error occurred while submitting the form.");
  }
}

function collectFormData(popup) {
  const formElement = popup.querySelector(".Form");
  const formData = new FormData();

  formData.append('org_name', objForm.orgName);

  // Collect text inputs
  formElement.querySelectorAll("input[name^='field_'], textarea[name^='field_']")
    .forEach(input => formData.append(input.name, input.value));

  // Collect file inputs
  formElement.querySelectorAll("input[type='file'][name^='file_']")
    .forEach(input => {
      if (input.files.length > 0) {
        formData.append(input.name, input.files[0]);
      }
    });

  return formData;
}

async function submitForm(requirementName, formData) {
  const response = await fetch(
    `/api/orgs/requirements/${encodeURIComponent(requirementName)}`,
    {
      method: "PUT",
      body: formData,
      credentials: "include"
    }
  );

  return response.json();
}

function handleSubmitResponse(result, popup) {
  console.log("Server response:", result);

  if (result.success) {
    alert("Form submitted successfully");
    closeFormPopup();
  } else {
    alert("Failed to submit form: " + result.message);
  }
}

//---------------------------------------------------------------------------
// Popup Functions
function openFormPopup(formId) {
  const popup = document.querySelector(".PopupForm");
  const overlay = document.getElementById("PopupOverlay");

  if (!popup || !overlay) {
    console.error("Popup elements not found");
    return;
  }

  popup.style.display = "block";
  overlay.classList.add("show");
  document.body.classList.add("modal-open");
}

function closeFormPopup() {
  const popup = document.querySelector(".PopupForm");
  const overlay = document.getElementById("PopupOverlay");

  if (popup && overlay) {
    popup.style.display = "none";
    overlay.classList.remove("show");
    document.body.classList.remove("modal-open");
  }
}

//---------------------------------------------------------------------------
// File Upload Handling and Rendering
function handleFileSelection(event) {
  const files = Array.from(event.target.files);

  files.forEach(file => {
    if (!isFileDuplicate(file)) {
      objForm.selectedFiles.push(file);
      renderFileCard(file, objForm.selectedFiles.length - 1);
    }
  });
}

function isFileDuplicate(file) {
  return objForm.selectedFiles.some(f =>
    f.name === file.name && f.size === file.size
  );
}

function renderFileCard(file, index) {
  const container = document.getElementById('UploadedFilesContainer');
  const fileCard = createFileCard(file, index);
  container.appendChild(fileCard);
}

function createFileCard(file, index) {
  const card = document.createElement('div');
  card.className = 'FileSelectedCard';
  card.id = `File-${index}`;

  const fileName = document.createElement('span');
  fileName.className = 'FileName';
  fileName.textContent = `AttachedFile${index}`;

  const preview = createFilePreview(file);
  const removeBtn = createRemoveButton(index);

  card.appendChild(fileName);
  card.appendChild(preview);
  card.appendChild(removeBtn);

  return card;
}

function createFilePreview(file) {
  const preview = document.createElement('div');
  preview.className = 'FilePreview';

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="${file.name}">`;
    };
    reader.readAsDataURL(file);
  } else {
    const icon = getFileIcon(file.type);
    preview.innerHTML = `<span class="file-icon">${icon}</span>`;
  }

  return preview;
}

function getFileIcon(fileType) {
  const icons = {
    pdf: '📄',
    video: '🎥',
    audio: '🎵',
    archive: '📦'
  };

  if (fileType.includes('pdf')) return icons.pdf;
  if (fileType.includes('video')) return icons.video;
  if (fileType.includes('audio')) return icons.audio;
  if (fileType.includes('zip') || fileType.includes('compressed')) return icons.archive;

  return '📄';
}

function createRemoveButton(index) {
  const button = document.createElement('button');
  button.className = 'RemoveButton';
  button.innerHTML = '×';
  button.onclick = () => removeFile(index);
  return button;
}

function removeFile(index) {
  objForm.selectedFiles.splice(index, 1);
  refreshFileDisplay();
}

function refreshFileDisplay() {
  const container = document.getElementById('UploadedFilesContainer');
  container.innerHTML = '';
  objForm.selectedFiles.forEach((file, index) => {
    renderFileCard(file, index);
  });
}

//---------------------------------------------------------------------------
// Filter Setup
function setupFilters(requirementsArray, requirements) {
  objForm.filters = createFilters(requirementsArray, requirements, renderForms);

  const searchInput = document.getElementById('SearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (objForm.filters?.handleFilter) {
        objForm.filters.handleFilter();
      }
    });
  }
}

//---------------------------------------------------------------------------
// Event Handlers
function setupEventListeners() {
  const submissionForm = document.getElementById('SubmissionForm');
  if (submissionForm) {
    submissionForm.addEventListener('submit', handleFormSubmit);
  }

  // Delegate all clicks to a single handler
  document.addEventListener("click", handleDocumentClick);

  // Handle file input changes
  document.addEventListener("change", handleDocumentChange);

  // Close popup when clicking overlay
  const overlay = document.getElementById("PopupOverlay");
  if (overlay) {
    overlay.addEventListener("click", closeFormPopup);
  }
}

function handleDocumentClick(event) {
  const target = event.target;

  if (target.closest(".StyledButton")) {
    handleFormButtonClick(event);
  } else if (target.id === "CancelForm" || target.closest("#EkisButton")) {
    closeFormPopup();
  } else if (target.closest(".FilterButton")) {
    toggleFilter();
  } else if (target.id === "ApplyFilterButton") {
    toggleFilter();
    applyFilter(objForm.filters);
  } else if (target.id === "ClearFilterButton") {
    clearFilters(objForm.filters);
  } else if (target.id === "SubmitForm") {
    closeFormPopup();
  }
}

function handleDocumentChange(event) {
  if (event.target.id === "UploadButton") {
    handleFileSelection(event);
  }
}

function handleFormButtonClick(event) {
  const button = event.target.closest(".StyledButton");
  const formId = button.dataset.formId;
  const requirementName = button.dataset.requirementName;

  if (!formId || !objForm.formModule) {
    console.error("Form data or module not available");
    return;
  }

  const formData = objForm.formModule.getFormById(formId, requirementName);

  if (formData) {
    objForm.formModule.populatePopupForm(formData);
    openFormPopup(formData.form_id);
  } else {
    console.error("Form not found:", formId);
  }
}

//---------------------------------------------------------------------------
// Return Functions for other parts to use
function getFormFunctions() {
  return {
    populatePopupForm: populateFormPopup,
    requirementsArray: objForm.requirements,
    formatTitle: formatTitle,
    getFormById: (formId, requirementName) => {
      return objForm.requirements.find(f =>
        f.form_id === formId && f.requirement_name === requirementName
      );
    }
  };
}

//---------------------------------------------------------------------------
const formsButton = document.getElementById("formsButton");
if (formsButton) {
  formsButton.addEventListener('click', async () => {
    objForm.formModule = await createForms();
  });
}