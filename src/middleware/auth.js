const jwt = require('jsonwebtoken');

const Register = require('../models/registers');

const auth = async(req,res, next) =>{
    try {
        const token = req.cookies.jwt;
        const verifyUser =await jwt.verify(token, process.env.SECRET_KEY);
        console.log("verify ",verifyUser);
        const user = await Register.findOne({_id: verifyUser._id});
        console.log(user);
        req.token = token;
        req.user = user
        next();
    } catch (error) {
        res.status(404).send(error);
    }
}

module.exports = auth;