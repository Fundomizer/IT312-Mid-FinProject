
async function loadOrganizations() {
const response = await fetch("http://localhost/IT312-Mid-FinProject/php/api.php?collection=student_organization")

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
    let orgs = await fetchCollection('http://localhost/IT312-Mid-FinProject/php/api.php?collection=student_organization');
    let forms = await fetchCollection('http://localhost/IT312-Mid-FinProject/php/api.php?collection=forms');

    // Count active organizations
    const activeOrgs = orgs.length;
    document.getElementById('active-org-count').textContent = activeOrgs;

    // Count total requirements
    const totalRequirements = orgs.reduce((sum, org) => {
        return sum + (org.requirements ? org.requirements.length : 0);
    }, 0);
    document.getElementById('all-time-submission-count').textContent = totalRequirements;

    // Count active forms
    const activeForms = forms.length;
    document.getElementById('active_form_count').textContent = activeForms;
}

loadDashboard();
loadOrganizations();

