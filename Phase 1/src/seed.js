require("dotenv").config({ path: '../.env' });
const mongoose = require("./services/mongoose");
const Device = require("./models/Device");
const Measurement = require("./models/Measurement");
const Observation = require("./models/Observation");

async function seedData() {
    try {
        await mongoose.connectDB();

        // Clear existing state records
        await Device.deleteMany({});
        await Measurement.deleteMany({});
        await Observation.deleteMany({});
        console.log("Database cleared successfully.");

        // Inject Demo Device
        const testDevice = new Device({ name: "Phone_A_Automation", location: "Hotel_Lobby" });
        await testDevice.save();
        console.log("Mock Device Seeded! KEY IS:", testDevice.apiKey);

        const baselineTime = Date.now();
        const batchMeasurements = [];

        // Generate 3 hours of dummy audio measurements tracking downward
        for (let i = 0; i < 60; i++) {
            batchMeasurements.push({
                location: "Hotel_Lobby",
                type: "soundPressureLevel",
                value: -55 + Math.sin(i / 5) * 8, // Simulate noise fluctuations
                timestamp: new Date(baselineTime - i * 3 * 60 * 1000)
            });
        }

        await Measurement.insertMany(batchMeasurements);

        // Inject Qualitative contextual environment states
        await Observation.create([
            { location: "Hotel_Lobby", proximity: "moderate", vibe: "Studieuse", notes: "Collecte automatique Session 1", timestamp: new Date(baselineTime - 120 * 60 * 1000) },
            { location: "Hotel_Lobby", proximity: "distant", vibe: "Calme", notes: "Collecte manuelle Session 2 Fallback", timestamp: new Date() }
        ]);

        console.log("Mock Measurements and Observations seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding operation failed:", error);
        process.exit(1);
    }
}

seedData();