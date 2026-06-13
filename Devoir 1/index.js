require("dotenv").config();
const express = require("express");
const { connectDB } = require("./src/services/mongoose");

const deviceRoutes = require("./src/routes/deviceRoutes");
const measurementRoutes = require("./src/routes/measurementRoutes");
const ambianceRoutes = require("./src/routes/ambianceRoutes");

const app = express();
const port = process.env.PORT || 8383;

// Connect to MongoDB Atlas cluster
connectDB().catch(err => console.error("Database connection failure:", err));

// Global Middlewares
app.use(express.json()); // Essential for mapping raw request bodies to req.body

// Route Mounted Trees
app.use(deviceRoutes);
app.use(measurementRoutes);
app.use(ambianceRoutes);

// Fallback Middleware: 404 Noun Error
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        error: "Route introuvable"
    });
});

// Fallback Middleware: 500 Central Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    return res.status(500).json({
        success: false,
        error: "Erreur interne du serveur",
        details: err.message
    });
});

app.listen(port, () => {
    console.log(`Server listening at: http://localhost:${port}`);
});