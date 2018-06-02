//Links Mongoose (db) and passport for local authentication

var mongoose = require("mongoose")
var passportLocalMongoose = require("passport-local-mongoose")

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    email: String,
});

UserSchema.plugin(passportLocalMongoose);

//export User Object Model to app.js (or other files if needed)  
module.exports = mongoose.model("User", UserSchema);