import React from 'react'
import { useContext } from 'react'
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
import { TherapistContext } from '../../context/TherapistContext';
import { FaCalendarCheck, FaClipboardList, FaStar, FaDollarSign } from "react-icons/fa";
import { ScheduleComponent, ViewsDirective, ViewDirective, Inject, Agenda } from '@syncfusion/ej2-react-schedule';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, CartesianGrid } from 'recharts';

// ✅ Import Syncfusion Styles
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-react-schedule/styles/material.css';
const TherapistDashboard = () => {

    const { dashData, getDashData } = useContext(TherapistContext);

    if (!dashData || Object.keys(dashData).length === 0) {
  return <p>Loading dashboard data...</p>;
}
const [cancellationBreakdown, setCancellationBreakdown] = useState([
  { name: "Client Cancellations", value: 0 },
  { name: "Therapist Cancellations", value: 0 },
]);

const navigate = useNavigate();
const COLORS = ["#1E3A8A", "#4C5AE3"];


      // Card Data
      const cardData = [
        { 
          label: "Active Appointments", 
          value: dashData?.stats?.activeAppointments || 0, 
          icon: <FaCalendarCheck className="text-white w-6 h-6" />, 
          bg: "bg-[#1E3A8A]", 
        },
        { 
          label: "Monthly Earnings", 
          value: dashData?.stats?.formattedEarnings || "$0.00", 
          icon: <FaDollarSign className="text-white w-6 h-6" />, 
          bg: "bg-[#3758A6]", 
        },
        { 
          label: "Total Appointments", 
          value: dashData?.stats?.totalAppointments || 0, 
          icon: <FaClipboardList className="text-white w-6 h-6" />, 
          bg: "bg-[#4F75C2]", 
        },
        { 
          label: "Your Average Rating", 
          value: dashData?.stats?.avgRating || "N/A", 
          icon: <FaStar className="text-white w-6 h-6" />, 
          bg: "bg-[#7DA4E6]", 
        },
      ];


      useEffect(() => {
        if (dashData?.cancellationBreakdown) {
          setCancellationBreakdown(dashData.cancellationBreakdown);
        }
      }, [dashData]);

    useEffect(() => {
        getDashData();  // Fetch data when component mounts
    }, []);
    const [appointments, setAppointments] = useState([]);

useEffect(() => {
    if (dashData?.formattedAppointments?.length > 0) {
        setAppointments(dashData.formattedAppointments);
    }
}, [dashData.formattedAppointments]);

    console.log("dashData:", dashData);
    console.log("Earnings Data:", dashData?.earningsData);
    console.log(dashData?.formattedAppointments);
    console.log("Formatted Appointments:", dashData?.formattedAppointments);
console.log("Data Source is:", dashData?.formattedAppointments || []);
  
    return (
        <div className='w-full max-w-full px-8 pt-5'>
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cardData.map((card, index) => (
              <div key={index} className={`shadow-xl rounded-xl p-6 flex flex-col items-center justify-center ${card.bg} transition-all transform hover:scale-105 hover:shadow-2xl`} >
                <div className="w-12 h-12 flex items-center justify-center bg-white bg-opacity-20 rounded-full shadow-md mb-3">
                  {card.icon}
                </div>
                <h3 className="text-md font-semibold text-white mb-1">{card.label}</h3>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Earnings Chart */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Earnings Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashData?.earningsData ?? []} margin={{ top: 20, right: 50, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="1 1" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `Rs.${value / 1000}k`} />
                <Tooltip formatter={(value) => `Rs.${value}`} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#E3165B" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="online" stroke="#1E3A8A" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="inPerson" stroke="#4C5AE3" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Today's Schedule */}
          <div className="p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-lg font-semibold mb-1">Today's Schedule</h3>
            <div className="max-h-80 overflow-y-auto">
                      <ScheduleComponent
                        height="auto"
                        selectedDate={new Date()}
                        eventSettings={{ dataSource: appointments }}
                        currentView='Agenda'>
                        <ViewsDirective>
                          <ViewDirective option="Agenda" />
                        </ViewsDirective>
                        <Inject services={[Agenda]} />
                      </ScheduleComponent>
            </div>
          </div>

            {/* Ongoing Clients (Full Width Below) */}
            <div className="p-6 bg-white shadow-lg rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Ongoing Clients</h3>
                <div className="max-h-80 overflow-y-auto space-y-4">
                {(dashData?.ongoingClients ?? []).length > 0 ? (
                    (dashData?.ongoingClients ?? []).map((client) => (
                        <div 
                            key={client.id} 
                            className="p-4 bg-gray-100 rounded-lg shadow flex items-center justify-between cursor-pointer hover:bg-gray-200 transition"
                            onClick={() => navigate(`/client-note/${client.clientId}`)}
                        >
                            <div>
                                <h4 className="text-md font-semibold">{client.client}</h4>
                                <p className="text-sm text-gray-600">Last Appointment: {client.date}</p>
                                <span
                                    className={`inline-block text-xs font-medium px-2 py-1 rounded-lg 
                                        ${client.status === "ongoing" ? "bg-blue-200 text-blue-700" : "bg-yellow-200 text-yellow-700"}`}
                                >
                                    {client.status}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No ongoing clients at the moment.</p>
                )}
                </div>
            </div>

            {/* New Clients Gained Chart */}
            <div className="p-6 bg-white shadow-lg rounded-lg">
                <h3 className="text-lg font-semibold mb-4">New Clients Gained</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dashData?.newClientsData ?? []} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} Clients`} />
                    <Legend />
                    <Bar dataKey="newClients" fill="#4C5AE3" name="New Clients" barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {/* Pie Chart */}
            <div className="p-6 bg-white shadow-lg rounded-lg flex items-center">
                <div className="w-1/2 flex justify-center p-5">
                    <PieChart width={200} height={250}>
                    <Pie
                        data={cancellationBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                    >
                        {cancellationBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    </PieChart>
                </div>
                <div className="w-1/2 text-left space-y-2">
                    <h3 className="text-lg font-semibold">Cancellations Breakdown</h3>
                    <p className="font-bold text-gray-700">Total: {cancellationBreakdown.reduce((sum, entry) => sum + entry.value, 0)}</p>
                    <p className="text-gray-600">Client Cancellations: {cancellationBreakdown[0]?.value || 0}</p>
                    <p className="text-gray-600">Therapist Cancellations: {cancellationBreakdown[1]?.value || 0}</p>
                </div>
            </div>

            {/* Bookings Chart */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Booking Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashData?.bookingTrendsData ?? []} margin={{ top: 20, right: 50, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="1 1" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#E3165B" strokeWidth={3} dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="online" stroke="#1E3A8A" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="inPerson" stroke="#4C5AE3" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
        </div>
          
        </div>
      );
  };

export default TherapistDashboard
