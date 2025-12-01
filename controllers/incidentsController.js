const { 
  getDistance, 
  getBearing, 
  bearingToDirection 
} = require("../utils/geoUtils");

const Incident = require("../models/Incident");
const publisher = require("../services/incidentPublisher");

// Set rescue HQ or rescuer location (static for now)
const RESCUE_CENTER = {
  lat: 12.9716,   // Bengaluru dummy coords
  lng: 77.5946
};

// 1️⃣ USER sends SOS
exports.createIncident = async (req, res) => {
  try {
    console.log("📥 Incoming POST /create body:", req.body);

    const { userId, type, location, message } = req.body || {};

    // Validation
    if (
      !userId ||
      !location ||
      typeof location.lat !== "number" ||
      typeof location.lng !== "number"
    ) {
      return res.status(400).json({
        error: "userId and location {lat, lng} are required",
      });
    }

    // Calculate distance
    const distanceKm = getDistance(
      location.lat,
      location.lng,
      RESCUE_CENTER.lat,
      RESCUE_CENTER.lng
    );

    // Reject if too far
    if (distanceKm > 50) {
      return res.status(200).json({
        status: "rejected",
        reason: "User is outside the 50 km rescue radius",
        distance_km: distanceKm.toFixed(2),
      });
    }

    // Direction
    const bearing = getBearing(
      location.lat,
      location.lng,
      RESCUE_CENTER.lat,
      RESCUE_CENTER.lng
    );
    const direction = bearingToDirection(bearing);

    // Create incident
    const newIncident = await Incident.create({
      userId,
      type,
      message,
      location,
      distance: distanceKm,
      direction,
      status: "pending",
    });

    // Send encrypted broadcast to Person C
    publisher.broadcastIncident(newIncident);

    res.status(201).json({
      message: "SOS created & broadcasted",
      distance_km: distanceKm.toFixed(2),
      direction,
      incident: newIncident,
    });
  } catch (error) {
    console.log("❌ Error creating incident:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 2️⃣ RESCUER fetches all pending SOS
exports.getPendingIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ status: "pending" });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
};

// 3️⃣ RESCUER accepts an SOS
exports.acceptIncident = async (req, res) => {
  try {
    const { incidentId, rescuerId } = req.body;

    const updated = await Incident.findByIdAndUpdate(
      incidentId,
      { status: "broadcasted", rescuerId },
      { new: true }
    );

    res.json({
      message: "Incident accepted",
      incident: updated,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to accept incident" });
  }
};

// **New: accept/reject functions for admin-style actions**
exports.acceptIncidentById = async (req, res) => {
  try {
    const { id } = req.params;

    const incident = await Incident.findByIdAndUpdate(
      id,
      { status: 'accepted' },
      { new: true }
    );

    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    res.json({ message: 'Incident accepted', incident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rejectIncidentById = async (req, res) => {
  try {
    const { id } = req.params;

    const incident = await Incident.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );

    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    res.json({ message: 'Incident rejected', incident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4️⃣ RESCUER resolves SOS
exports.resolveIncident = async (req, res) => {
  try {
    const { incidentId } = req.body;

    const updated = await Incident.findByIdAndUpdate(
      incidentId,
      { status: "resolved" },
      { new: true }
    );

    res.json({
      message: "Incident resolved",
      incident: updated,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve incident" });
  }
};

// 5️⃣ List all incidents
exports.getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.status(200).json({ incidents });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
};

// 6️⃣ Get incidents by user
exports.getIncidentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await Incident.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ incidents: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incidents for user" });
  }
};
