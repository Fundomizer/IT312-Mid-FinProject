const { ObjectId } = require('mongodb')
const sanitiseObject = require('../utilities')

exports.login = async (req, res) => {
    const db = req.app.locals.db;

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

        res.json({ message: "Login successful", status: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", status: false });
    }
}

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Logout failed", status: false });
        }
        res.json({ message: "Logged out successfully", status: true });
    });
};
