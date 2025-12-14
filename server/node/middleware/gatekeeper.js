// THE GATEKEEPER
// Gatekeeps resources ensuring no unauthorised access

exports.requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect(302, "/");
    }
    next();
};

exports.requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect(302, "/");
        }

        const role = req.session.user.role;

        if (!allowedRoles.includes(role)) {
            return res.redirect(302, "/");
        }

        next();
    };
};
