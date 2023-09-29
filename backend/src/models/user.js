const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format.']
    },
    password: {
        type: String,
        required: false
    },
    phone:{
        type:String,
        require:false
    },
    profile:{
        type:String,
        require:false
    },
    role: {
        type: String,
        required: false,
        enum: ['user', 'admin','supervisor'],
        default:'user' 
    },

    isActivated:{
        type:Boolean,
        default:false
    },

    created: {
        type: String,
        required: false
    },
   
    
}, { versionKey: false });

const User = mongoose.model("User", userSchema)
module.exports = User
