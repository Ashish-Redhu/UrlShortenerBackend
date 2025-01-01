const mongoose = require("mongoose");
const urlSchema = mongoose.Schema({
    key:{
        type: String,
        required: true,
        unique: true,
    },
    value:{
       type: String,
       required: true,
    },
    type: {
        type: String,
        enum: ["NormalUrl", "PremiumUrl"],
        require: true,
        default: "NormalUrl",
    },
    users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
});
const UrlModel = mongoose.model('UrlModel', urlSchema);

module.exports = UrlModel;
