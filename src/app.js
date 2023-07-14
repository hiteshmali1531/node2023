require('dotenv').config();
const express = require('express');
const app = express();
require('./db/conn');
const hbs = require('hbs');
const path = require('path');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');



const Register = require('./models/registers');
const bcrypt = require('bcryptjs');
const port = process.env.PORT || 3000;
// console.log(process.env.SECRET_KEY);
// const securePssword = async(pass) =>{
//     const result = await bcrypt.hash(pass, 10);
//     console.log(result);

//     const verify = await bcrypt.compare(pass, result);
//     console.log(true);
// }

// securePssword("Hiteshmali");

// Importang pathe 
const publicPath = path.join(__dirname, '../public');
const templatPath = path.join(__dirname, '../templates/views')
const partialPath = path.join(__dirname, '../templates/partials')


app.use(express.static(publicPath));
app.set("view engine", "hbs")
app.set("views", templatPath);
hbs.registerPartials(partialPath);


app.get("/register", (req, res) =>{
    res.render("index");
});
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended : false}))

app.get('/secret',auth,(req, res) =>{
    console.log(`this is cookie ${req.cookies.jwt}`);
    res.status(200).render('secret')
})
app.get('/logout', auth, async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((currElement)=>{
            return currElement.token != req.token;
        })
        res.clearCookie('jwt');

        await req.user.save();
        console.log("logged out")
        res.render('login')
    } catch (error) {
        res.status(500).send(error);
    }
})
app.post("/register", async(req, res) =>{
    try{

        const pass = req.body.password;
        const cpass = req.body.confirmpassword;


        if(pass === cpass){
            
            const registerEmployee = new Register({
                name : req.body.name,
                pass : req.body.password,
                cpass : req.body.confirmpassword,
                email : req.body.email,
                phone : req.body.phone,
                gender : req.body.gender

            });
            const token = await registerEmployee.generateAuthToken();

            res.cookie("jwt", token, {
                expires : new Date(Date.now() + 60000),
                httpOnly : true
            });
            // console.log(cookie);
            const result = await registerEmployee.save();
            // console.log(result);
            res.status(201).send(result);
        }else{
            res.send("password are not match");
        }
        // console.log(req.body.name);
        // res.send(req.body.name);
    }catch(err){
        console.log(err);
        res.status(400).send(err);
    }
})

app.get("/login", (req, res) =>{
    res.render("login");
})

app.post("/login", async(req, res) =>{
    try{
        const email = req.body.email;
        const pass  = req.body.password;
        // console.log(`email: ${email} , password: ${pass}`);
        const result = await Register.findOne({email: email});
        if(result){
            const isMatch = await bcrypt.compare(pass, result.pass);
            const token = await result.generateAuthToken();
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 60000),
                httpOnly: true,
                // secure: true
            });
            

            console.log(token);
            // console.log(pass, result.pass);
            // if(result.pass === pass){
            if(isMatch){

                res.status(200).send("success");
            }else{
                res.send("Incorrect password");
            }
        }else{
            res.status(400).send("Invalid email address");
        }
        // console.log(result);
    }catch(err){
        res.status(400).send("Envalid email address");
    }
})

// const jwt = require("jsonwebtoken");

// create a new token

// const createToken = async() =>{
//   const token =  await jwt.sign({_id : "43434344agej383838"}, "kfjalfjkskfldsjfklsjkslfjiereowrujdajfkasjk", {
//     expiresIn: "2 seconds"
//   });
//     console.log(token);
//     const userVer = await jwt.verify(token, "kfjalfjkskfldsjfklsjkslfjiereowrujdajfkasjk");
//     console.log(userVer);
// }

// createToken();

app.listen(port, (req, res) =>{
    console.log(`listening on ${port}`);
})