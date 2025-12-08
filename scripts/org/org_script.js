import { fetchCollection, loadPage } from "../utilities.js"

const dashboard = document.getElementById("dashboardButton")
const forms = document.getElementById("formsButton")
const history = document.getElementById("historyButton")

async function loadDashboard() {
    loadPage('org', 'dashboard_page.html')

    let orgs = await fetchCollection('student_organization');
    let totalSubmissions = 0;
    orgs.forEach(org => {
        const reqs = org.requirements || {};
        totalSubmissions += Object.keys(reqs).length;
    });

    let assignedForms = await fetchCollection('forms')

    const totalSubs = document.querySelector("#TotalSubmissions b");
    const totalAssForms = document.querySelector("#AssignedForms b");

    totalSubs.textContent = totalSubmissions;
    totalAssForms.textContent = assignedForms.length;
}

// For the apply and clear filter buttons to work
let filters = null;

async function loadForms() {
    loadPage('org', 'assigned_form_page.html')

    let forms = await fetchCollection('forms')

    document.getElementById('SearchInput').addEventListener('input', handleFilter)

    const selectedTags = new Set();
    let currentSortOrder = 'none';

    createTags()
    displayForm(forms)

    filters = {
        updateFilters: updateFilters,
        clearFilters: clearFormFilters
    };

    function displayForm(formsToDisplay) {
        const formDisplay = document.getElementById('Forms');
        formDisplay.innerHTML = '';

        if (formsToDisplay.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'NoResults';
            noResults.innerHTML = '<p>No forms found matching your filters</p>';
            formDisplay.appendChild(noResults);
            return;
        }

        formsToDisplay.forEach(item => {
            formDisplay.appendChild(createForm(item));
        });
    }

    function createTags() {
        const tagsSet = new Set();
        forms.forEach(form => {
            if (form.tags) {
                form.tags.forEach(tag => tagsSet.add(tag));
            }
        });

        const Container = document.getElementById('TagsContainer');
        const allTag = Array.from(tagsSet).sort();

        Container.innerHTML = '';

        allTag.forEach((tag, index) => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `TagsButton${index}`;
            checkbox.dataset.tag = tag;
                
            const label = document.createElement('label');
            label.htmlFor = `TagsButton${index}`;
            label.textContent = tag;
                
            Container.appendChild(checkbox);
            Container.appendChild(label);
        });
    }

    function updateFilters() {
        // Update selected tags
        selectedTags.clear();
        document.querySelectorAll('.TagsContainer input[type="checkbox"]:checked').forEach(checkbox => {
            selectedTags.add(checkbox.dataset.tag);
        });
        
        // Update sort order from dropdown
        const sortDropdown = document.getElementById('FilterDropdown');
        if (sortDropdown) {
            currentSortOrder = sortDropdown.value.toLowerCase();
        }
        
        handleFilter();
    }

    function clearFormFilters() {
        selectedTags.clear();
        currentSortOrder = 'none';
        document.querySelectorAll('.TagsContainer input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        const sortDropdown = document.getElementById('FilterDropdown');
        if (sortDropdown) {
            sortDropdown.value = 'None';
        }
        handleFilter();
    }
    
    function createForm(form) {
        // Parent wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "SubCard Form";

        // Attach the two big parts
        wrapper.appendChild(createFormDetails());
        wrapper.appendChild(createStyledButtonDiv());

        return wrapper;

        function createFormDetails() {
            const formDetails = document.createElement("div");
            formDetails.className = "FormDetails";

            // Title + Action
            const titleBlock = document.createElement("span");
            const titleEl = document.createElement("h2");
            titleEl.className = "FormTitle";
            titleEl.textContent = form.requirement_name;



            titleBlock.appendChild(titleEl);


            // Description
            const descEl = document.createElement("p");
            descEl.className = "FormDescription";
            descEl.textContent = form.description;

            // Requirements
            const requirements = document.createElement("div");
            requirements.className = "FormRequirements";

            const reqSpan = document.createElement("span");

            const imageWrapper = document.createElement("div");
            imageWrapper.className = "ImageWrapper";

            const icon = document.createElement("img");
            icon.src = "../../assets/images/org_icons/document_icon.png";
            icon.alt = "Document icon";

            imageWrapper.appendChild(icon);

            const reqText = document.createElement("p");
            reqText.textContent = `${form.fields.length} Fields required`;

            reqSpan.appendChild(imageWrapper);
            reqSpan.appendChild(reqText);
            requirements.appendChild(reqSpan);

            // Tags
            const tagsContainer = document.createElement("div");
            tagsContainer.className = "Tags";
            form.tags.forEach(tag => {
                const tagEl = document.createElement("p");
                tagEl.className = "Tag";
                tagEl.textContent = tag;
                tagsContainer.appendChild(tagEl);
            });

            // Assemble FormDetails
            formDetails.appendChild(titleBlock);
            formDetails.appendChild(descEl);
            formDetails.appendChild(requirements);
            formDetails.appendChild(tagsContainer);

            return formDetails;
        }

        // --- Internal function: Styled button ---
        function createStyledButtonDiv() {
            const buttonWrapper = document.createElement("div");

            const button = document.createElement("button");
            button.className = "StyledButton";

            const iconSpan = document.createElement("span");
            const formIcon = document.createElement("img");
            formIcon.src = "../../assets/images/icons/forms_icon.png";
            formIcon.alt = "Form icon";
            iconSpan.appendChild(formIcon);

            const labelSpan = document.createElement("span");
            labelSpan.textContent = "Fill Out form";

            button.appendChild(iconSpan);
            button.appendChild(labelSpan);
            buttonWrapper.appendChild(button);

            return buttonWrapper;
        }
    }

    function handleFilter() {
        const term = document.getElementById('SearchInput').value.toLowerCase();

        let filtered = forms;

        // Search filter
        if (term) {
            filtered = filtered.filter(form =>
                form.requirement_name?.toLowerCase().includes(term) ||
                form.description?.toLowerCase().includes(term) ||
                (form.tags && form.tags.some(tag => tag.toLowerCase().includes(term)))
            );
        }

        // Tag filter
        if (selectedTags.size > 0) {
            filtered = filtered.filter(form => {
                if (!form.tags) return false;
                return form.tags.some(tag => selectedTags.has(tag));
            });
        }

        // Sort by name
        if (currentSortOrder === 'asc') {
            filtered.sort((a, b) => a.requirement_name.localeCompare(b.requirement_name));
        } else if (currentSortOrder === 'desc') {
            filtered.sort((a, b) => b.requirement_name.localeCompare(a.requirement_name));
        }

        displayForm(filtered);
    }
}

// this fucntion is currently reading all requirements from
//student organization use session handling to specify org
//and also add fields as necessary
async function loadHistory() {
    await loadPage('org', 'history_page.html');

    // Fetch all student organizations
    let orgs = await fetchCollection('student_organization');

    // Collect all requirements from all orgs
    let allRequirements = [];
    orgs.forEach(org => {
        const reqs = org.requirements || {};
        Object.keys(reqs).forEach(key => {
            // key is the requirement name, reqs[key] is the details
            allRequirements.push({
                name: key,
                ...reqs[key]
            });
        });
    });

    displayHistory(allRequirements);

    function displayHistory(requirements) {
        const logsDisplay = document.getElementById("History");
        if (!logsDisplay) return;
        logsDisplay.innerHTML = "";

        requirements.forEach(item => {
            logsDisplay.appendChild(createLog(item));
        });
    }

    function createLog(requirement) {
        const wrapper = document.createElement("div");
        wrapper.className = "SubCard Log";

        wrapper.appendChild(createLogDetails());
        wrapper.appendChild(createStyledButtonDiv());

        return wrapper;

        function createLogDetails() {
            const logDetails = document.createElement("div");
            logDetails.className = "LogDetails";

            // Requirement Name
            const titleBlock = document.createElement("div");
            const titleEl = document.createElement("h4");
            titleEl.textContent = requirement.name || "No name";
            titleBlock.appendChild(titleEl);

            // Last Updated
            const updatedEl = document.createElement("p");
            updatedEl.textContent = `Last Updated: ${requirement.last_updated || "N/A"}`;

            // Tags
            const tagsContainer = document.createElement("div");
            tagsContainer.className = "Tags";
            (requirement.tags || []).forEach(tag => {
                const tagEl = document.createElement("p");
                tagEl.className = "Tag";
                tagEl.textContent = tag;
                tagsContainer.appendChild(tagEl);
            });

            logDetails.appendChild(titleBlock);
            logDetails.appendChild(updatedEl);
            logDetails.appendChild(tagsContainer);

            return logDetails;
        }

        function createStyledButtonDiv() {
            const buttonWrapper = document.createElement("div");

            const button = document.createElement("button");
            button.className = "StyledButton";

            const imgWrapper = document.createElement("div");
            imgWrapper.className = "ImageWrapper";

            const icon = document.createElement("img");
            icon.src = "../../assets/images/org_icons/view.png";
            icon.alt = "Eye icon";

            imgWrapper.appendChild(icon);

            const label = document.createElement("span");
            label.textContent = "View details";

            button.appendChild(imgWrapper);
            button.appendChild(label);
            buttonWrapper.appendChild(button);

            return buttonWrapper;
        }
    }
}



function openForm() {
    const popup = document.querySelector(".PopupForm");
    const overlay = document.getElementById("PopupOverlay");
    if (popup && overlay) {
        popup.style.display = "block";
        overlay.classList.add("show");     // make overlay visible
        document.body.classList.add("modal-open"); // optional: disable scroll
    }
}

function closeForm() {
    const popup = document.querySelector(".PopupForm");
    const overlay = document.getElementById("PopupOverlay");
    if (popup && overlay) {
        popup.style.display = "none";
        overlay.classList.remove("show");  // hide overlay
        document.body.classList.remove("modal-open"); // optional: re-enable scroll
    }
}

// Optional: click the overlay to close
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("PopupOverlay");
    if (overlay) {
        overlay.addEventListener("click", closeForm);
    }
});

function toggleFilter() {
    const panel = document.getElementById("Filter");
    panel.classList.toggle('Expand');
}

function clearFilters() {
    const dropdown = document.querySelectorAll('#FilterDropdown');
    dropdown.forEach(select => select.selectedIndex = 0);
    
    if (filters && filters.clearFilters) {
        filters.clearFilters();
    } else {
        document.querySelectorAll('.TagsContainer input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}

function applyFilter() {
    if (filters && filters.updateFilters) {
        filters.updateFilters();
    }
}

// Assign event handlers for navigation
if (dashboard) dashboard.addEventListener('click', loadDashboard)
if (forms) forms.addEventListener('click', loadForms)
if (history) history.addEventListener('click', loadHistory)

// EventHandlers for the forms
document.addEventListener("click", (e) => {
    if (e.target.closest(".StyledButton")) {
        openForm();
    }
    if (e.target.id === "CancelForm") {
        closeForm();
    }
    if (e.target.closest("#EkisButton")) {
        closeForm();
    }
    if (e.target.closest(".FilterButton")) {
        toggleFilter();
    }
    if (e.target.id === "ApplyFilterButton") {
        toggleFilter();
        applyFilter();
    }
    if (e.target.id === "ClearFilterButton") {
        clearFilters();
    }
});

loadDashboard() // Load dashboard by default