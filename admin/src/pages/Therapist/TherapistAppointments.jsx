import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import { CalendarCheck, XCircle, ClipboardList, Star } from "lucide-react";
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


const TherapistAppointments = () => {
  const { dToken, appointments, fetchAppointments, cancelAppointment, updateMeetingLink, dashData, getDashData } = useContext(TherapistContext);
  console.log('TherapistAppointments mounted with token:', dToken);
  console.log('Current appointments state:', appointments);
  console.log('Current dashData state:', dashData);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('current');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });
  const [formattedAppointments, setFormattedAppointments] = useState([]);

  // Extract data
  const activeAppointments = appointments?.current?.length || 0;
  const totalAppointments = appointments?.all?.length || 0;
  const cancelledAppointments = appointments?.all?.filter(app => app.status === "cancelled")?.length || 0;
  const [cancellationBreakdown, setCancellationBreakdown] = useState([
    { name: "Client Cancellations", value: 0 },
    { name: "Therapist Cancellations", value: 0 },
  ]);

  useEffect(() => {
    console.log('Initial useEffect running, calling getDashData');
    getDashData();
  }, []);

  useEffect(() => {
    console.log('Token useEffect running with token:', dToken);
    if (dToken) {
      console.log('Token present, calling fetchAppointments');
      fetchAppointments();
    } else {
      console.log('No token present, skipping fetchAppointments');
    }
  }, [dToken]);

  useEffect(() => {
    console.log('Appointments updated:', appointments);
  }, [appointments]);

  useEffect(() => {
    console.log('DashData updated:', dashData);
    if (dashData?.cancellationBreakdown) {
      console.log('Setting cancellation breakdown:', dashData.cancellationBreakdown);
      setCancellationBreakdown(dashData.cancellationBreakdown);
    }
  }, [dashData]);

  useEffect(() => {
    if (dashData?.formattedAppointments?.length > 0) {
      setFormattedAppointments(dashData.formattedAppointments);
    }
  }, [dashData.formattedAppointments]);

  const COLORS = ["#1E3A8A", "#4C5AE3"];
  const pageTopRef = useRef(null);

  const handleViewRating = (appointment) => {
    if (!appointment) return;

    setSelectedRating({
      client: appointment.client || "Unknown",
      rating: appointment.rating || null,
      review: appointment.review || null,
    });
    setShowRatingPopup(true);
  };

  const handleModifyAppointment = (appointment) => {
    console.log("Selected appointment:", appointment); // Add this
    setSelectedAppointment(appointment);
    setMeetingLink(appointment.meetingLink || '');
    setShowPopup(true);
  };

  const handleSaveMeetingLink = async () => {
    if (selectedAppointment && meetingLink !== selectedAppointment.meetingLink) {
      await updateMeetingLink(selectedAppointment.id, meetingLink);
    }
    setShowPopup(false);
  };

  const filteredAppointments = appointments[filter]?.filter(appointment =>
    appointment.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.date.includes(searchQuery)
  ) || [];

  function formatTo12Hour(timeStr) {
    if (!timeStr) return "N/A";

    // If it's already in AM/PM format, return as-is (and capitalize it)
    if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
      return timeStr.toUpperCase();
    }

    // Convert 24-hour format to 12-hour with capitalized AM/PM
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  }

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

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedAppointment(null);
  };

  // Calculate average rating
  const avgRating = useMemo(() => {
    const ratedAppointments = appointments.all.filter(app => app.rating !== null);
    if (ratedAppointments.length === 0) return "N/A";
    const totalRating = ratedAppointments.reduce((sum, app) => sum + app.rating, 0);
    return (totalRating / ratedAppointments.length).toFixed(1);
  }, [appointments.all]);
  const today = new Date().toISOString().split('T')[0];

  const cardData = [
    {
      label: "Active Appointments",
      value: activeAppointments,
      icon: <CalendarCheck className="text-[#1E3A8A] w-6 h-6" />,
      bg: "bg-[#1E3A8A]", // Darkest shade
      textColor: "text-white"
    },
    {
      label: "Cancelled This Month",
      value: cancelledAppointments,
      icon: <XCircle className="text-[#3758A6] w-6 h-6" />,
      bg: "bg-[#3758A6]", // Slightly lighter shade
      textColor: "text-white"
    },
    {
      label: "Total Appointments",
      value: totalAppointments,
      icon: <ClipboardList className="text-[#4F75C2] w-6 h-6" />,
      bg: "bg-[#4F75C2]", // Even lighter shade
      textColor: "text-white"
    },
    {
      label: "Your Average Rating",
      value: isNaN(avgRating) ? 'N/A' : avgRating,
      icon: <Star className="text-[#7DA4E6] w-6 h-6" />,
      bg: "bg-[#7DA4E6]", // Lightest shade
      textColor: "text-white"
    },
  ];
  const sortedAppointments = useMemo(() => {
    if (!filteredAppointments) return [];

    return [...filteredAppointments].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'date') {
        aValue = new Date(`${a.date}T${convertTo24Hour(a.time)}`);
        bValue = new Date(`${b.date}T${convertTo24Hour(b.time)}`);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAppointments, sortConfig]);
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  useEffect(() => {
    if (filter === 'current') {
      setSortConfig({ key: 'date', direction: 'asc' });
    } else if (filter === 'past') {
      setSortConfig({ key: 'date', direction: 'desc' });
    } else if (filter === 'all') {
      setSortConfig({ key: 'date', direction: 'desc' });
    }
  }, [filter]);
  const columns = [
    { label: "Booking ID", key: "id" },
    { label: "Client", key: "client" },
    { label: "Type", key: "type" },
    { label: "Date", key: "date" },
    { label: "Time", key: "time" },
    { label: "Status", key: "status" },
  ];
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const paginatedAppointments = sortedAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const tableRef = useRef(null);
  const handleFilterChange = (value) => {
    setFilter(value);
    setTimeout(() => {
      if (value === 'current') {
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Scroll to table section
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  };

  console.log("Booking Trends:", dashData.bookingTrendsData);
  console.log("New Clients:", dashData.newClientsData);
  console.log("Therapist Dashboard API Response", dashData);
  return (
    <div className='w-full max-w-full px-8 overflow-auto h-[calc(100vh-4rem)]'>
      <div ref={pageTopRef}></div>
      <p className='pb-3 text-lg font-medium'></p>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {cardData.map((card, index) => (
          <div
            key={index}
            className={`shadow-xl rounded-xl p-6 flex flex-col items-center justify-center ${card.bg} transition-all transform hover:scale-105 hover:shadow-2xl`}
          >
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md mb-3">
              {card.icon}
            </div>
            <h3 className='text-md font-semibold text-white mb-1'>{card.label}</h3>
            <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
        {/* New Clients Gained Chart */}
        <div className="p-8 bg-white shadow-lg rounded-lg flex flex-col ">
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
        <div className="p-6 bg-white  shadow-lg rounded-lg flex items-center">
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
      </div>

      <h2 className="text-lg font-bold pt-2 pb-4">All Appointments</h2>
      {/* Filter Tabs */}
      <div className='flex flex-row items-start gap-5 mb-4'>
        <div className='flex gap-4 text-sm text-gray-600'>

          <p

            className={`pl-3 py-1.5 pr-16 border rounded cursor-pointer transition-all ${filter === 'current' ? 'bg-primary text-white' : ''}`}
            onClick={() => handleFilterChange('current')}
          >Current Appointments</p>
          <p
            className={`pl-3 py-1.5 pr-16 border rounded cursor-pointer transition-all ${filter === 'past' ? 'bg-primary text-white' : ''}`}
            onClick={() => handleFilterChange('past')}
          >Past Appointments</p>
          <p
            className={`pl-3 py-1.5 pr-16 border rounded cursor-pointer transition-all ${filter === 'all' ? 'bg-primary text-white' : ''}`}
            onClick={() => handleFilterChange('all')}
          >All Appointments</p>
        </div>
      </div>

      {/* Search Bar */}
      <input
        type='text'
        placeholder='Search by date, client, or appointment ID'
        className='w-full p-2 mb-4 border rounded'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Appointments List */}
      <div ref={tableRef} className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>

        <div className='grid grid-cols-7 gap-4 py-3 px-6 border-b font-medium text-center'>
          {columns.map(({ label, key }) => (
            <p
              key={key}
              className="flex justify-center items-center gap-1 cursor-pointer"
              onClick={() => handleSort(key)}
            >
              {label}
              {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
            </p>
          ))}
          <p>Action</p>
        </div>
        {paginatedAppointments.map((item, index) => (
          <div className={`grid grid-cols-7 gap-4 py-3 px-6  border-b text-gray-500 text-center  ${sortedAppointments.length > 6 ? 'max-h-[80vh] overflow-y-auto' : ''}`} key={index}>
            <p>{item.id}</p>
            <p>{item.client}</p>
            <p>{item.type}</p>
            <p>{item.date}</p>
            <p>{formatTo12Hour(item.time)}</p>
            <p className={item.status === 'cancelled' ? 'text-red-400' : item.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </p>
            <p>
              {(() => {
                const fullDate = new Date(`${item.date}T${item.time}`);
                const now = new Date();

                const isPast = fullDate < now;
                const isCancelled = item.status === 'cancelled';
                const isCompleted = item.status === 'completed';

                if (isPast || isCancelled || isCompleted) {
                  return (
                    <button
                      className="px-3 py-1.5 rounded bg-primary text-white hover:opacity-90 transition"
                      onClick={() => handleViewRating(item)}
                    >
                      View Session Ratings
                    </button>
                  );
                }

                // If it's upcoming and not cancelled
                return (
                  <button
                    className="px-3 py-1.5 rounded bg-primary text-white hover:opacity-90 transition"
                    onClick={() => handleModifyAppointment(item)}
                  >
                    Modify Appointment
                  </button>
                );
              })()}
            </p>
          </div>
        ))}

        {showPopup && selectedAppointment && (
          <div
            className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50"
            onClick={handleClosePopup} // Close when clicking outside
          >
            <div
              className="bg-white p-6 rounded-lg shadow-lg w-96"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
            >
              <h2 className="text-lg font-semibold text-primary mb-3">Modify Appointment</h2>

              {/* Show Meeting Link only for Online Appointments */}
              {selectedAppointment.type === 'online' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Meeting Link:</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded text-sm text-gray-700"
                    placeholder="Enter or modify meeting link..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                </div>
              )}

              {/* Buttons Section */}
              <div className="flex flex-col gap-3">
                {/* Save Meeting Link Button */}
                {selectedAppointment.type === 'online' && (
                  <button
                    className="text-sm bg-primary text-white px-4 py-2 rounded hover:opacity-90 transition"
                    onClick={handleSaveMeetingLink}
                  >
                    Save Meeting Link
                  </button>
                )}

                {/* Cancel Appointment Button */}
                <button
                  className="text-sm text-red-600 border px-4 py-2 rounded hover:bg-red-100 transition"
                  onClick={() => cancelAppointment(selectedAppointment.id)}
                >
                  Cancel Appointment
                </button>

                {/* Close Button */}
                <button
                  className="text-sm text-gray-600 border px-4 py-2 rounded hover:bg-gray-200 transition"
                  onClick={handleClosePopup}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}


        {showRatingPopup && selectedRating && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowRatingPopup(false)} // Close when clicking outside
          >
            <div
              className="bg-white w-96 p-6 rounded-lg shadow-lg flex flex-col items-center text-center"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
            >
              <h2 className="text-lg font-bold">Session Rating</h2>
              <p className="mt-2 font-medium">Client: {selectedRating.client}</p>

              {/* Rating & Review Display */}
              {selectedRating.rating && selectedRating.review ? (
                <>
                  <p className="mt-2 text-xl">⭐ {selectedRating.rating}/5</p>
                  <p className="mt-2 italic">"{selectedRating.review}"</p>
                </>
              ) : (
                <p className="mt-2 text-gray-500">Client has not rated or left a review.</p>
              )}

              <button
                className="mt-4 px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setShowRatingPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center py-4 gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

};

export default TherapistAppointments
