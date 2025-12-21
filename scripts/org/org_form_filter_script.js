//---------------------------------------------------------------------------
// Setup and Manage Form Filters
export function createFilters(requirementsArray, requirements, displayFormCallback) {
  const filterObject = {
    selectedTags: new Set(),
    currentSortOrder: 'none',
    requirementsArray,
    displayFormCallback
  };

  setupTags(requirements);

  return getFilterFunctions(filterObject);
}

//---------------------------------------------------------------------------
// Tags Setup and Creation
function setupTags(requirements) {
  const allTags = extractAllTags(requirements);
  renderTagCheckboxes(allTags);
}

function extractAllTags(requirements) {
  const tagsSet = new Set();

  Object.values(requirements).forEach(req => {
    if (req.tags && Array.isArray(req.tags)) {
      req.tags.forEach(tag => tagsSet.add(tag));
    }
  });

  return Array.from(tagsSet).sort();
}

function renderTagCheckboxes(tags) {
  const container = document.getElementById('TagsContainer');
  if (!container) return;

  container.innerHTML = '';

  tags.forEach((tag, index) => {
    const checkbox = createTagCheckbox(tag, index);
    const label = createTagLabel(tag, index);

    container.appendChild(checkbox);
    container.appendChild(label);
  });
}

function createTagCheckbox(tag, index) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `TagsButton${index}`;
  checkbox.dataset.tag = tag;
  return checkbox;
}

function createTagLabel(tag, index) {
  const label = document.createElement('label');
  label.htmlFor = `TagsButton${index}`;
  label.textContent = tag;
  return label;
}

//---------------------------------------------------------------------------
// Update Filters
function updateFilters(filterObject) {
  updateSelectedTags(filterObject);
  updateSortOrder(filterObject);
  applyingFilters(filterObject);
}

function updateSelectedTags(filterObject) {
  filterObject.selectedTags.clear();
  
  document.querySelectorAll('.TagsContainer input[type="checkbox"]:checked')
    .forEach(checkbox => {
      filterObject.selectedTags.add(checkbox.dataset.tag);
    });
}

function updateSortOrder(filterObject) {
  const sortDropdown = document.getElementById('FilterDropdown');
  
  if (sortDropdown) {
    filterObject.currentSortOrder = sortDropdown.value.toLowerCase();
  }
}

function clearingFilters(filterObject) {
  filterObject.selectedTags.clear();
  filterObject.currentSortOrder = 'none';
  
  resetTagCheckboxes();
  resetSortDropdown();
  
  applyingFilters(filterObject);
}

function resetTagCheckboxes() {
  document.querySelectorAll('.TagsContainer input[type="checkbox"]')
    .forEach(checkbox => {
      checkbox.checked = false;
    });
}

function resetSortDropdown() {
  const sortDropdown = document.getElementById('FilterDropdown');
  
  if (sortDropdown) {
    sortDropdown.value = 'None';
  }
}

//---------------------------------------------------------------------------
// Apply Filters to Forms
function applyingFilters(filterObject) {
  const searchTerm = getSearchTerm();
  
  let filtered = filterObject.requirementsArray;
  
  filtered = applySearchFilter(filtered, searchTerm);
  filtered = applyTagFilter(filtered, filterObject.selectedTags);
  filtered = applySortOrder(filtered, filterObject.currentSortOrder);

  filterObject.displayFormCallback(filtered);
}

function getSearchTerm() {
  const searchInput = document.getElementById('SearchInput');
  return searchInput ? searchInput.value.toLowerCase() : '';
}

function applySearchFilter(forms, searchTerm) {
  if (!searchTerm) return forms;

  return forms.filter(form =>
    matchesSearchTerm(form, searchTerm)
  );
}

function matchesSearchTerm(form, term) {
  const nameMatch = form.requirement_name?.toLowerCase().includes(term);
  const tagMatch = form.tags?.some(tag => tag.toLowerCase().includes(term));
  
  return nameMatch || tagMatch;
}

function applyTagFilter(forms, selectedTags) {
  if (selectedTags.size === 0) return forms;

  return forms.filter(form => hasSelectedTag(form, selectedTags));
}

function hasSelectedTag(form, selectedTags) {
  if (!form.tags) return false;
  
  return form.tags.some(tag => selectedTags.has(tag));
}

function applySortOrder(forms, sortOrder) {
  const sortedForms = [...forms];

  const sortFunctions = {
    'asc': (a, b) => a.requirement_name.localeCompare(b.requirement_name),
    'desc': (a, b) => b.requirement_name.localeCompare(a.requirement_name)
  };

  const sortFunction = sortFunctions[sortOrder];
  
  if (sortFunction) {
    sortedForms.sort(sortFunction);
  }

  return sortedForms;
}

//---------------------------------------------------------------------------
// Toggle, Clear, and Apply Filter Panel
export function toggleFilter() {
  const panel = document.getElementById("Filter");
  
  if (panel) {
    panel.classList.toggle('Expand');
  }
}

export function clearFilters(filtersInstance) {
  resetAllDropdowns();

  if (filtersInstance?.clearFilters) {
    filtersInstance.clearFilters();
  } else {
    resetTagCheckboxes();
  }
}

export function applyFilter(filtersInstance) {
  if (filtersInstance?.updateFilters) {
    filtersInstance.updateFilters();
  }
}

function resetAllDropdowns() {
  document.querySelectorAll('#FilterDropdown')
    .forEach(select => {
      select.selectedIndex = 0;
    });
}

//---------------------------------------------------------------------------
// Return Filter Functions
function getFilterFunctions(filterObject) {
  return {
    updateFilters: () => updateFilters(filterObject),
    clearFilters: () => clearingFilters(filterObject),
    handleFilter: () => applyingFilters(filterObject)
  };
}