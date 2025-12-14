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
/**
 * Createa ._lastSeen varialbe inside session to show that the user is not idle
 * @param {request} req
 */
exports.touchSession = (req) => {
    if (req.session) {
        req.session._lastSeen = Date.now(); // write something to mark activity
        req.session.save();
    }
}
