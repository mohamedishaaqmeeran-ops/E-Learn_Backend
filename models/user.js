const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["customer", "vendor", "admin"],
        default: "customer"
    },

    phone: {
        type: String
    },

    assignedShop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        default: null
    },

    // ✅ ADD THIS
    profilePicture: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);