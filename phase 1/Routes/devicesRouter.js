const Device = require("../models/device");
const express = require('express');
const router = new express.Router();
const crypto = require('crypto');

router.post('/devices', async (req, res) => {
    try{
        const name = req.body.name;
        const location =req.body.location
        const apiKey = crypto.randomBytes(32).toString('hex');
        

        if (!name || !location){
            return res.status(400).json({ success: false, error: "Champs requis manquants: name, location, apiKey" });
        }
        
        const device = new Device({name, location, apiKey});
        await device.save();
        return res.status(201).json({success: true, data: device});

    }catch(error){
        return res.status(400).json({ success: false, error: error.message });
    }
})

router.get('/devices', async (req, res) => {
    try{
        const devices = await Device.find({});
        return res.status(200).json({success:true, data:devices})
    }catch(error){
        return res.status(500).json({ success: false, error: error.message });
    }

})

module.exports = router;