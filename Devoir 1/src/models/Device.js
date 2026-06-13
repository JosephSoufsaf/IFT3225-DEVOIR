const mongoose = require("mongoose");
const crypto = require("crypto");

const deviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    apiKey: {
        type: String,
        unique: true
    }
}, { 
    strict: "throw", // Enforce strict schema constraints 
    timestamps: true 
});

// Automate secure token string calculation on save hook
deviceSchema.pre("save", async function() {
    if (!this.apiKey) {
        this.apiKey = "api_" + crypto.randomBytes(24).toString("hex");
    }
    // Simply return or finish execution. Modern Mongoose automatically 
    // knows to proceed when an async hook resolves.
});

module.exports = mongoose.model("Device", deviceSchema);