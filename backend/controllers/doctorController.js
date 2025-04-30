import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import appointmentsModel from "../models/appointmentsModel.js";
import clientModel from "../models/clientModel.js";
import therapistAvailabilityModel from "../models/therapistAvailabilityModel.js";


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
        const appointments = await appointmentsModel.find({ therapistID: docId }).populate('clientID', 'name');

        // Fetch ongoing clients - Add null check for clientID
        const ongoingClients = await clientModel
            .find({ therapistID: docId, clientStatus: "ongoing" })
            .populate("clientID", "name") // Get client name
            .lean();

        // Format the ongoing clients with null checks
        const formattedOngoingClients = ongoingClients.map(client => ({
            id: client._id,
            clientId: client.clientID?._id || 'Unknown',
            client: client.clientID?.name || "Unknown",
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
            .filter(app => app.statusOfAppointment !== "cancelled" && app.timeSlot)
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
                        Subject: `Session with ${appointment.clientID?.name || 'Unknown Client'}`,
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

        // Calculate new clients data with null checks
        const seenClients = new Set();
        const newClientsByMonth = monthNames.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});

        appointments.forEach((app) => {
            if (!app.date || !app.clientID) return;
            const date = new Date(app.date);
            const key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

            const clientId = app.clientID.toString();
            if (!seenClients.has(clientId) && newClientsByMonth[key] !== undefined) {
                seenClients.add(clientId);
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
        const docId = req.body.userId; // From authDoctor middleware

        if (!docId) {
            return res.status(400).json({ success: false, message: "Invalid therapist ID" });
        }

        const currentDate = new Date();

        // Fetch appointments for this therapist and populate client details
        const appointments = await appointmentsModel.find({ therapistID: docId }).populate("clientID", "name");

        // Categorize appointments into current and past
        const formattedAppointments = appointments.map(app => ({
            id: app._id,
            client: app.clientID?.name || "Unknown",
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

        for (const date of dates) {
            const slots = selectedSlots[date];

            // Update queries to use docId instead of therapistId
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

            // Update upsert operations to use docId
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


export {
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    deleteDoctor
}