const { connectToDB } = require('../database/connect.js')
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
            return res.status(400).json({
                message: "Invalid email or password",
                status: false
            });
        }
        console.log(`${user.email} has logged in`);
        // If user already has a session, destroy it
        if (req.session.userId && req.session.userId !== user._id.toString()) {
            req.session.destroy(() => { });
        }

        // New session
        req.session.user = {
            id: user._id.toString(),
            role: user.role.toLowerCase(),
            name: user.name,
            email: user.email,
            organization: user.organization || null
        }


        let role = user.role.toLowerCase()
        let redirect = ""
        if (role === 'admin') {
            redirect = '/pages/admin/admin_page.html'
        } else if (role === 'student organization user') {
            redirect = '/pages/org/org_page.html'
        } else if (role === 'osa') {
            redirect = '/pages/osa/osa_page.html'
        } else {
            return res.status(500).json({ message: "Server error", status: false });
        }

        res.json({
            message: "Login successful",
            success: true,
            redirect: redirect,
            username: user.name ,
            role: role
            
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", status: false });
    }
}

exports.getProfile = (req, res) => {
    console.log(`Sent profile to ${req.session.user.name}`);
    
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "Not logged in" });
    }

    res.json({
        success: true,
        loggedIn: true,
        user: req.session.user
    });
};

exports.logout = (req, res) => {
console.log(`${req.session.user.name} logged out`);
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Logout failed", success: false });
        }

        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully", success: true });
    });
};
