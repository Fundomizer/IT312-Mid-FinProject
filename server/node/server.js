const express = require('express');
const session = require('express-session')
const cors = require('cors');
const { connectToDB, url } = require('./database/connect');
const { default: MongoStore } = require('connect-mongo');
const { exposeEndpoints } = require('./endpoints');
const fileUpload = require("express-fileupload");

const port = 8123
const app = express();

app.use(express.json());
app.set("json spaces", 4) // Pretty print 


app.use(fileUpload({
    createParentPath: true
}));

// Cross origin access
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like curl or mobile apps)
        if (!origin) return callback(null, true);

        // allow LAN IPs: 192.168.x.x or 10.x.x.x
        if (/^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin) ||
            /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin) ||
            origin === "http://localhost" ||
            origin === "http://127.0.0.1") {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}))

// Caching settings
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    next();
});

app.use(session({ // Configure session handling 
    secret: "KeepThisSecretToYourself", // Secret :P
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongoUrl: url,
        collectionName: "sessions",
        ttl: 60 * 60, // This in seconds btw
    }),
    cookie: {
        maxAge: (1000 * 60 * 60), // How long the cookie will be saved, btw this is in millisecond
        httpOnly: true,
        secure: false,                     // set true if using HTTPS
        sameSite: "lax",                   // or "none" if cross-site + HTTPS
    }
}))

async function startServer() {
    const db = await connectToDB();
    exposeEndpoints(db, app)

    // Register routes
    app.use('/api/auth', require('./routes/auth'))
    app.use('/api/users', require('./routes/users'))
    app.use('/api/orgs', require('./routes/organization'))

    app.listen(port, "0.0.0.0", () => {
        console.log(`Node server running on port ${port}`);
    })
}

startServer()