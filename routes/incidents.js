const express = require("express");
const router = express.Router();
const controller = require("../controllers/incidentsController.js");

console.log("Loaded controller functions:", controller);

// Basic test route
router.get("/", (req, res) => {
  res.send("Incidents API running");
});

// 1️⃣ USER triggers SOS
router.post("/create", controller.createIncident);

// 2️⃣ RESCUER fetches pending SOS
router.get("/pending", controller.getPendingIncidents);

// 3️⃣ RESCUER accepts an SOS
router.post("/accept", controller.acceptIncident);

// 4️⃣ RESCUER resolves an SOS
router.post("/resolve", controller.resolveIncident);

// 5️⃣ Admin-style accept/reject by incident ID
router.patch("/:id/accept", controller.acceptIncidentById);
router.patch("/:id/reject", controller.rejectIncidentById);

// 6️⃣ Get all incidents
router.get("/all", controller.getAllIncidents);

// 7️⃣ Get incidents by user
router.get("/user/:userId", controller.getIncidentsByUser);

module.exports = router;
