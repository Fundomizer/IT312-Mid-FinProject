
async function loadActiveForms() {
 
    const response = await fetch("http://localhost:3000/api/forms");
    const forms = await response.json();


    const formsContainer = document.getElementById("forms-list");
    formsContainer.innerHTML = "";


    forms.forEach(form => {


      const formItem = document.createElement("div");
      formItem.classList.add("form-item");


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
      `;


      formsContainer.appendChild(formItem);
    });
 
}
loadActiveForms();

