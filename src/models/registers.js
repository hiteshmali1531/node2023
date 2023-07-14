require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    pass : {
       type : String,
       required : true,

    },
    cpass : {
        type : String,
        required : true,
    },

    gender : {
        type : String,
        required : true,
    },
    phone : {
        type : Number,
        required : true,
        unique : true,
        minlength : 10
    },
    tokens:[
        {
            token :{
                type : String,
                required : true
            }
        }
    ]

})

registerSchema.methods.generateAuthToken = async function(){
    try{
        const token = await jwt.sign({_id : this._id.toString()}, process.env.SECRET_KEY);
        // console.log(token);
        this.tokens = this.tokens.concat({token : token});
        await this.save();
        return token;
    }catch(e){
        console.log(e);
    }
}
//converting password into hash 
registerSchema.pre("save",async function(next){
    if(this.isModified("pass")){

        console.log(`the current password if ${this.pass}`);
        this.pass = await bcrypt.hash(this.pass, 10);
        this.cpass = await bcrypt.hash(this.cpass, 10);
        console.log(`the current password if ${this.pass}`);
    }
    next();
})

const Register =  new mongoose.model('Register', registerSchema);

module.exports = Register;