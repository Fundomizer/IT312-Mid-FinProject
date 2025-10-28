// This script will be used for creating components used by multiple pages

// Reusable function for creating nav bar buttons
export function createNavItem({ icon, label, onClick }) {
    const li = document.createElement("li");

    const button = document.createElement("button");
    button.classList.add("NavItems");

    const iconSpan = document.createElement("span");
    iconSpan.classList.add("icon");
    iconSpan.textContent = icon;

    const labelSpan = document.createElement("span");
    labelSpan.classList.add("label");
    labelSpan.textContent = label;

    button.appendChild(iconSpan);
    button.appendChild(labelSpan);

    if (onClick) button.addEventListener("click", onClick);

    li.appendChild(button);
    return li;
}

/**
 * Creates a "tr" HTML element based on the object passed.
 * @param {JSON} object The JSON object that contains the data in the table row
 * @returns tr HTML element
 */
export function createTableRow(object) {

    // Create a table row for each object recieved
    const tr = document.createElement("tr");

    // Loop through all keys in the object
    Object.values(object).forEach(value => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
    });

    return tr
}