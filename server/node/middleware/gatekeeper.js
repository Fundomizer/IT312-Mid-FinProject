// THE GATEKEEPER
// Gatekeeps resources ensuring no unauthorised access

exports.requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "Not logged in" });
    }
    next();
};

exports.requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Not logged in" });
        }

        const role = req.session.user.role;

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        next();
    };
};
