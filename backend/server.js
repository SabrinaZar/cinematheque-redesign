const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
const filmRoutes = require("./routes/filmRoutes");
const adminRoutes = require("./routes/adminRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const partageRoutes = require("./routes/partageRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to MongoDB
connectDB();


 // Authentification
 app.use("/auth", authRoutes);

 // Administration
 app.use("/admin", adminRoutes);

 // Partage des collections
 app.use("/partage", partageRoutes);

 // Gestion des films
 app.use("/films", filmRoutes);
;

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Ma cinémathèque API is running"
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route introuvable"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});