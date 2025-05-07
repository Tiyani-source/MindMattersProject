import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import appointmentsModel from "../models/appointmentsModel.js";
import clientModel from "../models/clientModel.js";
import therapistAvailabilityModel from "../models/therapistAvailabilityModel.js";
import RecurringScheduleModel from "../models/recurringScheduleModel.js";
import mongoose from "mongoose";
import ClientNote from '../models/clientNoteModel.js';
import NoteTemplate from '../models/noteTemplateModel.js';
import ClientProgress from '../models/clientProgressModel.js';
import studentModel from "../models/studentModel.js";

// Add a progress note
export const addClientProgress = async (req, res) => {
    try {
        const { therapistID, clientID, appointmentID, progressNote, tags } = req.body;
        const note = await ClientProgress.create({ therapistID, clientID, appointmentID, progressNote, tags });
        res.status(201).json({ success: true, note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all progress notes for a client
export const getClientProgress = async (req, res) => {
    try {
        const { clientID, therapistID } = req.query;
        const notes = await ClientProgress.find({ clientID, therapistID }).sort({ createdAt: -1 });
        res.json({ success: true, notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Pin/unpin a progress note
export const pinClientProgress = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { pinned } = req.body;
        const note = await ClientProgress.findByIdAndUpdate(noteId, { pinned }, { new: true });
        res.json({ success: true, note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Search progress notes
export const searchClientProgress = async (req, res) => {
    try {
        const { query, clientID } = req.query;
        const notes = await ClientProgress.find({
            clientID,
            progressNote: { $regex: query, $options: 'i' }
        }).sort({ createdAt: -1 });
        res.json({ success: true, notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// API for therapist dashboard details
export const getTherapistDashboard = async (req, res) => {
    try {
        const docId = req.body.userId; // From authDoctor middleware
        if (!docId) {
            return res.status(400).json({ success: false, message: "Invalid therapist ID" });
        }

        // Fetch therapist details
        const therapist = await doctorModel.findById(docId);
        if (!therapist) {
            return res.status(404).json({ success: false, message: "Therapist not found" });
        }

        // Fetch appointments for this therapist
        const appointments = await appointmentsModel.find({ therapistID: docId }).populate('clientID', 'firstName lastName email');

        // Fetch ongoing clients - Add null check for clientID
        const ongoingClients = await clientModel
            .find({ therapistID: docId, clientStatus: "ongoing" })
            .populate("clientID", "firstName lastName email") // Get client name
            .lean();

        // Format the ongoing clients with null checks
        const formattedOngoingClients = ongoingClients.map(client => ({
            id: client._id,
            clientId: client.clientID?._id || 'Unknown',
            client: client.clientID ? `${client.clientID.firstName} ${client.clientID.lastName}` : "Unknown",
            status: client.clientStatus,
            date: client.updatedAt ? new Date(client.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : 'N/A'
        }));

        // Compute statistics with null checks
        const totalAppointments = appointments.length;
        const activeAppointments = appointments.filter(app => app.statusOfAppointment === "upcoming").length;

        // Calculate the average rating with null checks
        const completedRatings = appointments.filter(app => app.statusOfAppointment === "completed" && app.rating !== null);
        const totalRatings = completedRatings.reduce((sum, app) => sum + (app.rating || 0), 0);
        const avgRating = completedRatings.length ? (totalRatings / completedRatings.length).toFixed(1) : "N/A";

        // Calculate total earnings with null checks
        const currentDate = new Date();
        const currentYear = currentDate.getUTCFullYear();
        const currentMonth = currentDate.getUTCMonth();

        const totalEarnings = appointments
            .filter(app => {
                if (app.statusOfAppointment !== "completed") return false;
                if (!app.date) return false;

                const appDate = new Date(app.date);
                return appDate.getUTCFullYear() === currentYear && appDate.getUTCMonth() === currentMonth;
            })
            .reduce((sum, app) => sum + (app.amount || 0), 0);

        const formattedEarnings = `LKR ${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Include in response
        const dashData = {
            therapistDetails: {
                name: therapist.name || 'Unknown',
                speciality: therapist.speciality || 'Not specified',
                experience: therapist.experience || '0',
                fees: therapist.fees || 0,
                available: therapist.available || false,
            },
            ongoingClients: formattedOngoingClients,
            stats: {
                totalAppointments,
                activeAppointments,
                formattedEarnings,
                avgRating,
            }
        };

        // Format appointments with null checks
        const formattedAppointments = appointments
            .filter(app => app.statusOfAppointment !== "cancelled" && app.timeSlot && app.clientID && app.clientID.firstName)
            .map((appointment) => {
                try {
                    const formattedDate = appointment.date ? new Date(appointment.date).toISOString().split("T")[0] : null;
                    if (!formattedDate || !appointment.timeSlot?.startTime || !appointment.timeSlot?.endTime) {
                        console.warn("Invalid appointment data:", appointment._id);
                        return null;
                    }

                    const startDateTime = new Date(formattedDate);

                    // Parse time safely
                    const parseTime = (timeStr) => {
                        if (!timeStr) return null;
                        let hour = 0, minute = 0;

                        if (timeStr.includes("AM") || timeStr.includes("PM")) {
                            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                            if (!match) return null;

                            let [_, h, m, meridian] = match;
                            hour = parseInt(h);
                            minute = parseInt(m);
                            meridian = meridian.toUpperCase();
                            if (meridian === "PM" && hour !== 12) hour += 12;
                            if (meridian === "AM" && hour === 12) hour = 0;
                        } else {
                            const [h, m] = timeStr.split(":");
                            if (!h || !m) return null;
                            hour = parseInt(h);
                            minute = parseInt(m);
                        }
                        return { hour, minute };
                    };

                    const startParsed = parseTime(appointment.timeSlot.startTime);
                    if (!startParsed) return null;
                    startDateTime.setHours(startParsed.hour, startParsed.minute, 0, 0);

                    const endDateTime = new Date(startDateTime);
                    const endParsed = parseTime(appointment.timeSlot.endTime);
                    if (!endParsed) return null;
                    endDateTime.setHours(endParsed.hour, endParsed.minute, 0, 0);

                    return {
                        Id: appointment._id?.toString() || 'Unknown',
                        Subject: `Session with ${appointment.clientID ? `${appointment.clientID.firstName} ${appointment.clientID.lastName}` : 'Unknown Client'}`,
                        StartTime: startDateTime,
                        EndTime: endDateTime,
                        Location: appointment.typeOfAppointment === 'online' ? (appointment.meetingLink || 'Online') : 'Therapist Office',
                        Description: appointment.review || 'No review available',
                        Status: appointment.statusOfAppointment || 'unknown',
                        Amount: appointment.amount || 0,
                    };
                } catch (error) {
                    console.error("Error formatting appointment:", error);
                    return null;
                }
            })
            .filter(Boolean); // Remove null entries

        // Assign formatted appointments to dashData
        dashData.formattedAppointments = formattedAppointments;

        // Initialize earnings data with null checks
        const pastYearEarnings = {};
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
            pastYearEarnings[key] = { total: 0, online: 0, inPerson: 0 };
        }

        // Process earnings data with null checks
        appointments.forEach((app) => {
            if (app.statusOfAppointment === "completed" && app.date) {
                const date = new Date(app.date);
                const key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

                if (pastYearEarnings[key]) {
                    const amount = app.amount || 0;
                    pastYearEarnings[key].total += amount;
                    if (app.typeOfAppointment === "online") {
                        pastYearEarnings[key].online += amount;
                    } else {
                        pastYearEarnings[key].inPerson += amount;
                    }
                }
            }
        });

        // Convert earnings data to array
        dashData.earningsData = Object.keys(pastYearEarnings)
            .sort((a, b) => new Date(`1 ${a}`) - new Date(`1 ${b}`))
            .map((month) => ({
                month,
                total: pastYearEarnings[month].total,
                online: pastYearEarnings[month].online,
                inPerson: pastYearEarnings[month].inPerson,
            }));

        // Calculate booking trends with null checks
        const startDate = new Date(currentYear - 1, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 1);

        const filteredAppointments = appointments.filter(app => {
            if (!app.date) return false;
            const appDate = new Date(app.date);
            return appDate >= startDate && appDate < endDate;
        });

        // Create booking trends data
        const monthNames = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentYear, currentMonth - i, 1);
            monthNames.unshift(`${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`);
        }

        const bookingsByMonth = monthNames.reduce((acc, month) => {
            acc[month] = { total: 0, online: 0, inPerson: 0 };
            return acc;
        }, {});

        filteredAppointments.forEach((app) => {
            if (!app.date) return;
            const date = new Date(app.date);
            const key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

            if (bookingsByMonth[key]) {
                bookingsByMonth[key].total += 1;
                if (app.typeOfAppointment === "online") {
                    bookingsByMonth[key].online += 1;
                } else {
                    bookingsByMonth[key].inPerson += 1;
                }
            }
        });

        dashData.bookingTrendsData = monthNames.map(month => ({
            month,
            total: bookingsByMonth[month].total,
            online: bookingsByMonth[month].online,
            inPerson: bookingsByMonth[month].inPerson,
        }));

        // Calculate new clients data: first appointment per unique client
        const firstAppointments = {};
        appointments.forEach(app => {
            if (!app.clientID || !app.date) return;
            // Use _id if populated, else use as is
            const clientId = app.clientID._id ? app.clientID._id.toString() : app.clientID.toString();
            if (!firstAppointments[clientId] || new Date(app.date) < new Date(firstAppointments[clientId])) {
                firstAppointments[clientId] = app.date;
            }
        });

        // Count new clients per month
        const newClientsByMonth = monthNames.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});

        Object.values(firstAppointments).forEach(dateStr => {
            const date = new Date(dateStr);
            const key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
            if (newClientsByMonth[key] !== undefined) {
                newClientsByMonth[key] += 1;
            }
        });

        dashData.newClientsData = monthNames.map(month => ({
            month,
            newClients: newClientsByMonth[month],
        }));

        // Calculate cancellation breakdown with null checks
        const clientCancellations = appointments.filter(app =>
            app.statusOfAppointment === "cancelled" && app.cancelledBy === "client"
        ).length;

        const therapistCancellations = appointments.filter(app =>
            app.statusOfAppointment === "cancelled" && app.cancelledBy === "therapist"
        ).length;

        dashData.cancellationBreakdown = [
            { name: "Client Cancellations", value: clientCancellations },
            { name: "Therapist Cancellations", value: therapistCancellations }
        ];

        console.log("All appointments for therapist:", appointments.map(a => ({
            clientID: a.clientID,
            date: a.date
        })));

        console.log("newClientsData to frontend:", dashData.newClientsData);

        // Group by month
        const monthlyCounts = {};
        appointments.forEach(app => {
            const key = `${app.date.getFullYear()}-${app.date.getMonth() + 1}`;
            monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
        });
        const months = Object.keys(monthlyCounts).sort();
        const lastN = months.slice(-3); // last 3 months
        const avg = lastN.reduce((sum, m) => sum + monthlyCounts[m], 0) / lastN.length;
        const predictedNextMonthAppointments = Math.round(avg);

        const clientBookings = {};
        appointments.forEach(app => {
            const id = app.clientID.toString();
            if (!clientBookings[id]) clientBookings[id] = [];
            clientBookings[id].push(app);
        });
        let rebookAfterCancel = 0, totalCancelled = 0;
        Object.values(clientBookings).forEach(apps => {
            const cancelled = apps.some(a => a.statusOfAppointment === 'cancelled');
            const rebooked = apps.some(a => a.statusOfAppointment !== 'cancelled');
            if (cancelled) totalCancelled++;
            if (cancelled && rebooked) rebookAfterCancel++;
        });
        const rebookAfterCancelRate = totalCancelled ? (rebookAfterCancel / totalCancelled) : 0;

        const total = appointments.length;
        const cancelled = appointments.filter(a => a.statusOfAppointment === 'cancelled').length;
        const predictedCancellations = total ? (cancelled / total) : 0;

        let totalConsecutive = 0, newClientCount = 0;
        Object.values(clientBookings).forEach(apps => {
            if (apps.length < 2) return;
            apps.sort((a, b) => new Date(a.date) - new Date(b.date));
            let maxStreak = 1, streak = 1;
            for (let i = 1; i < apps.length; i++) {
                const diff = (new Date(apps[i].date) - new Date(apps[i - 1].date)) / (1000 * 60 * 60 * 24);
                if (diff <= 30) streak++;
                else streak = 1;
                if (streak > maxStreak) maxStreak = streak;
            }
            totalConsecutive += maxStreak;
            newClientCount++;
        });
        const avgConsecutiveSessionsForNewClients = newClientCount ? (totalConsecutive / newClientCount) : 0;

        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const lastMonthBookings = appointments.filter(app => {
            const appDate = new Date(app.date);
            return appDate >= lastMonth && appDate < thisMonth;
        }).length;

        return res.status(200).json({ success: true, dashData });

    } catch (error) {
        console.error("Dashboard error details:", {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

function convertTo24Hour(timeStr) {
    // Convert '08:30 PM' -> '20:30'
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "PM" && hours !== "12") {
        hours = String(Number(hours) + 12);
    }
    if (modifier === "AM" && hours === "12") {
        hours = "00";
    }
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
}

export const appointmentsTherapist = async (req, res) => {
    try {
        const docId = req.userId || req.body.userId; // Use both for compatibility
        console.log("appointmentsTherapist: docId from req.userId or req.body.userId:", docId);

        if (!docId) {
            console.error("appointmentsTherapist: therapist ID missing");
            return res.status(400).json({ success: false, message: "Invalid therapist ID" });
        }

        const currentDate = new Date();

        // Fetch appointments for this therapist and populate client details
        const appointments = await appointmentsModel.find({ therapistID: docId }).populate("clientID", "firstName lastName email");
        console.log("appointmentsTherapist: appointments found:", appointments.length);

        // Categorize appointments into current and past
        const formattedAppointments = appointments.map(app => ({
            id: app._id,
            client: app.clientID ? `${app.clientID.firstName} ${app.clientID.lastName}` : "Unknown",
            type: app.typeOfAppointment || "Online",
            date: new Date(app.date).toISOString().split("T")[0], // Keep date as YYYY-MM-DD
            time: app.timeSlot?.startTime || "00:00", // ✅ use actual start time from timeSlot
            endTime: app.timeSlot?.endTime || null,   // (optional) include end time if needed
            amount: `$${app.amount || 0}`,
            status: app.statusOfAppointment,
            meetingLink: app.meetingLink || "",
            rating: app.rating || null,
            review: app.review || ""
        }));
        const currentAppointments = formattedAppointments.filter(app => {
            const fullDateTime = new Date(`${app.date}T${convertTo24Hour(app.time)}`);
            return fullDateTime >= new Date() && app.status === "upcoming";
        });
        const pastAppointments = formattedAppointments.filter(app => {
            const fullDateTime = new Date(`${app.date} ${app.time}`);
            return (
                fullDateTime < currentDate || app.status === "completed"
            );
        });

        res.status(200).json({
            success: true,
            currentAppointments,
            pastAppointments,
            allAppointments: formattedAppointments
        });
    } catch (error) {
        console.error("Error fetching therapist appointments:", error);
        res.status(500).json({ success: false, message: "Server error while fetching appointments" });
    }
};

export const therapistCancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const docId = req.body.userId; // From authDoctor middleware

        const appointment = await appointmentsModel.findById(appointmentId);
        if (appointment && appointment.therapistID.equals(docId)) {
            await appointmentsModel.findByIdAndUpdate(appointmentId, {
                statusOfAppointment: "cancelled",
                cancelledBy: "therapist"
            });
            return res.json({ success: true, message: 'Appointment cancelled successfully' });
        }

        res.json({ success: false, message: 'Appointment not found or unauthorized' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

//update link
export const updateMeetingLink = async (req, res) => {
    try {
        const { appointmentId, newLink } = req.body;
        const docId = req.body.userId; // From authDoctor middleware

        const appointment = await appointmentsModel.findById(appointmentId);
        if (appointment && appointment.therapistID.equals(docId)) {
            await appointmentsModel.findByIdAndUpdate(appointmentId, {
                meetingLink: newLink,
                modifyRequest: false,
                modifyRequestMsg: ""
            });

            return res.json({ success: true, message: 'Meeting link updated successfully' });
        }

        return res.json({ success: false, message: 'Appointment not found or unauthorized' });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

// API to change therapist availablity for Therapist Panel
export const changeAvailablity = async (req, res) => {
    try {
        const { selectedSlots } = req.body;
        const docId = req.body.userId; // From authDoctor middleware

        const dates = Object.keys(selectedSlots);

        // Get all dates in the DB for this therapist
        const allDbDates = await therapistAvailabilityModel.find({ therapistId: docId }).distinct('date');

        // Find dates that are in the DB but not in the new selection
        const datesToDelete = allDbDates.filter(date => !dates.includes(date));

        // Delete all unbooked slots for those dates
        if (datesToDelete.length > 0) {
            await therapistAvailabilityModel.deleteMany({
                therapistId: docId,
                date: { $in: datesToDelete },
                isBooked: false
            });
        }

        for (const date of dates) {
            const slots = selectedSlots[date];

            // Remove slots not present in the new selection
            const existing = await therapistAvailabilityModel.find({ therapistId: docId, date });
            for (const slot of existing) {
                const typesInFrontend = Array.isArray(slots[slot.time])
                    ? slots[slot.time].map(s => s.type)
                    : [];

                if (!typesInFrontend.includes(slot.type)) {
                    if (!slot.isBooked) {
                        await therapistAvailabilityModel.deleteOne({ _id: slot._id });
                    }
                }
            }

            // Upsert new/remaining slots
            for (const time in slots) {
                const types = Array.isArray(slots[time])
                    ? slots[time].map(s => s.type)
                    : [];
                for (const type of types) {
                    await therapistAvailabilityModel.updateOne(
                        { therapistId: docId, date, time, type },
                        { therapistId: docId, date, time, type },
                        { upsert: true }
                    );
                }
            }
        }

        res.json({ success: true, message: 'Availability updated' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// therapistController.js (EXISTING)
export const getMyAvailability = async (req, res) => {
    try {
        const docId = req.body.userId; // From authDoctor middleware

        const today = new Date().toISOString().split('T')[0];

        const data = await therapistAvailabilityModel.find({
            therapistId: docId,
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
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAvailability = async (req, res) => {
    try {
        const docId = req.body.userId; // From authDoctor middleware

        const record = await therapistAvailabilityModel.findOne({ therapistID: docId });

        res.json({
            success: true,
            availability: record?.availableTimes || {}
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};


export const therapistList = async (req, res) => {
    try {
        console.log('Fetching therapist list from database...');
        const therapists = await doctorModel.find({}).select([
            'name',
            'speciality',
            'degree',
            'experience',
            'qualifications',
            'about',
            'doctorId',
            'available',
            'fees',
            'address',
            'gender',
            'phone',
            'profilePicture'
        ]);
        console.log('Database query result:', {
            count: therapists.length,
            firstTherapist: therapists[0] ? {
                id: therapists[0]._id,
                name: therapists[0].name,
                doctorId: therapists[0].doctorId
            } : null
        });

        res.json({ success: true, therapists })
    } catch (error) {
        console.error('Error in therapistList:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.json({ success: false, message: error.message })
    }
}


// API for doctor Login 
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await doctorModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {

        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {

        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            return res.json({ success: true, message: 'Appointment Cancelled' })
        }

        res.json({ success: false, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {

        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            return res.json({ success: true, message: 'Appointment Completed' })
        }

        res.json({ success: false, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get all doctors list for Frontend

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password');
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}



// API to get doctor profile for  Doctor Panel
const doctorProfile = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const doctor = await doctorModel.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        res.json({ success: true, doctor });
    } catch (err) {
        console.error("Error fetching doctor profile:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
// In doctorController.js

export const getTherapistClientsByAppointments = async (req, res) => {
    try {
        const therapistId = req.userId || req.body.userId;
        const therapistObjectId = typeof therapistId === 'string' ? new mongoose.Types.ObjectId(therapistId) : therapistId;
        const pipeline = [
            { $match: { therapistID: therapistObjectId } },
            { $sort: { date: -1 } },
            {
                $group: {
                    _id: "$clientID",
                    latestAppointment: { $first: "$date" },
                    totalSessions: { $sum: 1 }
                }
            },
            { $sort: { latestAppointment: -1 } }
        ];
        const clients = await appointmentsModel.aggregate(pipeline);

        // Populate client info
        const populated = await Promise.all(clients.map(async c => {
            let client;
            try {
                client = await mongoose.model("Student").findById(c._id).select("name email");
            } catch (err) {
                console.error("Error populating client:", c._id, err);
                client = null;
            }
            return {
                _id: c._id,
                name: client?.name || "Unknown",
                email: client?.email || "",
                latestAppointment: c.latestAppointment,
                totalSessions: c.totalSessions
            };
        }));

        res.json({ success: true, clients: populated });
    } catch (err) {
        console.error("Error in getTherapistClientsByAppointments:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// API to update doctor profile data from  Doctor Panel
const updateDoctorProfile = async (req, res) => {
    const { email, phone, address, speciality, degree, experience, qualifications, about, fees } = req.body;

    try {
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const updatedDoctor = await doctorModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    phone,
                    address,
                    speciality,
                    degree,
                    experience,
                    qualifications,
                    about,
                    fees,
                },
            },
            { new: true }
        );

        if (!updatedDoctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        return res.status(200).json({ success: true, message: "Profile updated", doctor: updatedDoctor });
    } catch (err) {
        console.error("Error updating doctor profile:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {

        const { docId } = req.body

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })



        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const deleteDoctor = async (req, res) => {
    try {
        const doctor = await doctorModel.findByIdAndDelete(req.params.id);
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

        res.json({ success: true, message: "Doctor deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
const getDoctorCount = async (req, res) => {
    try {
      const count = await doctorModel.countDocuments();
      res.json({ count });
    } catch (err) {
      console.error('Error getting student count:', err);
      res.status(500).json({ message: 'Failed to get student count' });
    }
}
export const getRecurringSchedules = async (req, res) => {
    try {
        const therapistId = req.body.userId;
        const schedules = await RecurringScheduleModel.find({
            therapistId,
            isActive: true
        }).sort({ createdAt: -1 });

        res.json({ success: true, schedules });
    } catch (error) {
        console.error('Error fetching recurring schedules:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteRecurringSchedule = async (req, res) => {
    try {
        const therapistId = req.body.userId;
        const { scheduleId } = req.params;

        // First, find the schedule to get its details
        const schedule = await RecurringScheduleModel.findOne({
            _id: scheduleId,
            therapistId
        });

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        // Mark the schedule as inactive instead of deleting
        await RecurringScheduleModel.findByIdAndUpdate(scheduleId, {
            isActive: false
        });

        // Delete the corresponding availability slots
        await therapistAvailabilityModel.deleteMany({
            therapistId,
            days: { $in: schedule.days },
            startTime: schedule.startTime,
            endTime: schedule.endTime
        });

        res.json({ success: true, message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting recurring schedule:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const saveRecurringAvailability = async (req, res) => {
    try {
        const { name, days, startTime, endTime, interval, types, startDate, endDate, breaks } = req.body;
        const therapistId = req.body.userId;

        // Validate required fields
        if (!days || !days.length || !startTime || !endTime || !interval || !types || !types.length) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                received: { days, startTime, endTime, interval, types }
            });
        }

        // Validate interval is one of the allowed values
        const allowedIntervals = [60, 120];
        if (!allowedIntervals.includes(interval)) {
            return res.status(400).json({
                success: false,
                message: 'Interval must be one of: 60, 120 minutes (see session rules)'
            });
        }

        // Check for overlapping schedules
        const overlappingSchedule = await RecurringScheduleModel.findOne({
            therapistId,
            days: { $in: days },
            isActive: true,
            $or: [
                {
                    startTime: { $lte: startTime },
                    endTime: { $gt: startTime }
                },
                {
                    startTime: { $lt: endTime },
                    endTime: { $gte: endTime }
                },
                {
                    startTime: { $gte: startTime },
                    endTime: { $lte: endTime }
                }
            ]
        });

        if (overlappingSchedule) {
            // Deactivate the overlapping schedule
            await RecurringScheduleModel.findByIdAndUpdate(overlappingSchedule._id, {
                isActive: false
            });

            // Delete its availability slots
            await therapistAvailabilityModel.deleteMany({
                therapistId,
                days: { $in: overlappingSchedule.days },
                startTime: overlappingSchedule.startTime,
                endTime: overlappingSchedule.endTime
            });
        }

        // Create new recurring schedule
        const newSchedule = await RecurringScheduleModel.create({
            therapistId,
            name: name || '',
            days,
            startTime,
            endTime,
            interval,
            types,
            breaks,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined
        });

        // Generate availability slots
        const slots = [];
        const currentDate = new Date(startDate);
        const endDateTime = endDate ? new Date(endDate) : new Date(currentDate.getTime() + (90 * 24 * 60 * 60 * 1000));

        while (currentDate <= endDateTime) {
            if (days.includes(currentDate.getDay())) {
                const dateStr = currentDate.toISOString().split('T')[0];
                const [startHour, startMinute] = startTime.split(':').map(Number);
                const [endHour, endMinute] = endTime.split(':').map(Number);
                const scheduleStart = startHour * 60 + startMinute;
                const scheduleEnd = endHour * 60 + endMinute;

                for (let time = scheduleStart; time < scheduleEnd; time += interval) {
                    const hour = Math.floor(time / 60);
                    const minute = time % 60;
                    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

                    const isBreakTime = (breaks || []).some(breakTime => {
                        const [breakStartHour, breakStartMinute] = breakTime.start.split(':').map(Number);
                        const [breakEndHour, breakEndMinute] = breakTime.end.split(':').map(Number);
                        const breakStart = breakStartHour * 60 + breakStartMinute;
                        const breakEnd = breakEndHour * 60 + breakEndMinute;
                        return time >= breakStart && time < breakEnd;
                    });

                    if (!isBreakTime) {
                        for (const type of types) {
                            slots.push({
                                therapistId,
                                date: dateStr,
                                time: timeStr,
                                type,
                                isBooked: false,
                                duration: 60,
                                recurringScheduleId: newSchedule._id
                            });
                        }
                    }
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Save availability slots in batches
        if (slots.length > 0) {
            await therapistAvailabilityModel.insertMany(slots);
        }

        res.json({
            success: true,
            message: 'Recurring availability saved successfully',
            schedule: newSchedule
        });

    } catch (error) {
        console.error('Error saving recurring availability:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateRecurringSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const therapistId = req.body.userId;
        const updateData = req.body;

        // Find and update schedule
        const schedule = await RecurringScheduleModel.findOne({
            _id: scheduleId,
            therapistId
        });

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        // Update schedule fields
        Object.assign(schedule, updateData);
        await schedule.save();

        // Delete old availability slots
        await therapistAvailabilityModel.deleteMany({
            recurringScheduleId: scheduleId,
            isBooked: false
        });

        // Generate new availability slots
        const slots = await schedule.generateAvailabilitySlots();

        // Save new slots
        if (slots.length > 0) {
            await therapistAvailabilityModel.insertMany(slots);
        }

        res.json({ success: true, message: 'Schedule updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    deleteDoctor,
    getDoctorCount
}

// --- Client Notes ---
export const addClientNote = async (req, res) => {
    try {
        const { therapistID, clientID, appointmentID, content, templateUsed } = req.body;
        const note = await ClientNote.create({ therapistID, clientID, appointmentID, content, templateUsed });
        res.status(201).json({ success: true, note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getClientNotes = async (req, res) => {
    try {
        const { clientID, therapistID } = req.query;
        const notes = await ClientNote.find({ clientID, therapistID }).sort({ createdAt: -1 });
        res.json({ success: true, notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const searchClientNotes = async (req, res) => {
    try {
        const { query, clientID } = req.query;
        const notes = await ClientNote.find({
            clientID,
            content: { $regex: query, $options: 'i' }
        }).sort({ createdAt: -1 });
        res.json({ success: true, notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const pinClientNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { pinned } = req.body;
        const note = await ClientNote.findByIdAndUpdate(noteId, { pinned }, { new: true });
        res.json({ success: true, note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Note Templates ---
export const addNoteTemplate = async (req, res) => {
    try {
        const therapistID = req.body.userId;
        if (!therapistID) {
            return res.status(401).json({ success: false, message: 'Unauthorized: therapistID missing' });
        }

        const { name, description, category, fields, isDefault = false } = req.body;

        if (!name || !category || !fields || !Array.isArray(fields) || fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, category, or fields'
            });
        }

        const template = await NoteTemplate.create({
            therapistID,
            name,
            description,
            category,
            fields,
            isDefault
        });

        res.status(201).json({ success: true, template });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getNoteTemplates = async (req, res) => {
    try {
        const therapistID = req.body.userId;
        if (!therapistID) {
            return res.status(401).json({ success: false, message: 'Unauthorized: therapistID missing' });
        }
        console.log('Fetching templates for therapistID:', therapistID);
        const templates = await NoteTemplate.find({ therapistID });
        res.json({ success: true, templates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteNoteTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        await NoteTemplate.findByIdAndDelete(templateId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all clients for a therapist
export const getTherapistClients = async (req, res) => {
    try {
        const therapistId = req.body.userId; // from authTherapist
        const status = req.query.status || 'ongoing';
        // Get all client relationships for this therapist with the given status
        const clientLinks = await clientModel.find({ therapistID: therapistId, clientStatus: status }).lean();
        // For each client, use appointmentsModel to get info and session count
        const formatted = await Promise.all(clientLinks.map(async link => {
            if (!link.clientID) return null;
            // Find all appointments for this therapist/client
            const appointments = await appointmentsModel.find({
                therapistID: therapistId,
                clientID: link.clientID
            }).populate('clientID', 'firstName lastName email');
            if (!appointments.length) {
                // If no appointments, try to get client name/email from a fallback (optional)
                return null;
            }
            // Use the first appointment to get client info
            const clientInfo = appointments[0].clientID;
            const sessionCount = appointments.length;
            console.log('Client:', clientInfo, 'Total sessions:', sessionCount);
            return {
                _id: clientInfo?._id,
                name: clientInfo ? `${clientInfo.firstName} ${clientInfo.lastName}` : 'Unknown',
                email: clientInfo?.email || '',
                category: '',
                totalSessions: sessionCount,
                clientStatus: link.clientStatus
            };
        }));
        // Filter out nulls (clients with no appointments or missing info)
        res.json({ success: true, clients: formatted.filter(Boolean) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all appointments for a client for the logged-in therapist
export const getClientAppointments = async (req, res) => {
    try {
        const therapistId = req.userId || req.body.userId; // middleware should attach req.userId // from authTherapist
        const clientId = req.query.clientID;
        if (!clientId) return res.status(400).json({ success: false, message: 'Missing clientID' });
        const appointments = await appointmentsModel.find({
            therapistID: therapistId,
            clientID: clientId
        }).sort({ date: -1 });
        res.json({ success: true, appointments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Clear all availability slots for a date
export const clearAvailabilityByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const therapistId = req.body.userId;

        await therapistAvailabilityModel.deleteMany({
            therapistId,
            date,
            isBooked: false // Only delete unbooked slots
        });

        res.json({ success: true, message: 'Availability cleared for date' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Clear all availability slots
export const clearAllAvailability = async (req, res) => {
    try {
        const therapistId = req.body.userId;

        await therapistAvailabilityModel.deleteMany({
            therapistId,
            isBooked: false // Only delete unbooked slots
        });

        res.json({ success: true, message: 'All availability cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTherapistAnalytics = async (req, res) => {
    try {
        const therapistId = req.body.userId;
        const appointments = await appointmentsModel.find({ therapistID: therapistId }).sort({ date: 1 });

        // Dates for calculations
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // Bookings per month
        const lastMonthBookings = appointments.filter(app => {
            const appDate = new Date(app.date);
            return appDate >= lastMonth && appDate < thisMonth;
        }).length;
        const currentMonthBookings = appointments.filter(app => {
            const appDate = new Date(app.date);
            return appDate >= thisMonth && appDate < nextMonth;
        }).length;

        // Simple moving average for prediction (last 3 months)
        const monthlyCounts = {};
        appointments.forEach(app => {
            const d = new Date(app.date);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
        });
        const months = Object.keys(monthlyCounts).sort();
        const last3 = months.slice(-3);
        const predictedNextMonthAppointments = last3.length
            ? Math.round(last3.reduce((sum, m) => sum + monthlyCounts[m], 0) / last3.length)
            : 0;

        // Consecutive sessions distribution
        const clientBookings = {};
        appointments.forEach(app => {
            const id = app.clientID.toString();
            if (!clientBookings[id]) clientBookings[id] = [];
            clientBookings[id].push(app);
        });

        // Enhanced session distribution analysis
        let singleSessionClients = 0, twoToThreeSessions = 0, fourToFiveSessions = 0, sixPlusSessions = 0;
        let totalSessions = 0;
        Object.values(clientBookings).forEach(apps => {
            totalSessions += apps.length;
            if (apps.length === 1) singleSessionClients++;
            else if (apps.length <= 3) twoToThreeSessions++;
            else if (apps.length <= 5) fourToFiveSessions++;
            else sixPlusSessions++;
        });

        // New: Session completion prediction
        const sessionCompletionRate = totalSessions ?
            (appointments.filter(a => a.statusOfAppointment === 'completed').length / totalSessions) : 0;
        const predictedCompletionRate = sessionCompletionRate * 0.95; // 95% of historical rate

        // New: Student engagement score
        const engagementScores = {};
        Object.entries(clientBookings).forEach(([clientId, apps]) => {
            const completedSessions = apps.filter(a => a.statusOfAppointment === 'completed').length;
            const cancelledSessions = apps.filter(a => a.statusOfAppointment === 'cancelled').length;
            const totalSessions = apps.length;
            const avgInterval = apps.length > 1 ?
                apps.reduce((sum, app, i) => {
                    if (i === 0) return 0;
                    return sum + (new Date(app.date) - new Date(apps[i - 1].date)) / (1000 * 60 * 60 * 24);
                }, 0) / (apps.length - 1) : 0;

            engagementScores[clientId] = {
                score: (completedSessions / totalSessions) * (1 - (cancelledSessions / totalSessions)) * (1 / (1 + avgInterval / 30)),
                totalSessions,
                completedSessions,
                cancelledSessions,
                avgInterval
            };
        });

        // New: Predict student retention
        const retentionPrediction = Object.values(engagementScores).reduce((acc, score) => {
            if (score.score > 0.8) acc.high += 1;
            else if (score.score > 0.5) acc.medium += 1;
            else acc.low += 1;
            return acc;
        }, { high: 0, medium: 0, low: 0 });

        // New: Session timing patterns
        const sessionTimings = appointments.reduce((acc, app) => {
            const hour = new Date(app.date).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});

        const peakHours = Object.entries(sessionTimings)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([hour]) => `${hour}:00`);

        // Rebook after cancel rate
        let rebookAfterCancel = 0, totalCancelled = 0;
        Object.values(clientBookings).forEach(apps => {
            const cancelled = apps.some(a => a.statusOfAppointment === 'cancelled');
            const rebooked = apps.some(a => a.statusOfAppointment !== 'cancelled');
            if (cancelled) totalCancelled++;
            if (cancelled && rebooked) rebookAfterCancel++;
        });
        const rebookAfterCancelRate = totalCancelled ? (rebookAfterCancel / totalCancelled) : 0;

        // Predicted cancellation rate with confidence
        const total = appointments.length;
        const cancelled = appointments.filter(a => a.statusOfAppointment === 'cancelled').length;
        const predictedCancellations = total ? (cancelled / total) : 0;
        const cancellationConfidence = Math.min(0.95, 1 - (1 / Math.sqrt(total)));

        // Avg consecutive sessions for new clients
        let totalConsecutive = 0, newClientCount = 0;
        Object.values(clientBookings).forEach(apps => {
            if (apps.length < 2) return;
            apps.sort((a, b) => new Date(a.date) - new Date(b.date));
            let maxStreak = 1, streak = 1;
            for (let i = 1; i < apps.length; i++) {
                const diff = (new Date(apps[i].date) - new Date(apps[i - 1].date)) / (1000 * 60 * 60 * 24);
                if (diff <= 30) streak++;
                else streak = 1;
                if (streak > maxStreak) maxStreak = streak;
            }
            totalConsecutive += maxStreak;
            newClientCount++;
        });
        const avgConsecutiveSessionsForNewClients = newClientCount ? (totalConsecutive / newClientCount) : 0;

        // Client retention rate
        const totalClients = Object.keys(clientBookings).length;
        const retainedClients = Object.values(clientBookings).filter(apps => apps.length > 1).length;
        const clientRetentionRate = totalClients ? (retainedClients / totalClients) : 0;

        // Avg days between sessions
        let totalIntervals = 0, intervalCount = 0;
        Object.values(clientBookings).forEach(apps => {
            if (apps.length < 2) return;
            apps.sort((a, b) => new Date(a.date) - new Date(b.date));
            for (let i = 1; i < apps.length; i++) {
                const diff = (new Date(apps[i].date) - new Date(apps[i - 1].date)) / (1000 * 60 * 60 * 24);
                totalIntervals += diff;
                intervalCount++;
            }
        });
        const avgSessionInterval = intervalCount ? (totalIntervals / intervalCount) : 0;

        res.json({
            success: true,
            analytics: {
                lastMonthBookings,
                predictedLastMonth: lastMonthBookings,
                currentMonthBookings,
                predictedCurrentMonth: currentMonthBookings,
                predictedNextMonthAppointments,
                singleSessionClients,
                deleteDoctor,
                twoToThreeSessions,
                fourToFiveSessions,
                sixPlusSessions,
                rebookAfterCancelRate,
                predictedCancellations,
                cancellationConfidence,
                avgConsecutiveSessionsForNewClients,
                clientRetentionRate,
                avgSessionInterval,
                // New analytics
                sessionCompletionRate,
                predictedCompletionRate,
                engagementScores,
                retentionPrediction,
                peakHours,
                sessionDistribution: {
                    single: singleSessionClients,
                    twoToThree: twoToThreeSessions,
                    fourToFive: fourToFiveSessions,
                    sixPlus: sixPlusSessions
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};