import React, { useContext, useEffect, useState, useMemo } from 'react';
import { TherapistContext } from '../../context/TherapistContext';

const OnlineLinkUpload = () => {
  const { tToken, appointments, fetchAppointments, updateMeetingLink } = useContext(TherapistContext);
  const [meetingLinks, setMeetingLinks] = useState({});
  const [confirmed, setConfirmed] = useState({});
  const [filter, setFilter] = useState('current');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, newLink: '' });

  useEffect(() => {
    if (tToken) fetchAppointments();
  }, [tToken]);

  const handleMeetingLinkChange = (id, newLink) => {
    setMeetingLinks((prev) => ({ ...prev, [id]: newLink }));
    setConfirmed((prev) => ({ ...prev, [id]: false }));
  };

  const openConfirmModal = (id, newLink) => {
    setConfirmModal({ open: true, id, newLink });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, id: null, newLink: '' });
    setShowPopup(false);
  };

  const confirmChange = async () => {
    await updateMeetingLink(confirmModal.id, confirmModal.newLink);
    setConfirmed((prev) => ({ ...prev, [confirmModal.id]: true }));
    closeConfirmModal();
  };

  const formatTimeRange = (startTime) => {
    // Convert to 24-hour format
    const [time, modifier] = startTime.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
  
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
  
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0);
  
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);
  
    // Format helper
    const formatTo12Hour = (date) => {
      let hrs = date.getHours();
      const mins = date.getMinutes().toString().padStart(2, '0');
      const suffix = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12 || 12;
      return `${hrs}:${mins} ${suffix}`;
    };
  
    return `${formatTo12Hour(startDate)} - ${formatTo12Hour(endDate)}`;
  };
  function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "PM" && hours !== "12") hours = String(Number(hours) + 12);
    if (modifier === "AM" && hours === "12") hours = "00";
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
  }
  const filteredAppointments = Array.isArray(appointments[filter])
  ? appointments[filter].filter(app => {
      const fullDateTime = new Date(`${app.date}T${convertTo24Hour(app.time)}`);
      const now = new Date();
      const isOnline = app.type?.toLowerCase() === 'online';
      const cleanedMeetingLink = (app.meetingLink || '').trim();
      const hasMeetingLink = cleanedMeetingLink.length > 0;
      const isFuture = fullDateTime > now;
      const isRequestToModify = app.modifyRequest === true;

      if (filter === 'current') {
        // Show appointments that are online, upcoming, and either:
        // 1. Don't have a meeting link
        // 2. Or have a request to modify the link
        return (
          isOnline &&
          app.status === 'upcoming' &&
          (!hasMeetingLink || isRequestToModify)
        );
      }

      if (filter === 'all') {
        // Show appointments that are online, in the future,
        // have a meeting link, and no modify request pending
        return (
          isOnline &&
          isFuture &&
          hasMeetingLink &&
          !isRequestToModify
        );
      }

      return false;
    })
  : [];
  console.log("Filtered Appointments:", filteredAppointments);
 

  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      let aValue = new Date(`${a.date}T${convertTo24Hour(a.time)}`);
      let bValue = new Date(`${b.date}T${convertTo24Hour(b.time)}`);
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAppointments, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedAppointment(null);
  };
  return (
    <div className="w-full max-w-full px-8">
      <h2 className="text-lg font-bold mt-4 mb-2">Online Appointments</h2>
      <p className='font-small font-light text-sm pb-5'>Please upload the meeting links for your scheduled appointments before the appointment date, so your clients can join on time.</p>

      <div className="flex gap-4 mb-4">
        <button className={`p-2 border rounded ${filter === 'current' ? 'bg-primary text-white' : ''}`} onClick={() => setFilter('current')}>Links To Be Added</button>
        <button className={`p-2 border rounded ${filter === 'all' ? 'bg-primary text-white' : ''}`} onClick={() => setFilter('all')}>Added Links</button>
      </div>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="grid grid-cols-5 gap-4 py-3 px-6 border-b font-medium text-center">
          <p onClick={() => handleSort('client')} className="cursor-pointer">Client {sortConfig.key === 'client' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</p>
          <p onClick={() => handleSort('date')} className="cursor-pointer">Date {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</p>
          <p>Time</p>
          <p>Meeting Link</p>
          <p>Status</p>
        </div>

        {sortedAppointments.map((appointment) => (
          <div key={appointment.id} className="grid grid-cols-5 gap-4 py-3 px-6 border-b text-center items-center">
            <p>{appointment.client}</p>
            <p>{appointment.date}</p>
            <p>{formatTimeRange(appointment.time)}</p>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={meetingLinks[appointment.id] || appointment.meetingLink || ''}
                onChange={(e) => handleMeetingLinkChange(appointment.id, e.target.value)}
                disabled={appointment.status !== 'upcoming'}
                className={`border p-2 w-full rounded-md text-gray-700 ${appointment.status !== 'upcoming' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              <button
                onClick={() => openConfirmModal(appointment.id, meetingLinks[appointment.id])}
                disabled={!meetingLinks[appointment.id] || meetingLinks[appointment.id] === appointment.meetingLink}
                className={`w-9 h-9 rounded-md ${confirmed[appointment.id]
                  ? 'bg-[#5FCB9F] text-white'
                  : !meetingLinks[appointment.id] || meetingLinks[appointment.id] === appointment.meetingLink
                  ? 'bg-gray-400 text-white cursor-not-allowed' // Disabled button styling
                  : 'bg-[#b3baf6] text-white hover:bg-[#4E5CE8]'} transition-all`}
              >
                {confirmed[appointment.id] ? '✔' : '✓'}
              </button>
            </div>

            <p className={`capitalize ${appointment.status === 'completed' ? 'text-green-600' : appointment.status === 'cancelled' ? 'text-red-600' : 'text-yellow-500'}`}>{appointment.status}</p>
          </div>
        ))}
      </div>

      {confirmModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-8 w-96 rounded-lg shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Confirm Change</h3>
            <p className="text-gray-700 mb-2">Are you sure you want to update the meeting link to:</p>
            <p className="font-bold text-primary bg-gray-100 p-2 rounded break-all mb-8">{confirmModal.newLink}</p>
            <div className="flex justify-end gap-4">
              <button onClick={closeConfirmModal} className="px-4 py-2 bg-gray-300 rounded-lg text-gray-800 hover:bg-gray-400 transition">Cancel</button>
              <button onClick={confirmChange} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#4C5AE3] transition-all shadow-md">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineLinkUpload;
