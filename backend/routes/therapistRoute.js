import express from 'express';
import {
  loginTherapist,
  getTherapistDashboard,
  appointmentsTherapist,
  therapistCancelAppointment,
  updateMeetingLink,
  changeAvailablity,
  getMyAvailability,
  getAvailability,
  therapistList
} from '../controllers/therapistController.js';

import authTherapist from '../middleware/authTherapist.js';

const therapistRouter = express.Router();

// Auth & Profile
therapistRouter.post("/login", loginTherapist);
therapistRouter.get("/dashboard", authTherapist, getTherapistDashboard);

// Appointment Management
therapistRouter.get("/appointments", authTherapist, appointmentsTherapist); // ✅ GET instead of POST for fetching appointments
therapistRouter.post("/cancel-appointment", authTherapist, therapistCancelAppointment);
therapistRouter.post("/update-meeting-link", authTherapist, updateMeetingLink); // ✅ Match route with frontend usage

// Availability
therapistRouter.post("/change-availability", authTherapist, changeAvailablity);
therapistRouter.post("/availability", authTherapist, getMyAvailability);
therapistRouter.post("/get-availability",  getMyAvailability);
therapistRouter.get("/availability/:therapistId", getAvailability);

// Public therapist listing
therapistRouter.get("/list", therapistList);

export default therapistRouter;
