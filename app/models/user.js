const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

const userModel = new mongoose.model("User", userSchema);

module.exports = userModel;