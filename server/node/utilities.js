/**
 * Removes empty properties
 * @param {Object} obj 
 * @returns 
 */
exports.sanitizeObject = (obj) => {
    const cleaned = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed !== "") {
                cleaned[key] = trimmed;
            }
        } else if (value !== null && value !== undefined) {
            cleaned[key] = value;
        }
    }

    return cleaned;
}
