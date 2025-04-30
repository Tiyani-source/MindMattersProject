
import express from 'express';
import {

  getTherapistDashboard,
  appointmentsTherapist,
  therapistCancelAppointment,
  updateMeetingLink,
  changeAvailablity,
  getMyAvailability,
  getAvailability,
  therapistList
} from '../controllers/doctorController.js';

import { authTherapist } from '../middleware/authTherapist.js';
import therapistAvailabilityModel from '../models/therapistAvailabilityModel.js';

const therapistRouter = express.Router();

//  Profile
therapistRouter.get("/dashboard", authTherapist, getTherapistDashboard);

// Appointment Management
therapistRouter.get("/appointments", authTherapist, appointmentsTherapist);
therapistRouter.post("/cancel-appointment", authTherapist, therapistCancelAppointment);
therapistRouter.post("/update-meeting-link", authTherapist, updateMeetingLink);

// Availability
therapistRouter.post("/change-availability", authTherapist, changeAvailablity);
therapistRouter.post("/availability", authTherapist, getMyAvailability);
therapistRouter.post("/get-availability", getMyAvailability);
therapistRouter.get("/availability/:therapistId", async (req, res) => {
  try {
    const { therapistId } = req.params;
    console.log('Fetching availability for therapist:', therapistId);

    const today = new Date().toISOString().split('T')[0];
    const data = await therapistAvailabilityModel.find({
      therapistId,
      date: { $gte: today }
    });

    console.log('Found availability slots:', data.length);

    const formatted = {};
    for (const slot of data) {
      if (!formatted[slot.date]) formatted[slot.date] = {};
      if (!formatted[slot.date][slot.time]) formatted[slot.date][slot.time] = [];
      formatted[slot.date][slot.time].push({
        type: slot.type,
        isBooked: slot.isBooked
      });
    }

    res.json({ success: true, availability: formatted });
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public therapist listing
therapistRouter.get("/list", therapistList);

export default therapistRouter;
