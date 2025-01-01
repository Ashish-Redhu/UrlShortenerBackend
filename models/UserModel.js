const mongoose = require("mongoose");

const USER_TYPE = {
    "PREMIUM" : "PremiumUser",
    "NORMAL" : "NormalUser"
}

const userSchema = mongoose.Schema({
    name: {
        type: String, 
        required: true,
        minlength: [3, 'Name must be at least 3 characters long'],  // Min length
        maxlength: [15, 'Name cannot be longer than 15 characters']  // Max length
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, "Please enter a valid email"], // Validate email format
    },
    password:{
        type: String,
        required: true,
        minlength: 8,

        // Note: 
        // We have to remove this validator from here and use it in the backend before hashing.
        // validate: {
        //     validator: function (value) {
        //         // Ensure password contains at least one letter, one number, and one special character
        //         return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
        //     },
        //     message: "Password must contain at least one letter, one number, and one special character",
        // },
    },
    type:{
        type: String,
        enum: USER_TYPE,
        required: true,
        default: USER_TYPE.NORMAL,
    },
    walletMoney: {
        type: Number,
        required: true,
        default: 0, // Set initial wallet balance to 0 Dollar
    },
    urls:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UrlModel',
    }],
    createdAt:{
        type: Date,
        default: Date.now,
    },
});

// Standalone function to check wallet balance and update user type
const updateUserType = function(update) {
    if (update.walletMoney >= 100) {
        update.type = USER_TYPE.PREMIUM;
    } else {
        update.type = USER_TYPE.NORMAL;
    }
    
    return update;
};

const UserModel = mongoose.model('UserModel', userSchema);

module.exports = {
    UserModel,
    updateUserType, // Export the standalone function
};