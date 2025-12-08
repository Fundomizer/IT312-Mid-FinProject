  const HOST = window.location.origin;

const searchInput = document.getElementById("searchInput");
const filterLocation = document.getElementById("filterLocation");
const clearFiltersBtn = document.getElementById("clearFilters");
const repoList = document.getElementById("repoList");
const totalCount = document.getElementById("totalCount");
const shownCount = document.getElementById("shownCount");

let allItems = [];


async function loadItems() {
  try {
    const res = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`)
    const data = await res.json();
    console.log("Fetched data:", data);


    repoList.innerHTML = "";


    data.forEach(org => {
      if (org.requirements) {
        for (const [reqType, reqData] of Object.entries(org.requirements)) {
          const div = document.createElement("div");
          div.classList.add("submission-item");


            div.setAttribute("data-location", org.short_name || "");


          div.innerHTML = `
              <div class="sub-header">
                <div class="submission-name">${reqType.replace(/_/g, " ")}</div>
                <div class="submission-tag">${(reqData.tags || []).join(", ")}</div>
              </div>
              <div class="sub-details">
                <div class="submission-org-name">${org.org_name}</div>
                <div class="submission-org-shortname">${org.short_name}</div>
                <div class="submission-date">${reqData.last_updated || "N/A"}</div>
              </div>
            `;


          repoList.appendChild(div);
          div.addEventListener("click", () => {
      showFormDetails(org, reqType, reqData);
      }   );


        }
      }
    });


    allItems = Array.from(repoList.querySelectorAll(".submission-item"));
    totalCount.textContent = allItems.length;
    shownCount.textContent = allItems.length;


    console.log(`Loaded ${allItems.length} items successfully.`);
  } catch (err) {
    console.error("Error loading data:", err);
  }
}


function filterResults() {
  const searchQuery = searchInput.value.toLowerCase().trim();
  const selectedLocation = filterLocation.value.trim().toLowerCase();
  const tagFilter = document.getElementById("tagFilterInput").value.toLowerCase().split(",").map(t => t.trim()).filter(t => t);
  const dateFrom = document.getElementById("dateFrom").value;
  const dateTo = document.getElementById("dateTo").value;




  let visibleCount = 0;




  allItems.forEach(item => {
    const name = item.querySelector(".submission-name")?.textContent.toLowerCase() || "";
    const org = item.querySelector(".submission-org-name")?.textContent.toLowerCase() || "";
    const tagText = item.querySelector(".submission-tag")?.textContent.toLowerCase() || "";
    const location = item.getAttribute("data-location")?.toLowerCase() || "";
    const date = item.querySelector(".submission-date")?.textContent || "";




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
    if (dateFrom && date < dateFrom) matchesDate = false;
    if (dateTo && date > dateTo) matchesDate = false;




    const isVisible = matchesSearch && matchesLocation && matchesTags && matchesDate;




    item.style.display = isVisible ? "block" : "none";
    if (isVisible) visibleCount++;
  });




  shownCount.textContent = visibleCount;
}






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


  document.getElementById("formDetailsModal").style.display = "flex";
}


document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("formDetailsModal").style.display = "none";
});




// Close modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("formDetailsModal").style.display = "none";
});






document.getElementById("tagFilterInput").addEventListener("input", filterResults);
document.getElementById("dateFrom").addEventListener("change", filterResults);
document.getElementById("dateTo").addEventListener("change", filterResults);
searchInput.addEventListener("input", filterResults);
filterLocation.addEventListener("change", filterResults);
clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterLocation.value = "";
  document.getElementById("tagFilterInput").value = "";
  document.getElementById("dateFrom").value = "";
  document.getElementById("dateTo").value = "";
  filterResults();
});




loadItems();
