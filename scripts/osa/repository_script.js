 import { checkOSA } from "./osa_auth.js";

 const HOST = window.location.origin;

const searchInput = document.getElementById("searchInput");
const filterLocation = document.getElementById("filterLocation");
const clearFiltersBtn = document.getElementById("clearFilters");
const totalCount = document.getElementById("totalCount");
const shownCount = document.getElementById("shownCount");

let allItems = [];
// Load Items into Table
async function loadItems() {
   try {
    const response = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`, {
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

    const matchesSearch =
      name.includes(searchQuery) ||
      org.includes(searchQuery) ||
      tagText.includes(searchQuery);

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

  // Add uploaded files section
  if (reqData.filename && reqData.filename.length > 0) {
    const filesDiv = document.createElement("div");
    filesDiv.innerHTML = `<strong>Uploaded Files:</strong>`;
    
    reqData.filename.forEach(file => {
      const fileLink = document.createElement("a");
      fileLink.href = `${HOST}/IT312-Mid-FinProject/uploads/${file}`; 
      fileLink.textContent = file;
      fileLink.target = "_blank"; 
      fileLink.style.display = "block";
      filesDiv.appendChild(fileLink);
    });

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

loadItems();