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
  clearAvailabilityByDate,
  clearAllAvailability,
  addClientNote,
  getClientNotes,
  searchClientNotes,
  pinClientNote,
  addNoteTemplate,
  getNoteTemplates,
  deleteNoteTemplate,
  getClientProgress,
  pinClientProgress,
  searchClientProgress,
  getClientAppointments,
  getTherapistClientsByAppointments,
  getTherapistAnalytics,
} from '../controllers/doctorController.js';
import {
  getTherapistClients,
  getClientDetails,
  manageClientNote,
  manageNoteTemplate,
  manageClientGoal,
  addClientProgress
} from '../controllers/clientManagementController.js';
import {
  syncGoogleCalendar,
  connectGoogleCalendar,
  handleGoogleCalendarCallback
} from '../controllers/googleCalendarController.js';

import { authTherapist } from '../middleware/authTherapist.js';
import therapistAvailabilityModel from '../models/therapistAvailabilityModel.js';
import appointmentsModel from '../models/appointmentsModel.js';
import NoteTemplate from '../models/noteTemplateModel.js';

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
    const today = new Date().toISOString().split('T')[0];
    const data = await therapistAvailabilityModel.find({
      therapistId,
      date: { $gte: today }
    });

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
    console.error('Error fetching availability:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public therapist listing
therapistRouter.get("/list", therapistList);

// --- Client Notes ---
therapistRouter.post('/client-notes', authTherapist, manageClientNote);
therapistRouter.get('/client-notes', authTherapist, getClientNotes);
therapistRouter.get('/client-notes/search', authTherapist, searchClientNotes);
therapistRouter.patch('/client-notes/:noteId/pin', authTherapist, pinClientNote);
// --- Note Templates ---
therapistRouter.post('/note-templates', authTherapist, manageNoteTemplate);
therapistRouter.get('/note-templates', authTherapist, async (req, res) => {
  try {
    const therapistId = req.body.userId;
    const templates = await NoteTemplate.find({
      createdBy: therapistId,
      status: 'active'
    });
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
therapistRouter.put('/note-templates/:templateId', authTherapist, async (req, res) => {
  try {
    const { templateId } = req.params;
    const therapistId = req.body.userId;
    const updateData = req.body;

    const template = await NoteTemplate.findOneAndUpdate(
      {
        _id: templateId,
        createdBy: therapistId
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
therapistRouter.delete('/note-templates/:templateId', authTherapist, async (req, res) => {
  try {
    const { templateId } = req.params;
    const therapistId = req.body.userId;

    const template = await NoteTemplate.findOneAndDelete({
      _id: templateId,
      createdBy: therapistId
    });

    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    res.json({ success: true, message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
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
    console.error('Error fetching client appointments:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Client Management Routes
therapistRouter.get('/client/:clientId', authTherapist, getClientDetails);
therapistRouter.post('/client/note', authTherapist, manageClientNote);
therapistRouter.post('/template', authTherapist, manageNoteTemplate);
therapistRouter.post('/client/goal', authTherapist, manageClientGoal);
therapistRouter.post('/client/progress', authTherapist, addClientProgress);

// Add new availability management routes
therapistRouter.delete('/availability/date/:date', authTherapist, clearAvailabilityByDate);
therapistRouter.delete('/availability/all', authTherapist, clearAllAvailability);

// Analytics
therapistRouter.post('/analytics', authTherapist, getTherapistAnalytics);

// Google Calendar Integration Routes
therapistRouter.post('/sync-google-calendar', authTherapist, syncGoogleCalendar);
therapistRouter.get('/connect-google-calendar', authTherapist, connectGoogleCalendar);
therapistRouter.get('/google-calendar-callback', authTherapist, handleGoogleCalendarCallback);

export default therapistRouter;
