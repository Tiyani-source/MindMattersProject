import therapistModel from "../models/therapistModel.js";
import appointmentsModel from "../models/appointmentsModel.js";
import clientModel from "../models/clientModel.js";
import therapistAvailabilityModel from '../models/therapistAvailabilityModel.js'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// API for therapist Login 
export const loginTherapist = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await therapistModel.findOne({ email })

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

// API for therapist dashboard details
export const getTherapistDashboard = async (req, res) => {
    try {
        const therapistId = req.body.therapistId; // Extracted from token
        if (!therapistId) {
            return res.status(400).json({ success: false, message: "Invalid therapist ID" });
        }

        // Fetch therapist details
        const therapist = await therapistModel.findById(therapistId);
        if (!therapist) {
            return res.status(404).json({ success: false, message: "Therapist not found" });
        }

        // Fetch appointments for this therapist
        const appointments = await appointmentsModel.find({ therapistID: therapistId }).populate('clientID', 'name');

        // Fetch ongoing clients
        const ongoingClients = await clientModel
            .find({ therapistID: therapistId, clientStatus: "ongoing" })
            .populate("clientID", "name") // Get client name
            .lean();

        // Format the ongoing clients
        const formattedOngoingClients = ongoingClients.map(client => ({
            id: client._id,
            clientId: client.clientID?._id,
            client: client.clientID?.name || "Unknown",
            status: client.clientStatus,
            date: new Date(client.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) // Last update as last appointment
        }));


        // Compute statistics
        const totalAppointments = appointments.length;
        const activeAppointments = appointments.filter(app => app.statusOfAppointment === "upcoming").length;

        // Calculate the average rating
        const completedRatings = appointments.filter(app => app.statusOfAppointment === "completed" && app.rating !== null);
        const totalRatings = completedRatings.reduce((sum, app) => sum + (app.rating || 0), 0);
        const avgRating = completedRatings.length ? (totalRatings / completedRatings.length).toFixed(1) : "N/A";

        // Calculate total earnings
        const currentDate = new Date();
        const currentYear = currentDate.getUTCFullYear();
        const currentMonth = currentDate.getUTCMonth(); // 0-indexed (Jan = 0, Feb = 1, etc.)
        
        const totalEarnings = appointments
            .filter(app => {
                if (app.statusOfAppointment !== "completed") return false;
        
                const appDate = new Date(app.date);
                return appDate.getUTCFullYear() === currentYear && appDate.getUTCMonth() === currentMonth;
            })
            .reduce((sum, app) => sum + app.amount, 0);
        
        // Format earnings
        const formattedEarnings = `LKR ${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        console.log(formattedEarnings);

        // Include in response
        const dashData = {
            therapistDetails: {
                name: therapist.name,
                speciality: therapist.speciality,
                experience: therapist.experience,
                fees: therapist.fees,
                available: therapist.available,
            },
            ongoingClients: formattedOngoingClients,
            stats: {
                totalAppointments,
                activeAppointments,
                formattedEarnings,
                avgRating,
            },
            appointments
        };

        const formattedAppointments = appointments
        .filter(app => app.statusOfAppointment !== "cancelled")
        .map((appointment) => {
          const formattedDate = new Date(appointment.date).toISOString().split("T")[0];
          const startDateTime = new Date(formattedDate);
      
          // Defensive checks
          if (!appointment.timeSlot?.startTime || !appointment.timeSlot?.endTime) {
            console.warn("Missing timeSlot for appointment:", appointment._id);
            return null;
          }
      
          // 🛡 Helper to parse time safely
          const parseTime = (timeStr) => {
            let hour = 0, minute = 0;
            if (timeStr.includes("AM") || timeStr.includes("PM")) {
              // 12-hour format
              const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
              if (match) {
                let [_, h, m, meridian] = match;
                hour = parseInt(h);
                minute = parseInt(m);
                meridian = meridian.toUpperCase();
                if (meridian === "PM" && hour !== 12) hour += 12;
                if (meridian === "AM" && hour === 12) hour = 0;
              } else {
                console.warn("Invalid 12-hour time format:", timeStr);
                return null;
              }
            } else {
              // 24-hour format
              const [h, m] = timeStr.split(":");
              hour = parseInt(h);
              minute = parseInt(m);
            }
            return { hour, minute };
          };
      
          // ⏰ Parse startTime
          const startParsed = parseTime(appointment.timeSlot.startTime);
          if (!startParsed) return null;
          startDateTime.setHours(startParsed.hour, startParsed.minute, 0, 0);
      
          // ⏰ Parse endTime
          const endDateTime = new Date(startDateTime);
          const endParsed = parseTime(appointment.timeSlot.endTime);
          if (!endParsed) return null;
          endDateTime.setHours(endParsed.hour, endParsed.minute, 0, 0);
      
          return {
            Id: appointment._id,
            Subject: `Session with ${appointment.clientID?.name || 'Unknown Client'}`,
            StartTime: startDateTime,
            EndTime: endDateTime,
            Location: appointment.typeOfAppointment === 'online' ? (appointment.meetingLink || 'Online') : 'Therapist Office',
            Description: appointment.review || 'No review available',
            Status: appointment.statusOfAppointment,
            Amount: appointment.amount,
          };
        }).filter(Boolean); // Remove nulls from invalid appointments

        // Assign to dashData
        dashData.formattedAppointments = formattedAppointments;

        // Initialize last 12 months (ensuring all months are present)
        const pastYearEarnings = {};
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentYear, currentMonth - i, 1); // Move back month by month
            const key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
            
            pastYearEarnings[key] = { total: 0, online: 0, inPerson: 0 };
        }

        // Process earnings data
        appointments.forEach((app) => {
            if (app.statusOfAppointment === "completed") {
                const date = new Date(app.date);
                const key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
                
                if (pastYearEarnings[key]) {
                    pastYearEarnings[key].total += app.amount;
                    if (app.typeOfAppointment === "online") {
                        pastYearEarnings[key].online += app.amount;
                    } else {
                        pastYearEarnings[key].inPerson += app.amount;
                    }
                }
            }
        });

        // Convert to array for frontend (sorted from oldest to newest)
        const earningsData = Object.keys(pastYearEarnings)
            .sort((a, b) => new Date(`1 ${a}`) - new Date(`1 ${b}`)) // Ensure correct order
            .map((month) => ({
                month,
                total: pastYearEarnings[month].total,
                online: pastYearEarnings[month].online,
                inPerson: pastYearEarnings[month].inPerson,
            }));

        dashData.earningsData = earningsData;

        // Group booking trends by month
        // Define start and end date range for past 12 months
        const startDate = new Date(currentYear - 1, currentMonth, 1); // Same month, last year
        const endDate = new Date(currentYear, currentMonth + 1, 1); // First day of next month

        // Filter only the past 12 months' bookings
        const filteredAppointments = appointments.filter(app => {
            const appDate = new Date(app.date);
            return appDate >= startDate && appDate < endDate;
        });

        // Create an ordered array of past 12 months (formatted as "MMM YYYY")
        const monthNames = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentYear, currentMonth - i, 1);
            monthNames.unshift(`${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`);
        }

        // Initialize bookings data structure with zero values
        const bookingsByMonth = monthNames.reduce((acc, month) => {
            acc[month] = { total: 0, online: 0, inPerson: 0 };
            return acc;
        }, {});
        

        // Process filtered appointments
        filteredAppointments.forEach((app) => {
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

        // Convert data to an ordered array for charts
        const bookingTrendsData = monthNames.map(month => ({
            month,
            total: bookingsByMonth[month].total,
            online: bookingsByMonth[month].online,
            inPerson: bookingsByMonth[month].inPerson,
        }));

        dashData.bookingTrendsData = bookingTrendsData;

        // Create an ordered array of past 12 months (formatted as "MMM YYYY")
        const monthCNames = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentYear, currentMonth - i, 1);
            monthCNames.unshift(`${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`);
        }

        // Initialize new clients data structure with zero values
        const newClientsByMonth = monthCNames.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});

        const seenClients = new Set();

        // Process appointments to track new clients
        appointments.forEach((app) => {
            const date = new Date(app.date);
            const key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

            if (!seenClients.has(app.clientID.toString()) && newClientsByMonth[key] !== undefined) {
                seenClients.add(app.clientID.toString());
                newClientsByMonth[key] += 1;
            }
        });

        // Convert data to an ordered array for charts
        const newClientsData = monthNames.map(month => ({
            month,
            newClients: newClientsByMonth[month],
        }));

        dashData.newClientsData = newClientsData;

                // Calculate cancellation breakdown
                const clientCancellations = appointments.filter(app => app.statusOfAppointment === "cancelled" && app.cancelledBy === "client").length;
                const therapistCancellations = appointments.filter(app => app.statusOfAppointment === "cancelled" && app.cancelledBy === "therapist").length;

                const cancellationBreakdown = [
                    { name: "Client Cancellations", value: clientCancellations },
                    { name: "Therapist Cancellations", value: therapistCancellations }
                ];
                
                dashData.cancellationBreakdown = cancellationBreakdown;

                        return res.status(200).json({ success: true, dashData });

            } catch (error) {
                console.error(error);
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
        const therapistId = req.body.therapistId; // Extract therapist ID from request body

        if (!therapistId) {
            return res.status(400).json({ success: false, message: "Invalid therapist ID" });
        }

        const currentDate = new Date();

        // Fetch appointments for this therapist and populate client details
        const appointments = await appointmentsModel.find({ therapistID: therapistId }).populate("clientID", "name");

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
        const { appointmentId, therapistId } = req.body;

        const appointment = await appointmentsModel.findById(appointmentId);
        if (appointment && appointment.therapistID.equals(therapistId)) {
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
        const { appointmentId, newLink, therapistId } = req.body;

        const appointment = await appointmentsModel.findById(appointmentId);
        if (appointment && appointment.therapistID.equals(therapistId)) {
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
      const { therapistId, selectedSlots } = req.body;
  
      const dates = Object.keys(selectedSlots);
  
      for (const date of dates) {
        const slots = selectedSlots[date];
  
        // Remove any availability not in the current selectedSlots
        const existing = await therapistAvailabilityModel.find({ therapistId, date });
        for (const slot of existing) {
            const typesInFrontend = Array.isArray(slots[slot.time])
            ? slots[slot.time].map(s => s.type)
            : [];
  
          if (!typesInFrontend.includes(slot.type)) {
            // Check if this slot has a booking
            if (!slot.isBooked) {
              await therapistAvailabilityModel.deleteOne({ _id: slot._id });
            }
          }
        }
  
        // Upsert new availability
        for (const time in slots) {
          const types = Array.isArray(slots[time])
  ? slots[time].map(s => s.type)
  : [];
          for (const type of types) {
            await therapistAvailabilityModel.updateOne(
              { therapistId, date, time, type },
              { therapistId, date, time, type },
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
        const { therapistId } = req.body;
  
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
        res.status(500).json({ success: false, message: err.message });
    }
  };

  export const getAvailability = async (req, res) => {
    try {
        const { therapistId } = req.body;
        const record = await therapistAvailabilityModel.findOne({ therapistID: therapistId });

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

        const therapists = await therapistModel.find({}).select(['-password', '-email'])
        res.json({ success: true, therapists })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

