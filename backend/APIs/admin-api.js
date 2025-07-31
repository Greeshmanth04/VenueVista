let exp = require("express");
let adminApp = exp.Router();

let expressAsyncHandler = require("express-async-handler");
let bcryptjs = require("bcryptjs");
let jwt = require("jsonwebtoken");
let verifyToken = require("../Middlewares/verifyToken.js");

//Login
adminApp.post("/login", expressAsyncHandler(async(req, res)=>{
    let adminCollection = req.app.get("adminCollection");
    let user = req.body;
    user.email = user.email.toLowerCase();
    let dbUser = await adminCollection.findOne({email: user.email});
    if(dbUser === null){
        return res.send({message: "Wrong email"})
    }
    let status = await bcryptjs.compare(user.password, dbUser.password);
    if(status == false){
        return res.send({message: "wrong password"});
    }
    let jwt_secret = process.env.JWT_SECRET;
    let token = jwt.sign({user: user.email}, jwt_secret, {expiresIn: "50m"});
    delete dbUser.password;
    res.send({message: "user login successful", token: token, user: dbUser});
}));

//Get all halls
adminApp.get("/halls", expressAsyncHandler(async(req, res)=>{
    let hallsCollection = req.app.get("hallsCollection");
    let halls = await hallsCollection.find().toArray();
    res.send({message: "received all halls", halls: halls});
}));

//Add hall
adminApp.post("/hall", verifyToken, expressAsyncHandler(async(req, res)=>{
    let hallsCollection = req.app.get("hallsCollection");
    let hall = req.body;
    let dbhall = await hallsCollection.findOne({name: hall.name});
    if(dbhall != null){
        return res.send({message: "hall already exists"});
    }
    await hallsCollection.insertOne(hall);
    res.send({message: "new hall added", hall: hall});
}));

//Update hall
adminApp.put("/hall", verifyToken, expressAsyncHandler(async(req, res)=>{
    let hallsCollection = req.app.get("hallsCollection");
    let hall = req.body;
    let dbhall1 = await hallsCollection.findOne({ id: hall.id });
    if (!dbhall1) {
        return res.send({ message: "Hall doesn't exist" });
    }
    let dbhall2 = await hallsCollection.findOne({name: hall.name, id: { $ne: hall.id }});
    if (dbhall2) {
        return res.send({ message: "Hall name already exists" });
    }
    await hallsCollection.updateOne({ id: hall.id }, { $set: { ...hall } });
    let updatedHall = await hallsCollection.findOne({ id: hall.id });
    res.send({ message: "Hall details updated", hall: updatedHall });
}));

//Block hall
adminApp.put("/block-hall/:name", verifyToken, expressAsyncHandler(async(req, res)=>{
    let hallsCollection = req.app.get("hallsCollection");
    let name = req.params.name;
    let dbhall = await hallsCollection.findOne({name: name});
    if(dbhall == null){
        return res.send({message: "hall doesn't exists"});
    }
    if(dbhall.blockStatus == false){
        await hallsCollection.updateOne({name: name},{$set:{blockStatus: true}});
        res.send({message: "hall has been blocked"});
    }
    else{
        await hallsCollection.updateOne({name: name},{$set:{blockStatus: false}});
        res.send({message: "hall has been unblocked"});
    }
}));

//Delete hall
adminApp.delete("/hall/:name", verifyToken, expressAsyncHandler(async (req, res) => {
    const hallsCollection = req.app.get("hallsCollection");
    const name = req.params.name;
    const dbhall = await hallsCollection.findOne({ name });
    if (!dbhall) {
        return res.send({ message: "Hall doesn't exist" });
    }
    await hallsCollection.deleteOne({ name });
    res.send({ message: "Hall has been deleted" });
}));

//Get all users
adminApp.get("/users", verifyToken, expressAsyncHandler(async(req, res)=>{
    let usersCollection = req.app.get("usersCollection");
    let users = await usersCollection.find().toArray();
    users.forEach((user)=> delete user.password);
    res.send({message: "received all users", users: users});
}));

//Verify user
adminApp.put("/verify-user/:email", verifyToken, expressAsyncHandler(async(req, res)=>{
    let usersCollection = req.app.get("usersCollection");
    let email = req.params.email;
    let dbuser = await usersCollection.findOne({email: email});
    if(dbuser == null){
        return res.send({message: "user doesn't exist" });
    }
    if(dbuser.activeStatus == false){
        return res.send({message: "user has been blocked and can't be verified"});
    }
    if(dbuser.verifyStatus == false){
        await usersCollection.updateOne({email: email},{$set:{verifyStatus: true}});
        res.send({message: "user has been verified"});
    }
    else{
        res.send({message: "user has already been verified"});
    }
}));

//Block user 
adminApp.put("/block-user/:email", verifyToken, expressAsyncHandler(async(req, res)=>{
    let usersCollection = req.app.get("usersCollection");
    let email = req.params.email;
    let dbuser = await usersCollection.findOne({email: email});
    if(dbuser == null){
        return res.send({message: "user doesn't exist" });
    }
    if(dbuser.verifyStatus == false && dbuser.activeStatus == true){
        await usersCollection.updateOne({email: email},{$set:{activeStatus: false}});
        res.send({message: "user has been rejected"});
    }
    else if(dbuser.activeStatus == false){
        await usersCollection.updateOne({email: email},{$set:{activeStatus: true}});
        res.send({message: "user has been unblocked"});
    }
    else{
        await usersCollection.updateOne({email: email},{$set:{activeStatus: false}});
        res.send({message: "user has been blocked"});
    }
}));

//View all bookings
adminApp.get("/bookings", expressAsyncHandler(async(req, res)=>{
    let bookingsCollection = req.app.get("bookingsCollection");
    let bookings = await bookingsCollection.find().toArray();
    res.send({message: "received all bookings", bookings: bookings});
}));

///View specific hall bookings
adminApp.get("/hall-bookings/:hallname", expressAsyncHandler(async(req, res)=>{
    let bookingsCollection = req.app.get("bookingsCollection");
    let hallname = req.params.hallname;
    let bookings = await bookingsCollection.find({hallname: hallname, verifyStatus: true}).toArray();
    res.send({message: "received all bookings", bookings: bookings});
}));

//verify booking
adminApp.put("/verify-booking/:bookingID", verifyToken, expressAsyncHandler(async(req, res)=>{
    let bookingsCollection = req.app.get("bookingsCollection");
    let bookingID = Number(req.params.bookingID);
    let dbBooking = await bookingsCollection.findOne({bookingID: bookingID});
    if(dbBooking == null){
        return res.send({message: "booking doesn't exist" });
    }
    if(dbBooking.activeStatus == false){
        res.send({message: "booking has been deactivated"});
    }
    else if(dbBooking.verifyStatus == false){
        await bookingsCollection.updateOne({bookingID: bookingID},{$set:{verifyStatus: true}});
        res.send({message: "booking has been verified"});
    }
    else{
        res.send({message: "booking has already been verified"});
    }
}));

//Block booking
adminApp.put("/block-booking/:bookingID", verifyToken, expressAsyncHandler(async(req, res)=>{
    let bookingsCollection = req.app.get("bookingsCollection");
    let bookingID = Number(req.params.bookingID);
    let dbBooking = await bookingsCollection.findOne({bookingID: bookingID});
    if(dbBooking == null){
        return res.send({message: "booking doesn't exist" });
    }
    if(dbBooking.verifyStatus == false && dbBooking.activeStatus == true){
        await bookingsCollection.updateOne({bookingID: bookingID},{$set:{activeStatus: false}});
        res.send({message: "booking has been rejected"});
    }
    else if(dbBooking.activeStatus == false){
        let status = await bookingsCollection.findOne({bookingID: {$ne: bookingID}, hallname: dbBooking.hallname, date: dbBooking.date, slot: dbBooking.slot, activeStatus: true, verifyStatus: true});
        if(status != null){
            return res.send({message: "this slot has been booked and can't be unblocked"});
        }
        await bookingsCollection.updateOne({bookingID: bookingID},{$set:{activeStatus: true}});
        res.send({message: "booking has been unblocked"});
    }
    else{
        await bookingsCollection.updateOne({bookingID: bookingID},{$set:{activeStatus: false}});
        res.send({message: "booking has been blocked"});
    }
}));

module.exports = adminApp;