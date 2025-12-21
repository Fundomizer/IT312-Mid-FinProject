import { fetchCollection, setupPopup } from "../utilities.js";
import { createTableRow, createButton } from "../components.js";
import { HOST, PORT } from "../config.js";

let orgs = []

export async function displayOrgs() {
    orgs = await fetch("/api/admin/rsc/orgs", {
        method: "GET",
        credentials: "include"
    }).then(res => res.json())
    
    renderOrgs(orgs.organizations)
}

function renderOrgs(orgs) {
    const table = document.getElementById('OrgsTableView')

    table.innerHTML = `
                        <tr>
                        <th>Organization name</th>
                        <th>Official email</th>
                        <th>School</th>
                        <th>Description</th>
                        <th>Action</th>
                        </tr>
                    `

    orgs.forEach(item => {
        let tr = createTableRow(item, ["org_name", "official_email", "school", "description"])

        let action = makeActionButtons(item)

        tr.appendChild(action)
        table.appendChild(tr)
    });

    // Assign events
    document.getElementById("EditButton").addEventListener("click", handleEdit);
    document.getElementById('AddOrgButton').addEventListener('click', (e) => {
        setupPopup(
            document.getElementById('AddOrgPopup'),
            e.currentTarget,
            document.getElementById('XAddOrgPopup'),
        )
    })
    document.getElementById('AddOrgForm').addEventListener('submit', (e) => handleAddOrg(e))
    document.getElementById('UserForm').addEventListener('submit', (e) => handleSaveEditOrg(e))
    document.getElementById('SearchInput').addEventListener('input', handleFilter)
    document.getElementById('AlphaFilter').addEventListener('change', handleFilter)
    document.getElementById('SchoolFilter').addEventListener('change', handleFilter)
    document.getElementById('OrgTypeFilter').addEventListener('change', handleFilter)

    document.getElementById('ClearFiltersButton').addEventListener('click', () => {
        document.getElementById('SearchInput').value = "";
        document.getElementById('AlphaFilter').value = "desc";
        document.getElementById('SchoolFilter').value = "All";
        document.getElementById('OrgTypeFilter').value = "All";
        handleFilter();
    });
}

function makeActionButtons(item) {
    let viewButton = createButton("View")
    let deleteButton = createButton("Delete")
    let td = document.createElement('td')

    viewButton.dataset.orgId = item._id
    deleteButton.dataset.orgId = item._id

    td.appendChild(viewButton)
    td.appendChild(deleteButton)

    // Assign functions
    viewButton.addEventListener('click', (e) => {
        handleView(e.currentTarget)
    })
    deleteButton.addEventListener('click', (e) => handleDelete(e.currentTarget))

    return td
}

function handleView(button) {

    const orgId = button.dataset.orgId;

    // Find the org object from the stored list
    const org = orgs.organizations.find(o => o._id === orgId);

    if (!org) {
        console.error("Org not found:", orgId);
        return;
    }

    // Load data into form
    populateOrgForm(org);
    let xButton = document.getElementById("XPopup")
    let popup = document.getElementById("EditOrgPopup")

    popup.dataset.orgId = orgId

    setupPopup(popup, button, xButton, '', onClose)

}

function populateOrgForm(org) {
    // Organization info
    document.getElementById("OrgName").value = org.org_name || "";
    document.getElementById("ShortName").value = org.short_name || "";
    document.getElementById("School").value = org.school || "";
    document.getElementById("OfficialEmail").value = org.official_email || "";
    document.getElementById("OrgType").value = org.org_type || "";
    document.getElementById("Description").value = org.description || "";

    // Adviser info
    document.getElementById("AdviserName").value = org.adviser?.name || "";
    document.getElementById("AdviserEmail").value = org.adviser?.email || "";

    // Officers (fixed 2)
    const officer1 = org.officers?.[0] || {};
    const officer2 = org.officers?.[1] || {};

    document.getElementById("Officer1Name").value = officer1.name || "";
    document.getElementById("Officer1Position").value = officer1.position || "";

    document.getElementById("Officer2Name").value = officer2.name || "";
    document.getElementById("Officer2Position").value = officer2.position || "";
}

async function handleAddOrg(e) {
    e.preventDefault();
    const form = document.getElementById("AddOrgForm");
    const formData = new FormData(form);

    // Convert FormData → plain object
    const data = Object.fromEntries(formData.entries());

    // Build adviser object
    const adviser = {
        name: data.adviser_name,
        email: data.adviser_email
    };

    // Build officers array
    const officers = [
        {
            name: data.officer1_name,
            position: data.officer1_position
        },
        {
            name: data.officer2_name,
            position: data.officer2_position
        }
    ];

    // Final payload
    const payload = {
        org_name: data.org_name,
        short_name: data.short_name,
        school: data.school,
        official_email: data.official_email,
        org_type: data.org_type,
        description: data.description,
        adviser,
        officers
    };

    try {
        const res = await fetch(`/api/admin/org/crt`, { // TODO fix up HOST later on
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (result.success) {
            alert("Organization created successfully");
        } else {
            alert(result.message || "Failed to create organization");
        }

    } catch (err) {
        console.error(err);
        alert("Unexpected error while creating organization");
    }
}

function handleDelete(button) {
    deleteOrganization(button.dataset.orgId)
}

function handleEdit() {
    document.querySelectorAll("#UserForm input, #UserForm textarea, #UserForm select")
        .forEach(el => el.disabled = false);

    document.getElementById("SaveButton").classList.remove("Hidden");
}

function onClose() {
    console.log("Closing popup");

    document.querySelectorAll("#UserForm input, #UserForm textarea, #UserForm select")
        .forEach(el => {
            console.log("Disabling:", el);
            el.disabled = true;
        });

    document.getElementById("EditButton").classList.remove("Hidden");
    document.getElementById("SaveButton").classList.add("Hidden");
}

async function handleSaveEditOrg(e) {
    e.preventDefault();

    const orgId = document.getElementById("EditOrgPopup").dataset.orgId;

    const payload = {
        org_name: document.getElementById("OrgName").value.trim(),
        short_name: document.getElementById("ShortName").value.trim(),
        school: document.getElementById("School").value.trim(),
        official_email: document.getElementById("OfficialEmail").value.trim(),
        org_type: document.getElementById("OrgType").value.trim(),
        description: document.getElementById("Description").value.trim(),

        adviser: {
            name: document.getElementById("AdviserName").value.trim(),
            email: document.getElementById("AdviserEmail").value.trim()
        },

        officers: [
            {
                name: document.getElementById("Officer1Name").value.trim(),
                position: document.getElementById("Officer1Position").value.trim()
            },
            {
                name: document.getElementById("Officer2Name").value.trim(),
                position: document.getElementById("Officer2Position").value.trim()
            }
        ]
    };

    try {
        const res = await fetch(`/api/admin/org/upd/${orgId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (result.success) {
            alert("Organization updated successfully");

            // Optional: refresh your org list
            // loadOrgs();

            // Close popup
            document.getElementById("EditOrgPopup").style.display = "none";

            // Reset fields to disabled
            document.querySelectorAll("#UserForm input, #UserForm textarea, #UserForm select")
                .forEach(el => el.disabled = true);

            document.getElementById("EditButton").classList.remove("Hidden");
            document.getElementById("SaveButton").classList.add("Hidden");

        } else {
            alert(result.message || "Failed to update organization");
        }

    } catch (err) {
        console.error(err);
        alert("Unexpected error while updating organization");
    }
}

function deleteOrganization(id) {
    console.log(id);

    const confirmed = window.confirm("Are you sure you want to delete this organization?");
    if (!confirmed) return;

    fetch(`/api/admin/org/del/${id}`, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Organization deleted successfully!");
                // Optionally refresh the list or redirect
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(err => {
            console.error("Delete error:", err);
            alert("Server error occurred.");
        });
}

async function handleFilter() {
    const term = document.getElementById('SearchInput').value.toLowerCase();
    const alphaSort = document.getElementById('AlphaFilter').value.toLowerCase()
    const school = document.getElementById('SchoolFilter').value.toLowerCase()
    const orgType = document.getElementById('OrgTypeFilter').value.toLowerCase()

    let filtered = orgs.organizations

    filtered = orgs.organizations.filter(org =>
        org['org_name']?.toLowerCase().includes(term) ||
        org['short_name']?.toLowerCase().includes(term) ||
        org['official_email']?.toLowerCase().includes(term) ||
        org['description']?.toLowerCase().includes(term)
    );

    if (school !== 'all') {
        filtered = filtered.filter(org =>
            org['school']?.toLowerCase() === school
        );
    }

    if (orgType !== 'all') {
        filtered = filtered.filter(org =>
            org['org_type']?.toLowerCase() === orgType
        );
    }

    if (alphaSort === "asc") {
        filtered.sort((a, b) => a['org_name'].localeCompare(b['org_name']));
    } else if (alphaSort === "desc") {
        filtered.sort((a, b) => b['org_name'].localeCompare(a['org_name']));
    }

    console.log("Filtered: ", filtered);

    renderOrgs(filtered)
}