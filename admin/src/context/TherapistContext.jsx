import React, { useState, createContext } from 'react';

import axios from 'axios';
import { toast } from 'react-toastify';

export const TherapistContext = createContext();

const TherapistContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    console.log('Backend URL:', backendUrl); // Debug backend URL

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') || '');
    console.log('Current dToken:', dToken); // Debug token
    const [therapistID, setTherapistID] = useState(localStorage.getItem('doctorId') || '');
    const [availability, setAvailability] = useState({});
    console.log("Therapist ID:", therapistID); // Store therapist ID
    const [dashData, setDashData] = useState({
        therapistDetails: {},
        stats: {},
        formattedAppointments: [],
        bookingTrendsData: [],
        newClientsData: [],
        ongoingClients: [],
        earningsData: [],
        cancellationBreakdown: [
            { name: "Client Cancellations", value: 0 },
            { name: "Therapist Cancellations", value: 0 }
        ]
    });

    const [recurringSchedules, setRecurringSchedules] = useState([]);

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
    // Fetching Therapist Dashboard Data
    const getDashData = async () => {
        console.log('getDashData called with token:', dToken);
        try {
            console.log('Making dashboard API call to:', `${backendUrl}/api/therapist/dashboard`);
            console.log('Request headers:', { ttoken: dToken });

            const { data } = await axios.get(`${backendUrl}/api/therapist/dashboard`, {
                headers: { ttoken: dToken },
                validateStatus: function (status) {
                    return status < 500; // Resolve only if status < 500
                }
            });

            console.log('Dashboard API response:', data);

            if (data.success) {
                setDashData({
                    therapistDetails: data.dashData.therapistDetails,
                    stats: data.dashData.stats,
                    formattedAppointments: data.dashData.formattedAppointments || [],
                    bookingTrendsData: data.dashData.bookingTrendsData || [],
                    newClientsData: data.dashData.newClientsData || [],
                    ongoingClients: data.dashData.ongoingClients || [],
                    earningsData: data.dashData.earningsData || [],
                    cancellationBreakdown: data.dashData.cancellationBreakdown || [
                        { name: "Client Cancellations", value: 0 },
                        { name: "Therapist Cancellations", value: 0 }
                    ],
                });
            } else {
                console.error('Dashboard API error:', data.message);
                toast.error(data.message || 'Failed to load dashboard data.');
            }
        } catch (error) {
            let msg = "Failed to load dashboard data.";
            if (error.response && error.response.data && error.response.data.message) {
                msg = error.response.data.message;
            }
            toast.error(msg);
            console.error('Dashboard API error details:', error);
        }
    };


    const [appointments, setAppointments] = useState({
        current: [],
        past: [],
        all: []
    });

    // Fetching Therapist Appointments
    const fetchAppointments = async () => {
        console.log("fetchAppointments called with token:", dToken);

        if (!dToken) {
            console.error("Therapist token missing.");
            return;
        }

        try {
            console.log('Making appointments API call to:', `${backendUrl}/api/therapist/appointments`);
            console.log('Request headers:', {
                "Content-Type": "application/json",
                "ttoken": dToken
            });

            const response = await fetch(`${backendUrl}/api/therapist/appointments`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "ttoken": dToken
                },
            });

            console.log('Appointments API response status:', response.status);

            if (!response.ok) {
                let errorMsg = `Server Error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) errorMsg = errorData.message;
                } catch (e) {
                    // fallback to text
                    const errorText = await response.text();
                    errorMsg = errorText;
                }
                console.error('Appointments API error response:', errorMsg);
                throw new Error(errorMsg);
            }

            const data = await response.json();
            console.log("Appointments API response data:", data);

            if (data.success) {
                const currentDate = new Date();
                const categorizedAppointments = {
                    current: [],
                    past: [],
                    all: data.allAppointments
                };

                data.allAppointments.forEach(appointment => {
                    const appointmentDate = new Date(`${appointment.date}T${convertTo24Hour(appointment.time)}`);
                    if (appointment.status === "completed" || appointmentDate < currentDate || appointment.status === "cancelled") {
                        categorizedAppointments.past.push(appointment);
                    } else if (appointment.status === "upcoming") {
                        categorizedAppointments.current.push(appointment);
                    }
                });

                console.log('Categorized appointments:', categorizedAppointments);
                setAppointments(categorizedAppointments);
            } else {
                console.error('Appointments API error:', data.message);
                toast.error(data.message || 'Failed to fetch appointments.');
            }
        } catch (error) {
            let msg = "Failed to fetch appointments.";
            if (error.response && error.response.data && error.response.data.message) {
                msg = error.response.data.message;
            } else if (error.message) {
                msg = error.message;
            }
            toast.error(msg);
            console.error("Error fetching appointments:", error);
        }
    };

    // Cancel appointment function
    const cancelAppointment = async (appointmentId) => {
        console.log("Canceling appointment:", appointmentId);

        try {
            const { data } = await axios.post(`${backendUrl}/api/therapist/cancel-appointment`, {
                appointmentId
            }, { headers: { ttoken: dToken } });

            if (data.success) {
                toast.success(data.message);
                fetchAppointments();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    };

    // Update meeting link function
    const updateMeetingLink = async (appointmentId, newLink) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/therapist/update-meeting-link`, {
                appointmentId,
                newLink
            }, {
                headers: { ttoken: dToken }
            });

            if (data.success) {
                toast.success(data.message);
                fetchAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    };

    const fetchAvailability = async () => {
        try {
            const res = await axios.post(`${backendUrl}/api/therapist/availability`, {}, {
                headers: { ttoken: dToken }
            });
            if (res.data.success) {
                setAvailability(res.data.availability || {});
            }
        } catch (error) {
            console.error("Error fetching availability", error);
            toast.error("Failed to fetch availability");
        }
    };
    const saveAvailability = async (availabilityData) => {
        try {
            const res = await axios.post(`${backendUrl}/api/therapist/change-availability`, {
                selectedSlots: availabilityData
            }, {
                headers: { ttoken: dToken }
            });

            if (res.data.success) {
                toast.success("Availability updated");
                fetchAvailability(); // Refresh state
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            console.error("Save availability failed", err);
            toast.error("Error saving availability");
        }
    };

    const fetchRecurringSchedules = async () => {
        try {
            console.log('Fetching recurring schedules');
            const response = await axios.get(`${backendUrl}/api/therapist/recurring-schedules`, {
                headers: { ttoken: dToken }
            });

            if (response.data.success) {
                console.log('Fetched recurring schedules:', response.data.schedules);
                setRecurringSchedules(response.data.schedules.filter(s => s.isActive));
            }
        } catch (error) {
            console.error('Error fetching recurring schedules:', error);
            toast.error('Failed to load recurring schedules');
        }
    };

    const deleteRecurringSchedule = async (scheduleId) => {
        try {
            console.log('Deleting recurring schedule:', scheduleId);
            const response = await axios.delete(
                `${backendUrl}/api/therapist/recurring-schedules/${scheduleId}`,
                { headers: { ttoken: dToken } }
            );

            if (response.data.success) {
                toast.success('Schedule deleted successfully');
                fetchRecurringSchedules();
                fetchAvailability(); // Refresh availability after deleting schedule
            }
        } catch (error) {
            console.error('Error deleting recurring schedule:', error);
            toast.error('Failed to delete schedule');
        }
    };

    const clearAvailabilityByDate = async (date) => {
        try {
            const response = await axios.delete(
                `${backendUrl}/api/therapist/availability/date/${date}`,
                { headers: { ttoken: dToken } }
            );
            if (response.data.success) {
                toast.success('Availability cleared for date');
                fetchAvailability(); // Refresh availability
            }
        } catch (error) {
            console.error('Error clearing availability:', error);
            toast.error(error.response?.data?.message || 'Failed to clear availability');
        }
    };

    const clearAllAvailability = async () => {
        try {
            const response = await axios.delete(
                `${backendUrl}/api/therapist/availability/all`,
                { headers: { ttoken: dToken } }
            );
            if (response.data.success) {
                toast.success('All availability cleared');
                fetchAvailability(); // Refresh availability
            }
        } catch (error) {
            console.error('Error clearing all availability:', error);
            toast.error(error.response?.data?.message || 'Failed to clear all availability');
        }
    };

    const saveRecurringAvailability = async (recurringSchedule) => {
        try {
            console.log('Saving recurring schedule:', recurringSchedule);
            const response = await axios.post(
                `${backendUrl}/api/therapist/recurring-availability`,
                recurringSchedule,
                { headers: { ttoken: dToken } }
            );

            if (response.data.success) {
                toast.success('Schedule saved successfully');
                fetchRecurringSchedules();
                fetchAvailability(); // Refresh availability after saving new schedule
            }
        } catch (error) {
            console.error('Error saving recurring schedule:', error);
            toast.error(error.response?.data?.message || 'Failed to save schedule');
        }
    };

    const updateRecurringSchedule = async (scheduleId, updatedSchedule) => {
        try {
            console.log('Updating recurring schedule:', { scheduleId, updatedSchedule });
            const response = await axios.put(
                `${backendUrl}/api/therapist/recurring-schedules/${scheduleId}`,
                updatedSchedule,
                { headers: { ttoken: dToken } }
            );

            if (response.data.success) {
                toast.success('Schedule updated successfully');
                fetchRecurringSchedules();
                fetchAvailability(); // Refresh availability after update
            }
        } catch (error) {
            console.error('Error updating recurring schedule:', error);
            toast.error('Failed to update schedule');
        }
    };

    // Helper to check if a time is within any break
    function isTimeInBreaks(timeStr, breaks) {
        if (!breaks || breaks.length === 0) return false;
        const [h, m] = timeStr.split(":").map(Number);
        const timeMinutes = h * 60 + m;
        return breaks.some(b => {
            const [startH, startM] = b.start.split(":").map(Number);
            const [endH, endM] = b.end.split(":").map(Number);
            const startMin = startH * 60 + startM;
            const endMin = endH * 60 + endM;
            return timeMinutes >= startMin && timeMinutes < endMin;
        });
    }

    const generateSlotsFromRecurringSchedule = (recurringSchedule) => {
        const slots = {};
        const startDate = new Date(recurringSchedule.startDate);
        const endDate = recurringSchedule.endDate ? new Date(recurringSchedule.endDate) : null;
        const breaks = recurringSchedule.breaks || [];

        recurringSchedule.days.forEach(day => {
            let currentDate = new Date(startDate);
            while (currentDate.getDay() !== day) {
                currentDate.setDate(currentDate.getDate() + 1);
            }
            while (!endDate || currentDate <= endDate) {
                const dateStr = currentDate.toISOString().split('T')[0];
                slots[dateStr] = {};
                const [startHour, startMinute] = recurringSchedule.startTime.split(':').map(Number);
                const [endHour, endMinute] = recurringSchedule.endTime.split(':').map(Number);
                let currentTime = new Date();
                currentTime.setHours(startHour, startMinute, 0, 0);
                const endTime = new Date();
                endTime.setHours(endHour, endMinute, 0, 0);
                while (currentTime < endTime) {
                    const timeStr = currentTime.toTimeString().slice(0, 5);
                    // Skip if this time is in a break
                    if (!isTimeInBreaks(timeStr, breaks)) {
                        slots[dateStr][timeStr] = recurringSchedule.types.map(type => ({
                            type,
                            isBooked: false
                        }));
                    }
                    currentTime.setMinutes(currentTime.getMinutes() + recurringSchedule.interval);
                }
                currentDate.setDate(currentDate.getDate() + 7);
            }
        });
        return slots;
    };

    // --- Client Notes & Templates API ---
    const fetchClientNotes = async (clientID, search = "") => {
        try {
            const url = search
                ? `${backendUrl}/api/therapist/client-notes/search?query=${encodeURIComponent(search)}&clientID=${clientID}`
                : `${backendUrl}/api/therapist/client-notes?clientID=${clientID}&therapistID=${therapistID}`;
            const { data } = await axios.get(url, { headers: { ttoken: dToken } });
            return data.notes || [];
        } catch (err) {
            return [];
        }
    };

    const addClientNote = async (note) => {
        try {
            const payload = {
                clientId: note.clientId,
                therapistId: therapistID,
                content: note.content || '',
                templateUsed: note.templateId ? note.templateName : 'General',
                fields: note.fields || {},
                appointmentId: note.appointmentId || null,
                date: note.date || new Date().toISOString(),
                tags: note.tags || [],
                status: note.status || 'published'
            };
            console.log('Sending client note to backend:', payload);
            const { data } = await axios.post(`${backendUrl}/api/therapist/client-notes`, payload, { headers: { ttoken: dToken } });
            if (data.success) {
                return data.note;
            } else {
                throw new Error(data.message || 'Failed to save note');
            }
        } catch (err) {
            console.error('Error saving client note:', err?.response?.data || err.message);
            throw err;
        }
    };
    const pinClientNote = async (noteId, pin) => {
        try {
            await axios.patch(`${backendUrl}/api/therapist/client-notes/${noteId}/pin`, { pinned: pin }, { headers: { ttoken: dToken } });
        } catch (err) { }
    };
    const searchClientNotes = async (clientID, query) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/therapist/client-notes/search?query=${encodeURIComponent(query)}&clientID=${clientID}`, { headers: { ttoken: dToken } });
            return data.notes || [];
        } catch (err) { return []; }
    };
    const fetchNoteTemplates = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/therapist/note-templates`, {
                headers: { ttoken: dToken }
            });
            return data.templates || [];
        } catch (err) { return []; }
    };
    const addNoteTemplate = async (template) => {
        try {
            // Defensive: ensure category is present and valid
            const allowedCategories = ['assessment', 'formulation', 'session', 'progress', 'custom'];
            let safeTemplate = { ...template };
            if (!safeTemplate.category || !allowedCategories.includes(safeTemplate.category)) {
                safeTemplate.category = 'custom';
            }
            console.log('Sending template to backend:', safeTemplate);
            await axios.post(`${backendUrl}/api/therapist/note-templates`, safeTemplate, { headers: { ttoken: dToken } });
        } catch (err) {
            console.error('Error saving template:', err?.response?.data || err.message);
        }
    };
    const deleteNoteTemplate = async (templateId) => {
        try {
            await axios.delete(`${backendUrl}/api/therapist/note-templates/${templateId}`, { headers: { ttoken: dToken } });
        } catch (err) { }
    };

    // Fetch clients
    const getClients = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/therapist/clients`, {
                headers: { ttoken: dToken }
            });
            if (data.success) {
                return data.clients;
            }
            throw new Error(data.message || 'Failed to fetch clients');
        } catch (error) {
            toast.error(error.message || 'Failed to fetch clients');
            console.error('Error fetching clients:', error);
            return [];
        }
    };

    const getClientDetails = async (clientId) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/therapist/client/${clientId}`, {
                headers: { ttoken: dToken }
            });
            if (data.success) {
                return data.client;
            }
            throw new Error(data.message || 'Failed to fetch client details');
        } catch (error) {
            toast.error(error.message || 'Failed to fetch client details');
            console.error('Error fetching client details:', error);
            return null;
        }
    };

    const addClientGoal = async (goalData) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/therapist/client/goal`, {
                ...goalData,
                therapistId: therapistID
            }, {
                headers: { ttoken: dToken }
            });
            if (data.success) {
                toast.success('Goal added successfully');
                return data.goal;
            }
            throw new Error(data.message || 'Failed to add goal');
        } catch (error) {
            toast.error(error.message || 'Failed to add goal');
            console.error('Error adding goal:', error);
            return null;
        }
    };

    const addClientProgress = async (progressData) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/therapist/client/progress`, {
                ...progressData,
                therapistId: therapistID
            }, {
                headers: { ttoken: dToken }
            });
            if (data.success) {
                toast.success('Progress added successfully');
                return data.progress;
            }
            throw new Error(data.message || 'Failed to add progress');
        } catch (error) {
            toast.error(error.message || 'Failed to add progress');
            console.error('Error adding progress:', error);
            return null;
        }
    };

    const fetchAnalytics = async () => {
        const { data } = await axios.post(`${backendUrl}/api/therapist/analytics`, {}, { headers: { ttoken: dToken } });
        return data.analytics;
    };

    return (
        <TherapistContext.Provider value={{
            dToken,
            setDToken,
            dashData,
            getDashData,
            therapistID,
            setTherapistID,
            appointments,
            fetchAppointments,
            cancelAppointment,
            updateMeetingLink,
            availability,
            fetchAvailability,
            saveAvailability,
            saveRecurringAvailability,
            generateSlotsFromRecurringSchedule,
            recurringSchedules,
            fetchRecurringSchedules,
            updateRecurringSchedule,
            deleteRecurringSchedule,
            clearAvailabilityByDate,
            clearAllAvailability,
            // --- Client Notes ---
            fetchClientNotes,
            addClientNote,
            pinClientNote,
            searchClientNotes,
            fetchNoteTemplates,
            addNoteTemplate,
            deleteNoteTemplate,
            getClients,
            getClientDetails,
            addClientGoal,
            addClientProgress,
            fetchAnalytics
        }}>
            {props.children}
        </TherapistContext.Provider>
    );
};

export default TherapistContextProvider;