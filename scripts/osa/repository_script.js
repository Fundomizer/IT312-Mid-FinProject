const searchInput = document.getElementById("searchInput");
const filterLocation = document.getElementById("filterLocation");
const clearFiltersBtn = document.getElementById("clearFilters");
const repoList = document.getElementById("repoList");
const totalCount = document.getElementById("totalCount");
const shownCount = document.getElementById("shownCount");
const HOST = window.location.origin
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
  const selectedLocation = filterLocation.value;
  let visibleCount = 0;

  allItems.forEach(item => {
    const name = item.querySelector(".submission-name")?.textContent.toLowerCase() || "";
    const org = item.querySelector(".submission-org-name")?.textContent.toLowerCase() || "";
    const tag = item.querySelector(".submission-tag")?.textContent.toLowerCase() || "";
    const location = item.getAttribute("data-location").toLowerCase() || "";

    const matchesSearch =
      name.includes(searchQuery) ||
      org.includes(searchQuery) ||
      tag.includes(searchQuery);

    const matchesLocation = !selectedLocation || location === selectedLocation.toLowerCase();

    const isVisible = matchesSearch && matchesLocation;
    item.style.display = isVisible ? "block" : "none";
    if (isVisible) visibleCount++;
  });

  shownCount.textContent = visibleCount;
}

searchInput.addEventListener("input", filterResults);
filterLocation.addEventListener("change", filterResults);
clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterLocation.value = "";
  filterResults();
});

loadItems();

