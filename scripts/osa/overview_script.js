import { checkOSA } from "./osa_auth.js";


const HOST = window.location.origin;



// Load Dashboard Stats
async function loadDashboard() {
  const orgResponse = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`);
  const orgs = await orgResponse.json();


  const formResponse = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=forms`);
  const forms = await formResponse.json();


  document.getElementById('active-org-count').textContent = orgs.length;


  const totalRequirements = orgs.reduce(
    (sum, org) => sum + (org.requirements ? Object.keys(org.requirements).length : 0),
    0
  );
  document.getElementById('all-time-submission-count').textContent = totalRequirements;

  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  let recentCount = 0;
  orgs.forEach(org => {
    if (org.requirements) {
      Object.values(org.requirements).forEach(req => {
        if (req.last_updated && new Date(req.last_updated) >= thirtyDaysAgo) {
          recentCount++;
        }
      });
    }
  });
  document.getElementById('new-submissions-count').textContent = totalRequirements;
  document.getElementById('active_form_count').textContent = forms.length;
}



// Update Progress Bars
async function updateProgressBars() {
  const orgResponse = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`);
  const orgs = await orgResponse.json();


  const typeCounts = {};
  let totalRequirements = 0;


  orgs.forEach(org => {
    if (org.requirements) {
      Object.entries(org.requirements).forEach(([reqType]) => {
        typeCounts[reqType] = (typeCounts[reqType] || 0) + 1;
        totalRequirements++;
      });
    }
  });




  const topContainer = document.querySelector('.charts-section .chart-container:first-child');
  topContainer.innerHTML = `<h2>Top Submissions</h2><p class="chart-header">Most common requirement types</p>`;
  Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percent = Math.min(Math.round((count / Math.max(...Object.values(typeCounts))) * 100), 100);
      topContainer.innerHTML += `
        <div class="progress-header">
          <p>${type.replace(/_/g, " ")}</p>
          <div class="progress-label">${count}</div>
        </div>
        <div class="progress-bar">
          <div class="progress" style="width: ${percent}%;"></div>
        </div>
      `;
    });




const totalContainer = document.querySelector('.charts-section .chart-container:last-child');
totalContainer.innerHTML = `
  <h2>Total Requirements</h2>
  <p class="chart-header">All requirements across organizations</p>
  <div class="progress-header"><p>Total</p><div class="progress-label">${totalRequirements}</div></div>
  <div class="progress-bar"><div class="progress" style="width: 100%;"></div></div>
`;

// ----- New Statistic: Most Active Organizations -----
const orgCounts = {};
orgs.forEach(org => {
  const count = org.requirements ? Object.keys(org.requirements).length : 0;
  orgCounts[org.org_name] = count;
});

totalContainer.innerHTML += `
  <h2>Most Active Organizations</h2>
  <p class="chart-header">Organizations with most submissions</p>
`;

Object.entries(orgCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5) // top 5 organizations
  .forEach(([orgName, count]) => {
    const percent = Math.min(Math.round((count / Math.max(...Object.values(orgCounts))) * 100), 100);
    totalContainer.innerHTML += `
      <div class="progress-header">
        <p>${orgName}</p>
        <div class="progress-label">${count}</div>
      </div>
      <div class="progress-bar">
        <div class="progress" style="width: ${percent}%;"></div>
      </div>
    `;
  });

}



// Load Recent Submissions
async function loadRecentSubmissions() {
  const response = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`);
  const orgs = await response.json();


  const submissionsContainer = document.getElementById("submissions-list");
  const header = submissionsContainer.querySelector("h2");
  submissionsContainer.innerHTML = "";
  submissionsContainer.appendChild(header);


  let allRequirements = [];

  orgs.forEach(org => {
    const reqs = org.requirements || {};
    Object.entries(reqs).forEach(([type, info]) => {
      allRequirements.push({
        org_name: org.org_name,
        org_short: org.short_name,
        type: type.replace(/_/g, ' '),
        last_updated: info.last_updated || 'N/A',
        tags: info.tags || [],
      });
    });
  });


  allRequirements.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));


  allRequirements.forEach(req => {
    const item = document.createElement("div");
    item.className = "submission-item";


    const subHeader = document.createElement("div");
    subHeader.className = "sub-header";
    subHeader.innerHTML = `
      <div class="submission-name">${req.type}</div>
      <div class="submission-tag">${req.tags.join(', ') || '—'}</div>
    `;


    const subDetails = document.createElement("div");
    subDetails.className = "sub-details";
    subDetails.innerHTML = `
      <div class="submission-org-name">${req.org_name}</div>
      <div class="submission-org-shortname">${req.org_short}</div>
      <div class="submission-date">${req.last_updated}</div>
    `;
    subDetails.style.display = "none";


    subHeader.addEventListener("click", () => {
        checkOSA();
      subDetails.style.display = subDetails.style.display === "none" ? "flex" : "none";
    });


    item.appendChild(subHeader);
    item.appendChild(subDetails);
    submissionsContainer.appendChild(item);
  });
}




function showRequirementModal(title, questions) {
  const modal = document.createElement('div');
  modal.className = 'org-modal';
  modal.innerHTML = `
    <div class="org-modal-content">
      <span class="org-modal-close">&times;</span>
      <h2>${title}</h2>
      <br>
      ${questions.length
        ? questions.map(q => `<p><b>Question:</b> ${q.question}
          <br> <b> Content: </b> ${q.content} </p>     <br>`).join('')
          
        : '<p>No questions for this requirement</p>'}
   
    </div>
  `;
  document.body.appendChild(modal);


  modal.querySelector('.org-modal-close').addEventListener('click', () =>  checkOSA(),  modal.remove());
  modal.addEventListener('click', e => {   checkOSA(); if (e.target === modal) modal.remove(); });


  modal.style.display = 'flex';
}




// Load Organization


async function loadOrganizations() {
  const response = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`, { credentials: "include" });
  const orgs = await response.json();

  const orgContainer = document.getElementById("organizations-list");
  const orgHeader = orgContainer.querySelector("h2");
  const searchBar = orgContainer.querySelector("#orgSearchInput");

  orgContainer.innerHTML = "";
  orgContainer.appendChild(orgHeader);
 orgContainer.appendChild(searchBar);
  orgs.forEach(org => {
    const card = document.createElement('div');
    card.className = 'organization-item';

    const reqCount = Object.keys(org.requirements || {}).length;

    const dropdown = document.createElement('div');
    dropdown.className = 'org-dropdown';
    dropdown.innerHTML = `
      <p><b>School:</b> ${org.school || 'N/A'}</p>
      <p><b>Type:</b> ${org.org_type || 'N/A'}</p>
      ${org.adviser?.name ? `<p><b>Adviser:</b> ${org.adviser.name}</p>` : ''}
      ${org.officers?.length ? `<p><b>Officers:</b></p><ul>${org.officers.map(o => `<li>${o.position}: ${o.name}</li>`).join('')}</ul>` : ''}
      <h4>Requirements (${reqCount})</h4>
    `;

    const reqContainer = document.createElement('div');
    reqContainer.className = 'requirements-container';
    dropdown.appendChild(reqContainer);

    const reqObj = org.requirements || {};
    Object.entries(reqObj).forEach(([type, info]) => {
      const entry = document.createElement('div');
      entry.className = 'requirement-entry';
      entry.textContent = type.replace(/_/g, ' ');
      entry.addEventListener('click', () =>   checkOSA(), showRequirementModal(type.replace(/_/g, ' '), info.fields || []));
      reqContainer.appendChild(entry);
    });

    card.innerHTML = `
      <div class="org-header">
        <div class="org-title">
          <span class="name">${org.org_name}</span>
          <span class="short">${org.short_name} — ${org.school}</span>
        </div>
        <div class="org-toggle">▶</div>
      </div>
    `;
    card.appendChild(dropdown);
    orgContainer.appendChild(card);

    const header = card.querySelector('.org-header');
    header.addEventListener('click', () => {
        checkOSA();
      const open = card.classList.toggle('open');
      dropdown.style.maxHeight = open ? dropdown.scrollHeight + 'px' : '0px';
    });
  });
}


function filterOrganizations() {
  const term = document.getElementById("orgSearchInput").value.toLowerCase();
  const items = document.querySelectorAll(".organization-item");

  items.forEach(item => {
    const name = item.querySelector(".name")?.textContent.toLowerCase() || "";
    const short = item.querySelector(".short")?.textContent.toLowerCase() || "";

    if (name.includes(term) || short.includes(term)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}



loadDashboard()
  .then(() => loadOrganizations())
  .then(() => {
    updateProgressBars();
    loadRecentSubmissions();
        document.getElementById("orgSearchInput")
            .addEventListener("input", filterOrganizations);
  });


  