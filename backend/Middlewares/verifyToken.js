let jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyToken(req, res, next){
    let bearerToken = req.headers.authorization;
    if(bearerToken == null){
        return res.send({message: "unauthorized access"});
    }
    try{
        let token = bearerToken.split(" ")[1];
        let jwt_secret = process.env.JWT_SECRET;
        let status = jwt.verify(token, jwt_secret);
        next();
    }
    catch(err){
        res.send({errMessage: err.message});
    }
}

module.exports = verifyToken;