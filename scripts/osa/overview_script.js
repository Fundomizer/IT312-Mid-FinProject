const HOST = window.location.origin

async function loadOrganizations() {
  try {
    const response = await fetch(`${HOST}/IT312-Mid-FinProject/server/php/api.php?collection=student_organization`);
    const data = await response.json();

    const orgContainer = document.getElementById("organizations-list");

    // Keep header
    const orgHeader = orgContainer.querySelector("h3");
    orgContainer.innerHTML = "";
    orgContainer.appendChild(orgHeader);

    data.forEach(org => {
      const reqObj = org.requirements || {};
      const reqCount = Object.keys(reqObj).length;

      // Create card
      const card = document.createElement('div');
      card.className = 'organization-item';

      // Header
      const header = document.createElement('div');
      header.className = 'org-header';
      header.innerHTML = `
        <div class="org-title">
          <span class="name">${org.org_name}</span>
          <span class="short">${org.short_name} — ${org.school}</span>
        </div>
        <div class="org-toggle">▶</div>
      `;

      // Dropdown
      const dropdown = document.createElement('div');
      dropdown.className = 'org-dropdown';

      // Info section
      const infoDiv = document.createElement('div');
      infoDiv.innerHTML = `
        <p><b>School:</b> ${org.school || 'N/A'}</p>
        <p><b>Type:</b> ${org.org_type || 'N/A'}</p>
        ${org.adviser?.name ? `<p><b>Adviser:</b> ${org.adviser.name}</p>` : ''}
        ${org.officers?.length ? `<p><b>Officers:</b></p>
          <ul>${org.officers.map(o => `<li>${o.position}: ${o.name}</li>`).join('')}</ul>` : ''}
        <h4>Submitted Requirements (${reqCount})</h4>
      `;
      dropdown.appendChild(infoDiv);

      // Add requirements
      if (reqCount === 0) {
        const none = document.createElement('p');
        none.textContent = 'No submitted requirements.';
        dropdown.appendChild(none);
      } else {
        Object.entries(reqObj).forEach(([type, info]) => {
          const entry = document.createElement('div');
          entry.className = 'requirement-entry';
          entry.innerHTML = `
            <div class="type">${type.replace(/_/g,' ')}</div>
            <div>Tags: ${(info.tags || []).join(', ') || '—'}</div>
            <div>Last Updated: ${info.last_updated || 'N/A'}</div>
          `;
          dropdown.appendChild(entry);
        });
      }

      // Append header + dropdown
      card.appendChild(header);
      card.appendChild(dropdown);
      orgContainer.appendChild(card);

      // Toggle behavior
      header.addEventListener('click', () => {
        const isOpen = card.classList.toggle('open');
        if (isOpen) {
          dropdown.style.maxHeight = dropdown.scrollHeight + 'px';
        } else {
          dropdown.style.maxHeight = '0px';
        }
      });
    });

  } catch (err) {
    console.error('Error loading organizations:', err);
  }
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
