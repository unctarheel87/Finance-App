var mongoose   = require("mongoose")

// SCHEMA SETUP 
var budgetSchema = new mongoose.Schema({
    rent: Number,
    utility: Number,
    food: Number,
    phone: Number,
    car: Number,
    social: Number,
    misc: Number,
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:  "User"
        },    
        username: String    
    }    
});


// Mongoose Model

module.exports = mongoose.model("Budget", budgetSchema);