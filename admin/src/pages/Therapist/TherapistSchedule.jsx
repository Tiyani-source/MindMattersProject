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

    if (!dashData || Object.keys(dashData).length === 0) {
        return <p>Loading schedule data...</p>;
    }

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <h2 className="text-xl font-semibold mb-4">Therapist Schedule</h2>

            {/* ✅ Toggle Buttons */}
            <div className="flex gap-3 mb-6">
            <button
                className={`px-4 py-2 rounded-lg transition font-normal ${
                    showType === 'both'
                    ? 'bg-[#5F6FFF] text-white shadow-md hover:bg-[#4C5AE3]'
                    : 'bg-white text-gray-800 border-2 border-[#5F6FFF] hover:shadow-md'
                }`}
                onClick={() => setShowType('both')}
                >
                Both
                </button>
                            <button
                className={`px-4 py-2 rounded-lg transition font-normal ${
                    showType === 'appointments'
                    ? 'bg-[#5F6FFF] text-white shadow-md hover:bg-[#4C5AE3]'
                    : 'bg-white text-gray-800 border-2 border-[#5F6FFF] hover:shadow-md'
                }`}
                onClick={() => setShowType('appointments')}
                >
                Appointments
                </button>

                <button
                className={`px-4 py-2 rounded-lg transition font-normal ${
                    showType === 'availability'
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