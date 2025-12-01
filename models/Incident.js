const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    location: {
        lat: Number,
        lng: Number
    },
    message: String,

    // Added for your controller
    distance: Number,
    direction: String,

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'broadcasted', 'resolved'],
        default: 'pending'
    },

    rescuerId: { type: String }  // from acceptIncident

}, { timestamps: true });

module.exports = mongoose.model("Incident", IncidentSchema);
