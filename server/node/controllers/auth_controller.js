const connectToDB = require('../database/connect.js')
const { sanitizeObject } = require('../utilities.js')

let db;

(async () => {
    db = await connectToDB();
})();

exports.login = async (req, res) => {
    const users = db.collection("users");

    const { email, password } = sanitizeObject(req.body);

    try {
        const user = await users.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid email or password", status: false });
        }

        // If user already has a session, destroy it
        if (req.session.userId && req.session.userId !== user._id.toString()) {
            req.session.destroy(() => { });
        }

        // Create new session
        req.session.userId = user._id.toString();
        req.session.role = user.role;

        let role = user.role.toLowerCase()
        let redirect = ""
        if (role === 'admin') {
            redirect = '/pages/admin/admin_page.html'
        } else if (role === 'student organization user') {
            redirect = '/pages/org/org_page.html'
        } else if (role === 'osa') {
            redirect = '/pages/osa/osa_page.html'
        } else {
            res.status(500).json({ message: "Server error", status: false });
        }

        res.json({ message: "Login successful", success: true, redirect: redirect });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", status: false });
    }
}

exports.getProfile = (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Not logged in" });
    }

    res.json({
        loggedIn: true,
        userId: req.session.userId,
        role: req.session.role
    });
};


exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Logout failed", success: false });
        }
        res.json({ message: "Logged out successfully", success: true });
    });
};
