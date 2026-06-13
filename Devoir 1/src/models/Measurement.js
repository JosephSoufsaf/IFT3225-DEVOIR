const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ["soundPressureLevel", "temperature", "light"], // Extensible design
        default: "soundPressureLevel"
    },
    value: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now // Real-time capture fallback
    },
    receivedAt: {
        type: Date,
        default: Date.now // Server ingestion time tracker
    }
}, { strict: "throw" });

module.exports = mongoose.model("Measurement", measurementSchema);