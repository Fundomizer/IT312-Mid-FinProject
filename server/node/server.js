const express = require('express');
const session = require('express-session')
const cors = require('cors');
const { connectToDB, url } = require('./database/connect');
const { default: MongoStore } = require('connect-mongo');

const port = 8123
const app = express();

app.use(express.json());
app.set("json spaces", 4) // Pretty print 
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

console.log("My MongoStore: ", MongoStore);

app.use(session({ // Configure session handling 
    secret: "KeepThisSecretToYourself", // Secret :P
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongoUrl: url,
        collectionName: "sessions",
        ttl: 20,
    }),
    cookie: {
        maxAge: (1000 * 20), // How long the cookie will be saved, btw this is in millisecond
        httpOnly: true,
        secure: false,                     // set true if using HTTPS
        sameSite: "lax",                   // or "none" if cross-site + HTTPS
    }
}))

async function startServer() {
    const db = await connectToDB()

    const collectionNames = ["forms", "log", "student_organization", "users"]

    collectionNames.forEach(name => {
        const collection = db.collection(name)
        if (name === "users") collection.createIndex({ email: 1 }, { unique: true });
        app.get(`/api/${name}`, async (req, res) => {
            try {
                const all = await collection.find().toArray();
                res.json(all);
            } catch (e) {
                res.status(500).send({ error: e.message })
            }
        });
    })

    // Register routes
    app.use('/api/auth', require('./routes/auth'))
    app.use('/api/users', require('./routes/users'))
    app.use('/api/orgs', require('./routes/organization'))

    app.listen(port, "0.0.0.0", () => {
        console.log(`Node server running on port ${port}`);
    })
}

startServer()