import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import { CalendarCheck, XCircle, ClipboardList, Star } from "lucide-react";
import { TherapistContext } from '../../context/TherapistContext';
import { FaCalendarCheck, FaClipboardList, FaStar, FaDollarSign, FaDownload } from "react-icons/fa";
import { ScheduleComponent, ViewsDirective, ViewDirective, Inject, Agenda } from '@syncfusion/ej2-react-schedule';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, CartesianGrid } from 'recharts';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const { dToken, appointments, fetchAppointments, cancelAppointment, updateMeetingLink, dashData, getDashData, fetchAnalytics } = useContext(TherapistContext);
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
  const [activeTab, setActiveTab] = useState("appointments");
  const [analytics, setAnalytics] = useState(null);
  const [reportType, setReportType] = useState('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const reportTableRef = useRef(null);
  const [selectedReportTypes, setSelectedReportTypes] = useState(['all']);

  // Extract data
  const activeAppointments = appointments?.current?.length || 0;
  const totalAppointments = appointments?.all?.length || 0;
  const cancelledAppointments = appointments?.all?.filter(app => app.status === "cancelled")?.length || 0;
  const [cancellationBreakdown, setCancellationBreakdown] = useState([
    { name: "Client Cancellations", value: 0 },
    { name: "Therapist Cancellations", value: 0 },
  ]);

  const reportOptions = [
    { value: 'all', label: 'All Appointments' },
    { value: 'current', label: 'Current Appointments' },
    { value: 'past', label: 'Past Appointments' },
    { value: 'cancelled', label: 'Cancelled Appointments' },
    { value: 'pastNoCancelled', label: 'Past Appointments (No Cancelled)' },
  ];

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

  useEffect(() => {
    // Fetch analytics when dashboard loads
    fetchAnalytics().then(setAnalytics);
  }, []);

  const COLORS = ["#1E3A8A", "#4C5AE3"];
  const pageTopRef = useRef(null);
  const reportRef = useRef(null);

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
    // { label: "Booking ID", key: "id" },
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

  const handleDownloadPDF = async () => {
    // Render charts for PDF
    // (You may need to use React Portals or render the charts in the hidden divs above)

    // Wait a tick for charts to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    const input = reportRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("appointments-dashboard-report.pdf");
  };

  const getReportData = () => {
    switch (reportType) {
      case 'current':
        return appointments.current;
      case 'past':
        return appointments.past;
      case 'cancelled':
        return appointments.all.filter(app => app.status === 'cancelled');
      case 'pastNoCancelled':
        return appointments.past.filter(app => app.status !== 'cancelled');
      default:
        return appointments.all;
    }
  };

  const handleDownloadReport = async () => {
    setShowReportModal(false);
    // Show the hidden report, render, then hide
    const reportDiv = reportTableRef.current;
    if (!reportDiv) return;
    reportDiv.style.display = 'block';
    await new Promise(r => setTimeout(r, 200)); // Wait for render
    const canvas = await html2canvas(reportDiv, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Paginate if content is taller than one page
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();
    while (position < pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight);
      position += pageHeight;
      if (position < pdfHeight) pdf.addPage();
    }
    pdf.save(`appointments-report-${reportType}.pdf`);
    reportDiv.style.display = 'none';
  };

  const handleReportTypeChange = (value) => {
    setSelectedReportTypes(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex mt-2 justify-between items-center mb-8">
          <div className="flex gap-2 bg-white rounded-xl shadow p-2">
            <button
              className={`px-6 py-2 rounded-lg font-semibold transition ${activeTab === "appointments" ? "bg-indigo-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("appointments")}
            >
              Appointments
            </button>
            <button
              className={`px-6 py-2 rounded-lg font-semibold transition ${activeTab === "dashboard" ? "bg-indigo-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              Session Analytics
            </button>
          </div>
          {activeTab === "dashboard" && (
            <button
              className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
              onClick={handleDownloadPDF}
            >
              Download PDF Report
            </button>
          )}
        </div>

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="bg-white shadow-lg rounded-2xl p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-extrabold text-[#6366F1] pt-2 pb-4">All Appointments</h2>
              <div className="flex gap-2 items-center">
                <button
                  className="flex items-center gap-2 px-4 py-2  text-white rounded shadow bg-indigo-600 hover:bg-[#6366F1]/90 transition"
                  onClick={() => setShowReportModal(true)}
                >
                  <FaDownload /> Download Report
                </button>
              </div>
            </div>
            {/* Filter Tabs */}
            <div className='flex flex-row items-start gap-5 mb-4'>
              <div className='flex gap-4 text-sm text-gray-600'>
                <p
                  className={`pl-3 py-1.5 pr-16 border rounded cursor-pointer transition-all ${filter === 'current' ? 'bg-[#6366F1] text-white' : ''}`}
                  onClick={() => handleFilterChange('current')}
                >Current Appointments</p>
                <p
                  className={`pl-3 py-1.5 pr-16 border rounded cursor-pointer transition-all ${filter === 'past' ? 'bg-[#6366F1] text-white' : ''}`}
                  onClick={() => handleFilterChange('past')}
                >Past Appointments</p>
                <p
                  className={`pl-3 py-1.5 pr-16 border rounded cursor-pointer transition-all ${filter === 'all' ? 'bg-[#6366F1] text-white' : ''}`}
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
              <div className='grid grid-cols-6 gap-4 py-3 px-6 border-b font-medium text-center'>
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
                <div className={`grid grid-cols-6 gap-4 py-3 px-6  border-b text-gray-500 text-center  ${sortedAppointments.length > 6 ? 'max-h-[80vh] overflow-y-auto' : ''}`} key={index}>
                  {/* <p>{item.id}</p> */}
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
                            className="px-3 py-1.5 rounded bg-[#6366F1] text-white hover:opacity-90 transition"
                            onClick={() => handleViewRating(item)}
                          >
                            View Session Ratings
                          </button>
                        );
                      }

                      // If it's upcoming and not cancelled
                      return (
                        <button
                          className="px-3 py-1.5 rounded bg-[#6366F1] text-white hover:opacity-90 transition"
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
                    <h2 className="text-lg font-semibold text-[#6366F1] mb-3">Modify Appointment</h2>

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
                          className="text-sm bg-[#6366F1] text-white px-4 py-2 rounded hover:opacity-90 transition"
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
            {/* Report Type Modal */}
            {showReportModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowReportModal(false)}>
                <div className="bg-white rounded-2xl shadow-2xl p-10 min-w-[340px] max-w-[95vw] relative flex flex-col items-center"
                  onClick={e => e.stopPropagation()}>
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl" onClick={() => setShowReportModal(false)}>&times;</button>
                  <h3 className="text-2xl font-extrabold mb-6 text-[#6366F1] text-center">Select Report Type(s)</h3>
                  <div className="flex flex-col gap-4 mb-8">
                    {reportOptions.map(opt => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-4 py-2 px-2 rounded-lg hover:bg-[#6366F1]/50 transition cursor-pointer"
                        style={{ fontSize: '1.15rem', fontWeight: 500 }}
                      >
                        <input
                          type="checkbox"
                          value={opt.value}
                          checked={selectedReportTypes.includes(opt.value)}
                          onChange={() => handleReportTypeChange(opt.value)}
                          className="w-5 h-5 accent-[#6366F1]"
                        />
                        <span className="text-gray-800">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    className="w-full py-3 bg-indigo-600 hover:bg-[#6366F1]/90 text-white rounded-xl font-bold text-lg shadow-lg  transition"
                    style={{ fontSize: '1.2rem', marginTop: 12 }}
                    onClick={handleDownloadReport}
                  >
                    Download PDF{selectedReportTypes.length > 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            )}
            {/* Hidden printable report */}
            <div ref={reportTableRef} style={{ display: 'none' }}>
              <div style={{ padding: 32, fontFamily: 'Arial, sans-serif', background: '#fff', minWidth: 900 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                  <img src="/logo192.png" alt="Logo" style={{ height: 48, marginRight: 16 }} />
                  <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1E3A8A', margin: 0 }}>Appointments Report</h1>
                    <div style={{ fontSize: 16, color: '#4C5AE3', fontWeight: 600 }}>{
                      reportOptions.find(opt => opt.value === reportType)?.label || ''
                    }</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Generated: {new Date().toLocaleString()}</div>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#F7F8FA', color: '#1E3A8A', fontWeight: 700 }}>
                      <th style={{ padding: 10, border: '1px solid #E5E7EB' }}>Booking ID</th>
                      <th style={{ padding: 10, border: '1px solid #E5E7EB' }}>Client</th>
                      <th style={{ padding: 10, border: '1px solid #E5E7EB' }}>Type</th>
                      <th style={{ padding: 10, border: '1px solid #E5E7EB' }}>Date</th>
                      <th style={{ padding: 10, border: '1px solid #E5E7EB' }}>Time</th>
                      <th style={{ padding: 10, border: '1px solid #E5E7EB' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getReportData().map((item, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#F7F8FA' }}>
                        <td style={{ padding: 10, border: '1px solid #E5E7EB' }}>{item.id || item._id || ''}</td>
                        <td style={{ padding: 10, border: '1px solid #E5E7EB' }}>{item.client}</td>
                        <td style={{ padding: 10, border: '1px solid #E5E7EB' }}>{item.type}</td>
                        <td style={{ padding: 10, border: '1px solid #E5E7EB' }}>{item.date}</td>
                        <td style={{ padding: 10, border: '1px solid #E5E7EB' }}>{item.time}</td>
                        <td style={{ padding: 10, border: '1px solid #E5E7EB', color: item.status === 'cancelled' ? '#E3165B' : item.status === 'completed' ? '#22C55E' : '#4C5AE3', fontWeight: 600 }}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 32, fontSize: 12, color: '#888', textAlign: 'right' }}>
                  Mind Matters &copy; {new Date().getFullYear()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            <div ref={reportRef}>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {cardData.map((card, index) => (
                  <div
                    key={index}
                    className="relative group bg-gradient-to-br from-indigo-50 to-white shadow-lg rounded-2xl p-6 flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="absolute top-4 right-4 opacity-10 text-6xl pointer-events-none">{card.icon}</div>
                    <div className="w-14 h-14 flex items-center justify-center bg-indigo-100 rounded-full shadow mb-4">
                      {card.icon}
                    </div>
                    <h3 className="text-base font-semibold text-gray-700 mb-1">{card.label}</h3>
                    <p className="text-4xl font-extrabold text-indigo-700 mb-1">{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Booking Trends Chart */}
              <div className="bg-white shadow-lg rounded-2xl p-8 mb-10 min-h-[340px]">
                <div className="flex items-center mb-4">
                  <CalendarCheck className="text-indigo-500 w-6 h-6 mr-2" />
                  <h3 className="text-2xl font-extrabold text-indigo-700 ">Booking Trends</h3>
                </div>
                <ResponsiveContainer width="100%" height={260}>
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
              {/* --- AI Predictions Section --- */}
              <div className="bg-white shadow-lg rounded-2xl p-8 mb-10">
                <h3 className="text-2xl font-extrabold text-indigo-700 mb-8 flex items-center gap-2">
                  <span role="img" aria-label="AI">🤖</span> AI Predictions & Insights
                </h3>
                {!analytics ? (
                  <p className="text-lg text-gray-500">Loading predictions...</p>
                ) : (
                  <div className="space-y-10">
                    {/* Predicted Bookings Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-indigo-50 p-8 rounded-xl flex flex-col items-center justify-center">
                        <h4 className="font-bold text-xl text-gray-700 mb-4">Predicted Bookings Next Month</h4>
                        <p className="text-5xl font-extrabold text-primary mb-3">{analytics.predictedNextMonthAppointments}</p>
                        <p className="text-lg text-gray-500">Based on recent trends</p>
                      </div>
                      {/* Consecutive Sessions Card */}
                      <div className="bg-indigo-50 p-8 rounded-xl flex flex-col items-center justify-center">
                        <h4 className="font-bold text-xl text-gray-700 mb-4">Consecutive Sessions</h4>
                        <p className="text-5xl font-extrabold text-primary mb-3">{analytics.avgConsecutiveSessionsForNewClients?.toFixed(1) ?? '0'}</p>
                        <p className="text-lg text-gray-500">New clients have about {analytics.avgConsecutiveSessionsForNewClients?.toFixed(1) ?? '0'} sessions in a row</p>
                      </div>
                    </div>

                    {/* Cancellation Predictions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h4 className="font-bold text-xl text-gray-700 mb-2">Rebook After Cancel Rate</h4>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center">
                            <span className="text-xl font-extrabold text-primary">
                              {analytics.rebookAfterCancelRate ? (analytics.rebookAfterCancelRate * 100).toFixed(0) : '0'}%
                            </span>
                          </div>
                          <p className="text-lg text-gray-600">
                            of clients who cancel rebook within 30 days
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h4 className="font-bold text-xl text-gray-700 mb-2">Predicted Cancellation Rate</h4>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center">
                            <span className="text-xl font-extrabold text-red-500">
                              {analytics.predictedCancellations ? (analytics.predictedCancellations * 100).toFixed(0) : '0'}%
                            </span>
                          </div>
                          <p className="text-lg text-gray-600">
                            expected cancellation rate for next month
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Avg Days Between Sessions Card */}
                    <div className="bg-gray-50 p-8 rounded-xl flex flex-col items-center justify-center">
                      <h4 className="font-bold text-xl text-gray-700 mb-3">Average Days Between Sessions</h4>
                      <p className="text-5xl font-extrabold text-primary mb-2">{analytics.avgSessionInterval?.toFixed(0) ?? '0'} days</p>
                      <p className="text-lg text-gray-500">On average, clients wait this long between sessions</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cancellations Breakdown Pie Chart */}
              <div className="bg-white shadow-lg rounded-2xl p-8 mb-10 min-h-[340px] flex flex-col items-center border border-indigo-100">
                <div className="flex items-center mb-2">
                  <XCircle className="text-indigo-500 w-6 h-6 mr-2" />
                  <h3 className="text-2xl font-extrabold text-indigo-700">Cancellations Breakdown</h3>
                </div>
                <p className="text-lg text-gray-500 mb-4">See who cancelled sessions this month</p>
                <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-center">
                  <PieChart width={180} height={180}>
                    <Pie
                      data={cancellationBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      label
                    >
                      {cancellationBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                  <div className="flex flex-col justify-center items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full" style={{ background: COLORS[0] }}></span>
                      <span className="text-gray-700 font-medium">Client Cancellations: {cancellationBreakdown[0]?.value || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full" style={{ background: COLORS[1] }}></span>
                      <span className="text-gray-700 font-medium">Therapist Cancellations: {cancellationBreakdown[1]?.value || 0}</span>
                    </div>
                    <div className="mt-4 font-bold text-indigo-700">Total: {cancellationBreakdown.reduce((sum, entry) => sum + entry.value, 0)}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500 text-lg text-center w-full">
                  <span>
                    Most cancellations this month were by <b>{cancellationBreakdown[0]?.value >= cancellationBreakdown[1]?.value ? 'clients' : 'therapists'}</b>.
                  </span>
                </div>
              </div>


            </div>
          </>
        )}
      </div>
    </div>
  );

};

export default TherapistAppointments
