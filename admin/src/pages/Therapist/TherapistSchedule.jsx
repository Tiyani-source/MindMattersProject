import React, { useContext, useState, useEffect } from 'react';
import { TherapistContext } from '../../context/TherapistContext';
import {
    ScheduleComponent,
    ViewsDirective,
    ViewDirective,
    Day,
    Week,
    WorkWeek,
    Month,
    Agenda,
    Inject
} from '@syncfusion/ej2-react-schedule';
import { Calendar } from 'lucide-react';

import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-react-schedule/styles/material.css';

const TherapistSchedule = () => {
    const { dashData, getDashData, availability } = useContext(TherapistContext);
    const [appointments, setAppointments] = useState([]);
    const [showType, setShowType] = useState("both"); // 'appointments', 'availability', 'both'
    const [isSyncing, setIsSyncing] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        getDashData(); // Fetch appointments
    }, []);

    useEffect(() => {
        if (dashData?.formattedAppointments?.length > 0) {
            setAppointments(dashData.formattedAppointments);
        }
    }, [dashData.formattedAppointments]);

    const availabilityEvents = Object.entries(availability || {}).flatMap(([date, timeObj]) =>
        Object.entries(timeObj).map(([time, types]) => {
            const typeList = Array.isArray(types)
                ? types.map(t => t.type)
                : typeof types === "string"
                    ? types.split(', ')
                    : [];

            const combinedType = typeList.join(' & ') || "Unknown";

            const startTime = new Date(`${date}T${time}:00`);
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

            return {
                Id: `AV-${date}-${time}`,
                Subject: `Available (${combinedType})`,
                StartTime: startTime,
                EndTime: endTime,
                CategoryColor: "#FFD700",
                Type: "Availability",
            };
        })
    );

    // 🔍 Remove availability slots that overlap with appointments
    const filteredAvailability = availabilityEvents.filter(av => {
        return !appointments.some(app => {
            return (
                new Date(app.StartTime).getTime() === new Date(av.StartTime).getTime()
            );
        });
    });

    const mergedEvents = [
        ...(showType === "appointments" || showType === "both" ? appointments : []),
        ...(showType === "availability" || showType === "both" ? filteredAvailability : [])
    ];

    const handleConnectGoogleCalendar = async () => {
        try {
            setIsConnecting(true);
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

            // First, check if we're handling a callback
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (code) {
                // Handle the OAuth callback
                const response = await fetch(`${backendUrl}/api/therapist/google-calendar-callback?code=${code}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'ttoken': localStorage.getItem('dToken')
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to complete Google Calendar connection');
                }

                const data = await response.json();
                if (data.success) {
                    alert('Successfully connected to Google Calendar!');
                    // Remove the code from URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else {
                    throw new Error(data.message || 'Failed to connect to Google Calendar');
                }
            } else {
                // Initiate the OAuth flow
                const response = await fetch(`${backendUrl}/api/therapist/connect-google-calendar`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'ttoken': localStorage.getItem('dToken')
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to get Google Calendar connection URL');
                }

                const data = await response.json();
                if (data.success && data.authUrl) {
                    // Redirect to Google's OAuth page
                    window.location.href = data.authUrl;
                } else {
                    throw new Error('Failed to get Google Calendar connection URL');
                }
            }
        } catch (error) {
            console.error('Error connecting to Google Calendar:', error);
            alert(error.message || 'Failed to connect to Google Calendar. Please try again.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleGoogleCalendarSync = async () => {
        try {
            setIsSyncing(true);

            // Format events for Google Calendar
            const eventsToSync = mergedEvents.map(event => {
                // Ensure StartTime and EndTime are Date objects
                const startTime = event.StartTime instanceof Date ? event.StartTime : new Date(event.StartTime);
                const endTime = event.EndTime instanceof Date ? event.EndTime : new Date(event.EndTime);

                return {
                    summary: event.Subject,
                    start: {
                        dateTime: startTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                    end: {
                        dateTime: endTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                    description: `Type: ${event.Type}`,
                    colorId: event.Type === "Availability" ? "5" : "1" // Different colors for different types
                };
            });

            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/therapist/sync-google-calendar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ttoken': localStorage.getItem('dToken')
                },
                body: JSON.stringify({ events: eventsToSync })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.message === 'Google Calendar not connected. Please connect your Google Calendar first.') {
                    // If calendar is not connected, show connection button
                    return handleConnectGoogleCalendar();
                }
                throw new Error(errorData.message || 'Failed to sync with Google Calendar');
            }

            const data = await response.json();
            if (data.success) {
                alert('Successfully synced with Google Calendar!');
            } else {
                throw new Error(data.message || 'Failed to sync with Google Calendar');
            }
        } catch (error) {
            console.error('Error syncing with Google Calendar:', error);
            alert(error.message || 'Failed to sync with Google Calendar. Please try again.');
        } finally {
            setIsSyncing(false);
        }
    };

    if (!dashData || Object.keys(dashData).length === 0) {
        return <p>Loading schedule data...</p>;
    }

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <div className="flex mt-10 justify-between items-center mb-4">
                <h2 className="text-xl p-l-4 font-semibold">Therapist Schedule</h2>
                {/* <button
                    onClick={handleGoogleCalendarSync}
                    disabled={isSyncing || isConnecting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-normal ${isSyncing || isConnecting
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-[#5F6FFF] text-white shadow-md hover:bg-[#4C5AE3]'
                        }`}
                >
                    <Calendar className="w-5 h-5" />
                    {isSyncing ? 'Syncing...' : isConnecting ? 'Connecting...' : 'Sync with Google Calendar'}
                </button> */}
            </div>

            {/* ✅ Toggle Buttons */}
            <div className="flex gap-3 mb-6">
                <button
                    className={`px-4 py-2 rounded-lg transition font-normal ${showType === 'both'
                        ? 'bg-[#5F6FFF] text-white shadow-md hover:bg-[#4C5AE3]'
                        : 'bg-white text-gray-800 border-2 border-[#5F6FFF] hover:shadow-md'
                        }`}
                    onClick={() => setShowType('both')}
                >
                    Both
                </button>
                <button
                    className={`px-4 py-2 rounded-lg transition font-normal ${showType === 'appointments'
                        ? 'bg-[#5F6FFF] text-white shadow-md hover:bg-[#4C5AE3]'
                        : 'bg-white text-gray-800 border-2 border-[#5F6FFF] hover:shadow-md'
                        }`}
                    onClick={() => setShowType('appointments')}
                >
                    Appointments
                </button>
                <button
                    className={`px-4 py-2 rounded-lg transition font-normal ${showType === 'availability'
                        ? 'bg-[#5F6FFF] text-white shadow-md hover:bg-[#4C5AE3]'
                        : 'bg-white text-gray-800 border-2 border-[#5F6FFF] hover:shadow-md'
                        }`}
                    onClick={() => setShowType('availability')}
                >
                    My Availability
                </button>
            </div>

            <ScheduleComponent
                height="650px"
                selectedDate={new Date()}
                eventSettings={{
                    dataSource: mergedEvents,
                    allowAdding: false,
                    allowEditing: false,
                    allowDeleting: false
                }}
                readonly={true}
                eventRendered={(args) => {
                    if (args.data.Type === "Availability") {
                        args.element.style.opacity = "0.7";
                    }
                }}
            >
                <ViewsDirective>
                    <ViewDirective option="Day" />
                    <ViewDirective option="Week" />
                    <ViewDirective option="WorkWeek" />
                    <ViewDirective option="Month" />
                    <ViewDirective option="Agenda" />
                </ViewsDirective>
                <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
            </ScheduleComponent>
        </div>
    );
};

export default TherapistSchedule;