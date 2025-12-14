 import { checkOSA } from "./osa_auth.js";

import { PHP_HOST } from "../config.js";

const searchInput = document.getElementById("searchInput");
const filterLocation = document.getElementById("filterLocation");
const clearFiltersBtn = document.getElementById("clearFilters");
const totalCount = document.getElementById("totalCount");
const shownCount = document.getElementById("shownCount");

let allItems = [];
// Load Items into Table
async function loadItems() {
   try {
    const response = await fetch(`${PHP_HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`, {
      credentials: "include" 
    });
    const data = await response.json();
    console.log("Fetched data:", data);

    const tbody = document.querySelector("#submissions-table tbody");
    tbody.innerHTML = "";

   data.forEach(org => {
  if (org.requirements) {
    for (const [reqType, reqData] of Object.entries(org.requirements)) {
      const row = document.createElement("tr");
      row.setAttribute("data-location", org.short_name || "");

      const contentText = (reqData.fields || [])
        .map(f => `${f.question} ${f.content || ""}`)
        .join(" ");

      row.dataset.content = contentText.toLowerCase();
      row.dataset.filename = (reqData.filename || "").toLowerCase();
      row.dataset.filepath = (reqData.file_path || "").toLowerCase();

      const nameCell = document.createElement("td");
      nameCell.textContent = reqType.replace(/_/g, " ");
      row.appendChild(nameCell);

      const tagCell = document.createElement("td");
      tagCell.textContent = (reqData.tags || []).join(", ");
      row.appendChild(tagCell);

      const orgCell = document.createElement("td");
      orgCell.textContent = org.org_name;
      row.appendChild(orgCell);

      const shortCell = document.createElement("td");
      shortCell.textContent = org.short_name;
      row.appendChild(shortCell);

      const dateCell = document.createElement("td");
      dateCell.textContent = reqData.last_updated || "N/A";
      row.appendChild(dateCell);

      tbody.appendChild(row);

      row.addEventListener("click", () => {
        checkOSA();
        showFormDetails(org, reqType, reqData);
      });
    }
  }
});

    allItems = Array.from(document.querySelectorAll("#submissions-table tbody tr"));

    totalCount.textContent = allItems.length;
    shownCount.textContent = allItems.length;

    console.log(`Loaded ${allItems.length} items successfully.`);
  } catch (err) {
    console.error("Error loading data:", err);
  }
}
// Filter Results
function filterResults() {
  const searchQuery = searchInput.value.toLowerCase().trim();
  const selectedLocation = filterLocation.value.trim().toLowerCase();
  const tagFilter = document.getElementById("tagFilterInput").value
    .toLowerCase()
    .split(",")
    .map(t => t.trim())
    .filter(t => t);
  const dateFrom = document.getElementById("dateFrom").value;
  const dateTo = document.getElementById("dateTo").value;

  let visibleCount = 0;

  allItems.forEach(item => {
    const cells = item.querySelectorAll("td");
    const name = cells[0].textContent.toLowerCase();
    const tagText = cells[1].textContent.toLowerCase();
    const org = cells[2].textContent.toLowerCase();
    const location = item.getAttribute("data-location")?.toLowerCase() || "";
    const dateText = cells[4].textContent;
    const dateVal = dateText !== "N/A" ? new Date(dateText) : null;

   const content = item.dataset.content || "";
    const filename = item.dataset.filename || "";
    const filepath = item.dataset.filepath || "";

    const matchesSearch =
  name.includes(searchQuery) ||
  org.includes(searchQuery) ||
  tagText.includes(searchQuery) ||
  content.includes(searchQuery) ||
  filename.includes(searchQuery) ||
  filepath.includes(searchQuery);


    const matchesLocation =
      !selectedLocation || location === selectedLocation;

    const matchesTags =
      tagFilter.length === 0 ||
      tagFilter.some(t => tagText.includes(t));

    let matchesDate = true;
    if (dateVal) {
      if (dateFrom && dateVal < new Date(dateFrom)) matchesDate = false;
      if (dateTo && dateVal > new Date(dateTo)) matchesDate = false;
    }

    const isVisible = matchesSearch && matchesLocation && matchesTags && matchesDate;

    item.style.display = isVisible ? "table-row" : "none";
    if (isVisible) visibleCount++;
  });

  shownCount.textContent = visibleCount;
}


  // Add uploaded files section
function showFormDetails(org, reqType, reqData) {
  const reqDiv = document.getElementById("modalRequirements");
  reqDiv.innerHTML = `
    <h3>${reqType.replace(/_/g, " ")}</h3>
    <p><strong>Tags:</strong> ${(reqData.tags || []).join(", ")}</p>
    <p><strong>Last Updated:</strong> ${reqData.last_updated || "N/A"}</p>
    <div><strong>Fields:</strong></div>
  `;

  if (reqData.fields) {
    reqData.fields.forEach(field => {
      const fieldEl = document.createElement("div");
      fieldEl.innerHTML = `
        <div><strong>Question:</strong> ${field.question}</div>
        <div><strong>Content:</strong> ${field.content || ""}</div>
      `;
      reqDiv.appendChild(fieldEl);
    });
  }

  if (reqData.file_path) {
  const filesDiv = document.createElement("div");
  filesDiv.innerHTML = `<strong>Uploaded File:</strong>`; 

  const fileButton = document.createElement("button");
  fileButton.textContent = reqData.filename || "View File";
  fileButton.style.display = "block";
  fileButton.style.marginTop = "4px";
  fileButton.style.padding = "6px 12px";
  fileButton.style.cursor = "pointer";

  fileButton.addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.8)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = 3000;

    const viewer = document.createElement("div");
    viewer.style.background = "#fff";
    viewer.style.padding = "10px";
    viewer.style.borderRadius = "10px";
    viewer.style.width = "90%";
    viewer.style.height = "90%";
    viewer.style.display = "flex";
    viewer.style.flexDirection = "column";
    viewer.style.position = "relative";

    const toolbar = document.createElement("div");
    toolbar.style.display = "flex";
    toolbar.style.justifyContent = "flex-end";
    toolbar.style.gap = "10px";
    toolbar.style.marginBottom = "5px";

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download";
    downloadBtn.style.cursor = "pointer";
    downloadBtn.addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = reqData.file_path;
      link.download = reqData.filename;
      link.click();
    });
    toolbar.appendChild(downloadBtn);

    const contentDiv = document.createElement("div");
    contentDiv.style.flex = "1";
    contentDiv.style.overflow = "auto";
    contentDiv.style.display = "flex";
    contentDiv.style.justifyContent = "center";
    contentDiv.style.alignItems = "center";

    const ext = reqData.filename?.split('.').pop().toLowerCase();
    if (ext === "pdf") {
      const iframe = document.createElement("iframe");
      iframe.src = reqData.file_path;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      contentDiv.appendChild(iframe);
    } else if (["png","jpg","jpeg","gif"].includes(ext)) {
      const img = document.createElement("img");
      img.src = reqData.file_path;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "100%";
      contentDiv.appendChild(img);
    } else {
      contentDiv.textContent = "Cannot preview this file type.";
    }

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "10px";
    closeBtn.style.right = "10px";
    closeBtn.style.padding = "6px 12px";
    closeBtn.style.cursor = "pointer";
    closeBtn.addEventListener("click", () => overlay.remove());

    viewer.appendChild(toolbar);
    viewer.appendChild(contentDiv);
    viewer.appendChild(closeBtn);
    overlay.appendChild(viewer);
    document.body.appendChild(overlay);
  });

  filesDiv.appendChild(fileButton);
  reqDiv.appendChild(filesDiv);
}

  document.getElementById("formDetailsModal").style.display = "flex";
  document.getElementById("closeModal").addEventListener("click", () => {
    checkOSA();
    document.getElementById("formDetailsModal").style.display = "none";
  });
}



document.getElementById("tagFilterInput").addEventListener("input", filterResults, checkOSA());
document.getElementById("dateFrom").addEventListener("change", filterResults, checkOSA());
document.getElementById("dateTo").addEventListener("change", filterResults, checkOSA());
searchInput.addEventListener("input",    filterResults, checkOSA());
filterLocation.addEventListener("change",  filterResults, checkOSA());
clearFiltersBtn.addEventListener("click", () => {
    checkOSA();
  searchInput.value = "";
  filterLocation.value = "";
  document.getElementById("tagFilterInput").value = "";
  document.getElementById("dateFrom").value = "";
  document.getElementById("dateTo").value = "";
  filterResults();
});
async function loadOrganizationsForFilter() {
  try {
    const response = await fetch(`${PHP_HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`, {
      credentials: "include"
    });
    const orgs = await response.json();

    filterLocation.innerHTML = `<option value="">All Orgs</option>`;

    orgs.forEach(org => {
      const option = document.createElement("option");
      option.value = org.short_name;
      option.textContent = org.org_name;
      filterLocation.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading organizations for filter:", err);
  }
}
loadOrganizationsForFilter();

loadItems();

function sortTableByColumn(table, columnIndex, asc = true) {
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  rows.sort((a, b) => {
    let aText = a.children[columnIndex].innerText.trim();
    let bText = b.children[columnIndex].innerText.trim();

    // Handle date column
    if (columnIndex === 4) {
      aText = aText !== "N/A" ? new Date(aText) : new Date(0);
      bText = bText !== "N/A" ? new Date(bText) : new Date(0);
    }

    return asc
      ? (aText > bText ? 1 : -1)
      : (aText < bText ? 1 : -1);
  });

  rows.forEach(row => tbody.appendChild(row));

  // Reset header classes
  const headers = table.querySelectorAll("th");
  headers.forEach(h => h.classList.remove("asc", "desc"));
  const targetHeader = headers[columnIndex];
  targetHeader.classList.add(asc ? "asc" : "desc");
}

loadItems().then(() => {
  const table = document.getElementById("submissions-table");
  // Default sort: Date column (index 4), descending
  sortTableByColumn(table, 4, false);

  // Enable click sorting
  const headers = table.querySelectorAll("th");
  headers.forEach((th, index) => {
    th.addEventListener("click", () => {
      const isAsc = th.classList.contains("asc");
      sortTableByColumn(table, index, !isAsc);
    });
  });
});