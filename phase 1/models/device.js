const mongoose = require('mongoose');

const devicesSchema = new mongoose.Schema({  
    name: {
        type: String,
        required: true,
    },
    location: { 
        type: String,
        required: true,
    }, // I am not sure if we should have a location for a device model.
    apiKey: {
        type: String,
        unique: true,
        required:true
    }
})

module.exports = mongoose.model("device", devicesSchema);