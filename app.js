require("dotenv").config();
console.log("Loaded MONGO_URI =", process.env.MONGO_URI);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const incidentRoutes = require("./routes/incidents");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/incidents", incidentRoutes);

// MONGO CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Start Server
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("❌ MongoDB Error:", err));
