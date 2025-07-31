let exp = require("express");
let userApp = exp.Router();

let expressAsyncHandler = require("express-async-handler");
let bcryptjs = require("bcryptjs");
let jwt = require("jsonwebtoken");
let verifyToken = require("../Middlewares/verifyToken.js");

//Register
userApp.post("/user", expressAsyncHandler(async(req, res)=>{
    let usersCollection = req.app.get("usersCollection");
    let user = req.body;
    user.email = user.email.toLowerCase();
    let dbUser = await usersCollection.findOne({email: user.email});
    if(dbUser != null){
        if(dbUser.activeStatus == false){
            return res.send({message: "email has been blocked"});
        }
        else if(dbUser.verifyStatus == true){
            return res.send({message: "email has already been registered and approved"});
        }
        else{
            return res.send({message: "email has already been registered. waiting for approval..."});
        } 
    }
    let hashedPassword = await bcryptjs.hash(user.password, 7);
    user.password = hashedPassword;
    await usersCollection.insertOne(user);
    delete user.password;
    res.send({message: "Email request has been sent. waiting for approval...", user: user});
}));

//Login
userApp.post("/login", expressAsyncHandler(async(req, res)=>{
    let usersCollection = req.app.get("usersCollection");
    let user = req.body;
    user.email = user.email.toLowerCase();
    let dbUser = await usersCollection.findOne({email: user.email});
    if(dbUser == null){
        return res.send({message: "email has not been registered"})
    }
    let status = await bcryptjs.compare(user.password, dbUser.password);
    if(status == false){
        return res.send({message: "wrong password"});
    }
    if(dbUser.activeStatus == false){
        return res.send({message: "user has been blocked"});
    }
    if(dbUser.verifyStatus == false){
        return res.send({message: "user has not been approved"});
    }
    let jwt_secret = process.env.JWT_SECRET;
    let token = jwt.sign({user: user.email}, jwt_secret, {expiresIn: "50m"});
    delete dbUser.password;
    res.send({message: "user login successful", token: token, user: dbUser});
}));

//View all halls
userApp.get("/halls", expressAsyncHandler(async(req, res)=>{
    let hallsCollection = req.app.get("hallsCollection");
    let halls = await hallsCollection.find({blockStatus: false}).toArray();
    res.send({message: "received all halls", halls: halls});
}));

//Book hall
userApp.post("/booking", verifyToken, expressAsyncHandler(async(req, res)=>{
    let bookingsCollection = req.app.get("bookingsCollection");
    let booking = req.body;
    let dbBooking = await bookingsCollection.findOne(booking);
    if(dbBooking != null){
        return res.send({message: "booking already exists"});
    }
    let status = await bookingsCollection.findOne({bookingEmail: booking.bookingEmail, hallname: booking.hallname, date: booking.date, slot: booking.slot, activeStatus: false, verifyStatus: true});
    if(status != null){
        return res.send({message: "you have already booked this slot and it's currently blocked"});
    }
    status = await bookingsCollection.findOne({bookingEmail: booking.bookingEmail, hallname: booking.hallname, date: booking.date, slot: booking.slot, activeStatus: true, verifyStatus: false});
    if(status != null){
        return res.send({message: "you have already booked this slot and it's pending..."});
    }
    status = await bookingsCollection.findOne({hallname: booking.hallname, date: booking.date, slot: booking.slot, activeStatus: true, verifyStatus: true});
    if(status != null){
        return res.send({message: "this slot has already been booked"});
    }
    await bookingsCollection.insertOne(booking);
    res.send({message: "booking done", booking: booking});
}));

//View all bookings
userApp.get("/bookings", expressAsyncHandler(async(req, res)=>{
    let bookingsCollection = req.app.get("bookingsCollection");
    let bookings = await bookingsCollection.find({activeStatus: true, verifyStatus: true}).toArray();
    res.send({message: "received all bookings", bookings: bookings});
}));

///View specific hall bookings
userApp.get("/hall-bookings/:hallname", expressAsyncHandler(async(req, res)=>{
    let bookingsCollection = req.app.get("bookingsCollection");
    let hallname = req.params.hallname;
    let bookings = await bookingsCollection.find({hallname: hallname, activeStatus: true, verifyStatus: true}).toArray();
    res.send({message: "received all bookings", bookings: bookings});
}));

//View user bookings
userApp.get("/user-bookings/:email", verifyToken, expressAsyncHandler(async(req, res)=>{
    let bookingsCollection = req.app.get("bookingsCollection");
    let email = req.params.email;
    let userBookings = await bookingsCollection.find({bookingEmail: email}).toArray();
    res.send({message: `received all active bookings from ${email}`, userBookings: userBookings});
}));


//Cancel booking
userApp.put("/cancel-booking/:bookingID", verifyToken, expressAsyncHandler(async(req, res)=>{
    let bookingsCollection = req.app.get("bookingsCollection");
    let bookingID = Number(req.params.bookingID);
    let dbBooking = await bookingsCollection.findOne({bookingID: bookingID});
    if(dbBooking == null){
        return res.send({message: "booking doesn't exist" });
    }
    if(dbBooking.activeStatus == false){
        return res.send({message: "booking has already been canceled"});
    }
    await bookingsCollection.updateOne({bookingID: bookingID},{$set:{activeStatus: false, verifyStatus: false}});
    res.send({message: "booking has been canceled"});
}));

module.exports = userApp;