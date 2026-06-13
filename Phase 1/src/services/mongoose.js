const mongoose = require("mongoose");

async function connectDB() {
    // Explicitly define the database name to prevent Mongoose from defaulting
    const options = {
        dbName: "phase1_db" 
    };
    
    await mongoose.connect(process.env.MONGO_URL, options);
    console.log("Database successfully connected to:", mongoose.connection.db.databaseName);
}

module.exports = { connectDB };