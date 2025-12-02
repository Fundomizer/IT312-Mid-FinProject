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
 * Creates a "tr" HTML element based on selected keys from the object.
 * @param {Object} object - The source object containing data.
 * @param {Array<string>} keysToInclude - Array of keys to include in the row.
 * @returns {HTMLTableRowElement} - A table row with selected data.
 */
export function createTableRow(object, keysToInclude = []) {

    // Create a table row for each object recieved
    const tr = document.createElement("tr");

    const list = Array.isArray(keysToInclude) && keysToInclude.length > 0
        ? keysToInclude.map(key => object[key] !== undefined ? object[key] : "")
        : Object.values(object);

    // Loop through all keys in the object
    list.forEach(value => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
    });

    return tr
}

export function createButton(label, onClick, classStyle = "StyledButton") {
    let button = document.createElement("button")
    button.innerText = label || "button"
    button.classList.add(classStyle)
    if (typeof onClick === "function") { button.addEventListener('click', onClick) }
    return button
}