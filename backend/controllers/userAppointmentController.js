// userAppointmentController.js

import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";
import appointmentsModel from "../models/appointmentsModel.js";
import therapistAvailabilityModel from "../models/therapistAvailabilityModel.js";
import clientModel from "../models/clientModel.js";

// Get Student/Patient Appointments
export const getUserAppointments = async (req, res) => {
    try {
        const { token } = req.headers;
        if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const appointments = await appointmentsModel
            .find({ clientID: userId, statusOfAppointment: { $ne: "cancelled" } })
            .populate("therapistID", "name profilePicture speciality address");

        res.status(200).json({ success: true, appointments });
    } catch (err) {
        console.error("Error fetching appointments:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Therapist's Appointments
export const getTherapistAppointments = async (req, res) => {
    try {
        const { therapistId } = req.params;

        // Find all non-cancelled appointments for this therapist
        const appointments = await appointmentsModel.find({
            therapistID: therapistId,
            statusOfAppointment: { $ne: "cancelled" }
        });

        res.status(200).json({
            success: true,
            appointments: appointments.map(apt => ({
                date: apt.date,
                timeSlot: apt.timeSlot,
                statusOfAppointment: apt.statusOfAppointment
            }))
        });
    } catch (err) {
        console.error("Error fetching therapist appointments:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Book Therapist Appointment
export const bookAppointment = async (req, res) => {
    try {
        console.log('Received booking request:', req.body);

        const { therapistID, date, time, typeOfAppointment } = req.body;
        const clientID = req.studentId; // Get student ID from auth middleware

        // Validate required fields
        if (!therapistID || !date || !time || !typeOfAppointment) {
            console.log('Missing required fields:', { therapistID, date, time, typeOfAppointment });
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Find therapist and validate
        const therapist = await doctorModel.findById(therapistID);
        if (!therapist) {
            console.log('Therapist not found:', therapistID);
            return res.status(404).json({
                success: false,
                message: "Therapist not found"
            });
        }

        // Check if slot is already booked
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const slots = therapist.slots_booked || new Map();
        const dateSlots = slots.get(formattedDate) || new Map();

        if (dateSlots.get(time)) {
            return res.status(409).json({
                success: false,
                message: "This time slot is already booked"
            });
        }

        const amount = therapist.fees;

        // Calculate end time (1 hour from start time)
        const [hour, minute] = time.split(":").map(Number);
        const endHour = (hour + 1) % 24;
        const endTime = `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

        // Create appointment object
        const appointmentData = {
            clientID,
            therapistID,
            typeOfAppointment,
            meetingLink: " ", // Set empty by default - will be updated by therapist later
            date: new Date(date),
            timeSlot: {
                startTime: time,
                endTime
            },
            amount,
            statusOfAppointment: "upcoming"
        };

        console.log('Creating appointment with data:', appointmentData);

        // Save appointment
        const appointment = new appointmentsModel(appointmentData);
        await appointment.save();

        console.log('Appointment saved successfully:', appointment._id);

        // Update therapist's slots_booked
        if (!slots.has(formattedDate)) {
            slots.set(formattedDate, new Map());
        }
        slots.get(formattedDate).set(time, true);

        await doctorModel.findByIdAndUpdate(therapistID, {
            slots_booked: slots
        });

        // Create client-therapist relationship if doesn't exist
        const existingRelation = await clientModel.findOne({ therapistID, clientID });
        if (!existingRelation) {
            await clientModel.create({
                therapistID,
                clientID,
                clientStatus: "ongoing"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            appointment
        });

    } catch (err) {
        console.error("Booking error:", err);
        console.error("Error details:", {
            name: err.name,
            message: err.message,
            stack: err.stack
        });
        return res.status(500).json({
            success: false,
            message: "Error booking appointment",
            error: err.message
        });
    }
};

// Reschedule Appointment
export const rescheduleAppointment = async (req, res) => {
    try {
        const { appointmentId, newDate, newTime, typeOfAppointment } = req.body;
        console.log('Rescheduling appointment:', { appointmentId, newDate, newTime, typeOfAppointment });

        // Find the existing appointment
        const existingAppointment = await appointmentsModel.findById(appointmentId);
        if (!existingAppointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Find the therapist
        const therapist = await doctorModel.findById(existingAppointment.therapistID);
        if (!therapist) {
            return res.status(404).json({
                success: false,
                message: "Therapist not found"
            });
        }

        // Calculate end time for the new slot (1 hour from start)
        const [hour, minute] = newTime.split(":").map(Number);
        const endHour = (hour + 1) % 24;
        const endTime = `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

        // Format dates for slots_booked map
        const oldDate = new Date(existingAppointment.date).toISOString().split('T')[0];
        const oldTime = existingAppointment.timeSlot.startTime;
        const formattedNewDate = new Date(newDate).toISOString().split('T')[0];

        // Get the slots_booked map
        const slots = therapist.slots_booked || new Map();

        // Check if new slot is available
        const dateSlots = slots.get(formattedNewDate) || new Map();
        if (dateSlots.get(newTime)) {
            return res.status(409).json({
                success: false,
                message: "Selected time slot is already booked"
            });
        }

        // Free up the old slot
        if (slots.has(oldDate)) {
            const oldDateSlots = slots.get(oldDate);
            if (oldDateSlots) {
                oldDateSlots.delete(oldTime);
                if (oldDateSlots.size === 0) {
                    slots.delete(oldDate);
                } else {
                    slots.set(oldDate, oldDateSlots);
                }
            }
        }

        // Book the new slot
        if (!slots.has(formattedNewDate)) {
            slots.set(formattedNewDate, new Map());
        }
        slots.get(formattedNewDate).set(newTime, true);

        // Update therapist's slots_booked
        await doctorModel.findByIdAndUpdate(
            existingAppointment.therapistID,
            { slots_booked: slots },
            { new: true }
        );

        // Update the appointment
        const updatedAppointment = await appointmentsModel.findByIdAndUpdate(
            appointmentId,
            {
                date: new Date(newDate),
                timeSlot: {
                    startTime: newTime,
                    endTime
                },
                typeOfAppointment,
                modifyRequest: false,
                modifyRequestMsg: ""
            },
            { new: true }
        );

        console.log('Appointment rescheduled successfully:', updatedAppointment);
        res.json({
            success: true,
            message: "Appointment rescheduled successfully",
            appointment: updatedAppointment
        });

    } catch (err) {
        console.error("Rescheduling error:", err);
        console.error("Error details:", {
            name: err.name,
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({
            success: false,
            message: "Error rescheduling appointment",
            error: err.message
        });
    }
};

// Cancel Appointment
export const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const cancelledAppointment = await appointmentsModel.findByIdAndUpdate(
            appointmentId,
            { statusOfAppointment: "cancelled", cancelledBy: "client" }
        );

        if (!cancelledAppointment) return res.json({ success: false, message: "Appointment not found" });

        res.json({ success: true, message: "Appointment cancelled" });
    } catch (err) {
        console.error("Cancellation error:", err);
        res.json({ success: false, message: err.message });
    }
};

// Get Meeting Link
export const getMeetingLink = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await appointmentsModel.findById(appointmentId).populate("therapistID", "name");

        if (!appointment || appointment.statusOfAppointment === "cancelled") {
            return res.json({ success: false, message: "Invalid or cancelled appointment" });
        }

        res.json({ success: true, meetingLink: appointment.meetingLink });
    } catch (err) {
        console.error("Meeting link fetch error:", err);
        res.json({ success: false, message: err.message });
    }
};