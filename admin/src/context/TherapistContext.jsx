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
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Dashboard API error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            toast.error("Failed to load dashboard data.");
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
                const errorText = await response.text();
                console.error('Appointments API error response:', errorText);
                throw new Error(`Server Error: ${response.status} - ${errorText}`);
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
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching appointments:", {
                message: error.message,
                cause: error.cause,
                stack: error.stack
            });
            toast.error("Failed to fetch appointments.");
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
            saveAvailability
        }}>
            {props.children}
        </TherapistContext.Provider>
    );
};

export default TherapistContextProvider;