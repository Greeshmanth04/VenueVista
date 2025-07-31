const exp = require('express');
const app = exp();

require("dotenv").config();

let cors = require("cors");
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://bsgzkqvn-4000.inc1.devtunnels.ms"
    ],
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

let path = require("path");
app.use(exp.static(path.join(__dirname, "../frontend/dist")));

app.use(exp.json());

const userApp = require("./APIs/user-api.js");
const adminApp = require("./APIs/admin-api.js");

app.use("/user-api", userApp);
app.use("/admin-api", adminApp);

const mongoClient = require("mongodb").MongoClient
const db_url = process.env.DB_URL;
mongoClient.connect(db_url)
.then(client => {
    let dbObj = client.db("hallbooking");

    let adminCollection = dbObj.collection("admin");
    let usersCollection = dbObj.collection("users");
    let hallsCollection = dbObj.collection("halls");
    let bookingsCollection = dbObj.collection("bookings");

    app.set("adminCollection", adminCollection);
    app.set("usersCollection", usersCollection);
    app.set("hallsCollection", hallsCollection);
    app.set("bookingsCollection", bookingsCollection);

    console.log("MongoDB server is running on port 27017");
})
.catch(err => console.log(err));

app.use((err, req, res, next)=>{
    res.send({errMessage: err.message});
});

port = process.env.PORT || 4000;
app.listen(port, ()=> console.log(`HTTP server is running on port ${port}`));