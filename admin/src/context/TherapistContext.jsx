import React, { useState, createContext } from 'react';

import axios from 'axios';
import { toast } from 'react-toastify';

export const TherapistContext = createContext();

const TherapistContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [tToken, setTToken] = useState(localStorage.getItem('tToken') || '');
    const [therapistID, setTherapistID] = useState(localStorage.getItem('therapistID') || ''); 
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
        try {
            const { data } = await axios.get(`${backendUrl}/api/therapist/dashboard`, { headers: { tToken } });

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
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
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
        console.log("fetchAppointments function called");
    console.log("Fetching with Token:", tToken);

    if (!tToken) {
        console.error("Therapist token missing.");
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/api/therapist/appointments`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ttoken": tToken
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Appointments Data:", data);


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

                setAppointments(categorizedAppointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            console.error(error);
            toast.error("Failed to fetch appointments.");
        }
    };

        // Cancel appointment function
        const cancelAppointment = async (appointmentId) => {
            console.log("Canceling appointment:", appointmentId);
        
            try {
                const { data } = await axios.post(`${backendUrl}/api/therapist/cancel-appointment`, {
                    appointmentId
                }, { headers: { tToken } });
        
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
                headers: { tToken }
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
                headers: { tToken }
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
                headers: { tToken }
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
                tToken, 
                setTToken, 
                dashData, 
                getDashData, 
                therapistID, 
                setTherapistID, 
                appointments, 
                fetchAppointments,
                cancelAppointment, 
                updateMeetingLink ,
                availability,
                fetchAvailability,
                saveAvailability
             }}>
            {props.children}
        </TherapistContext.Provider>
    );
};

export default TherapistContextProvider;