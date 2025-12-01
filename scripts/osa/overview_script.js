const HOST = window.location.origin

async function loadOrganizations() {

  const response = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`)

  const data = await response.json();
  const orgContainer = document.getElementById("organizations-list");
  const subContainer = document.getElementById("submissions-list");


  const orgHeader = orgContainer.querySelector("h3");
  orgContainer.innerHTML = "";
  orgContainer.appendChild(orgHeader);
  const subHeader = subContainer.querySelector("h3");
  subContainer.innerHTML = "";
  subContainer.appendChild(subHeader);
  data.forEach(org => {
    orgContainer.innerHTML += `
      <div class="organization-item">
        <div class="org-item-header">
          <div class="organization-name">${org.org_name}</div>
          <div class="organization-shortname">${org.short_name}</div>
        </div>
        <div class="school">${org.school}</div>
        <div class="requirement-count">${Object.keys(org.requirements || {}).length}</div>
        <div class="status">active</div>
      </div>`;

    if (org.requirements) {
      for (const [reqType, reqData] of Object.entries(org.requirements)) {
        subContainer.innerHTML += `
          <div class="submission-item">
            <div class="sub-header">
              <div class="submission-name">${reqType.replace(/_/g, " ")}</div>
              <div class="submission-tag">${(reqData.tags || []).join(", ")}</div>
            </div>
            <div class="sub-details">
              <div class="submission-org-name">${org.org_name}</div>
              <div class="submission-org-shortname">${org.short_name}</div>
              <div class="submission-date">${reqData.last_updated}</div>
            </div>
          </div>`;
      }
    }
  });
}

async function loadDashboard() {

  const orgResponse = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`);
  const orgs = await orgResponse.json();

  const formResponse = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=forms`);
  const forms = await formResponse.json();


  const activeOrgs = orgs.length;
  document.getElementById('active-org-count').textContent = activeOrgs;


  const totalRequirements = orgs.reduce((sum, org) => {
    return sum + (org.requirements ? Object.keys(org.requirements).length : 0);
  }, 0);
  document.getElementById('all-time-submission-count').textContent = totalRequirements;
  document.getElementById('new-submissions-count').textContent = totalRequirements;

  const activeForms = forms.length;
  document.getElementById('active_form_count').textContent = activeForms;
}
async function updateProgressBars() {
    const HOST = window.location.origin;

    const orgResponse = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`);
    const orgs = await orgResponse.json();

    const typeCounts = {};
    let totalRequirements = 0;

    orgs.forEach(org => {
        if (org.requirements) {
            for (const [reqType, reqData] of Object.entries(org.requirements)) {
                typeCounts[reqType] = (typeCounts[reqType] || 0) + 1;
                totalRequirements++;
            }
        }
    });

    const topSubmissionContainer = document.querySelector('.charts-section .chart-container:first-child');
    topSubmissionContainer.innerHTML = `<h3>Top Submissions</h3>
        <p class="chart-header">Most common requirement types</p>`;

    const sortedTypes = Object.entries(typeCounts).sort((a,b) => b[1] - a[1]);

    sortedTypes.forEach(([type, count]) => {
        const percent = Math.min(Math.round((count / Math.max(...Object.values(typeCounts))) * 100), 100);
        topSubmissionContainer.innerHTML += `
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
    totalContainer.innerHTML = `<h3>Total Requirements</h3>
        <p class="chart-header">All requirements across organizations</p>
        <div class="progress-header">
            <p>Total</p>
            <div class="progress-label">${totalRequirements}</div>
        </div>
        <div class="progress-bar">
            <div class="progress" style="width: 100%;"></div>
        </div>`;
}

loadDashboard().then(() => loadOrganizations().then(updateProgressBars));
