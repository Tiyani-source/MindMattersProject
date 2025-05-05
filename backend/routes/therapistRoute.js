import express from 'express';
import {
  getTherapistDashboard,
  appointmentsTherapist,
  therapistCancelAppointment,
  updateMeetingLink,
  changeAvailablity,
  getMyAvailability,
  getAvailability,
  therapistList,
  saveRecurringAvailability,
  getRecurringSchedules,
  deleteRecurringSchedule,
  updateRecurringSchedule,
  addClientNote,
  getClientNotes,
  searchClientNotes,
  pinClientNote,
  addNoteTemplate,
  getNoteTemplates,
  deleteNoteTemplate,
  addClientProgress,
  getClientProgress,
  pinClientProgress,
  searchClientProgress,
  getTherapistClients,
  getClientAppointments,
  getTherapistClientsByAppointments
} from '../controllers/doctorController.js';

import { authTherapist } from '../middleware/authTherapist.js';
import therapistAvailabilityModel from '../models/therapistAvailabilityModel.js';
import appointmentsModel from '../models/appointmentsModel.js';

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
therapistRouter.post("/recurring-availability", authTherapist, saveRecurringAvailability);
therapistRouter.get("/recurring-schedules", authTherapist, getRecurringSchedules);
therapistRouter.delete("/recurring-schedules/:scheduleId", authTherapist, deleteRecurringSchedule);
therapistRouter.put("/recurring-schedules/:scheduleId", authTherapist, updateRecurringSchedule);
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

// --- Client Notes ---
therapistRouter.post('/client-notes', authTherapist, addClientNote);
therapistRouter.get('/client-notes', authTherapist, getClientNotes);
therapistRouter.get('/client-notes/search', authTherapist, searchClientNotes);
therapistRouter.patch('/client-notes/:noteId/pin', authTherapist, pinClientNote);
// --- Note Templates ---
therapistRouter.post('/note-templates', authTherapist, addNoteTemplate);
therapistRouter.get('/note-templates', authTherapist, getNoteTemplates);
therapistRouter.delete('/note-templates/:templateId', authTherapist, deleteNoteTemplate);
therapistRouter.post('/client-progress', authTherapist, addClientProgress);
therapistRouter.get('/client-progress', authTherapist, getClientProgress);
therapistRouter.patch('/client-progress/:noteId/pin', authTherapist, pinClientProgress);
therapistRouter.get('/client-progress/search', authTherapist, searchClientProgress);

// --- Client List ---
therapistRouter.get('/clients', authTherapist, getTherapistClients);
therapistRouter.get('/clients-by-appointments', authTherapist, getTherapistClientsByAppointments);

// --- Client Appointments ---
therapistRouter.get('/appointments', authTherapist, async (req, res) => {
  try {
    const therapistId = req.body.userId;
    const clientId = req.query.clientID;

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'Client ID is required' });
    }

    const appointments = await appointmentsModel.find({
      therapistID: therapistId,
      clientID: clientId
    }).sort({ date: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    console.error('Error fetching client appointments:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default therapistRouter;
