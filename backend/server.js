const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require("dotenv").config();
const path = require("path");

app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        "https://bsgzkqvn-4000.inc1.devtunnels.ms"
    ],
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.use(express.json());

const userApp = require("./APIs/user-api.js");
const adminApp = require("./APIs/admin-api.js");

app.use("/user-api", userApp);
app.use("/admin-api", adminApp);

const db_url = process.env.DB_URL;
mongoose.connect(db_url, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {console.log("MongoDB connected successfully")})
.catch(err => {console.error("MongoDB connection error:", err.message)});

app.use((err, req, res, next) => {
    res.status(500).send({ errMessage: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {console.log(`HTTP server is running on port ${port}`)});
