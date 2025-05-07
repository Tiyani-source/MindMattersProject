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
    <div className="w-full  max-w-full px-8">
      <h2 className="text-2xl  font-extrabold mt-20 mb-2 text-indigo-700 tracking-tight">Online Appointments</h2>
      <p className='font-small font-light text-base pb-6 text-gray-500'>Please upload the meeting links for your scheduled appointments before the appointment date, so your clients can join on time.</p>

      <div className="flex gap-4 mb-6">
        <button className={`px-6 py-2 rounded-full font-semibold transition-all shadow-sm border-2 ${filter === 'current' ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-indigo-500 scale-105' : 'bg-white text-indigo-500 border-indigo-200 hover:bg-indigo-50'}`} onClick={() => setFilter('current')}>Links To Be Added</button>
        <button className={`px-6 py-2 rounded-full font-semibold transition-all shadow-sm border-2 ${filter === 'all' ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-indigo-500 scale-105' : 'bg-white text-indigo-500 border-indigo-200 hover:bg-indigo-50'}`} onClick={() => setFilter('all')}>Added Links</button>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 text-base max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-5 gap-4 py-4 px-8 border-b font-bold text-indigo-700 text-center text-lg">
          <p onClick={() => handleSort('client')} className="cursor-pointer select-none">Client {sortConfig.key === 'client' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</p>
          <p onClick={() => handleSort('date')} className="cursor-pointer select-none">Date {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</p>
          <p>Time</p>
          <p>Meeting Link</p>
          <p>Status</p>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-indigo-200">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="#EEF2FF" /><path d="M7 10h10M7 14h6" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" /></svg>
            <p className="mt-4 text-lg font-medium">No appointments found.</p>
          </div>
        ) : (
          sortedAppointments.map((appointment, idx) => (
            <div key={appointment.id} className={`grid grid-cols-5 gap-4 py-4 px-8 text-center items-center transition-all ${idx % 2 === 0 ? 'bg-indigo-50/40' : 'bg-white'} hover:bg-indigo-50/80`}>
              <p className="font-medium text-gray-700">{appointment.client}</p>
              <p className="text-gray-600">{appointment.date}</p>
              <p className="text-gray-600">{formatTimeRange(appointment.time)}</p>

              <div className="flex items-center gap-3 justify-center">
                <input
                  type="text"
                  value={meetingLinks[appointment.id] || appointment.meetingLink || ''}
                  onChange={(e) => handleMeetingLinkChange(appointment.id, e.target.value)}
                  disabled={appointment.status !== 'upcoming'}
                  className={`border p-2 w-full rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-200 transition ${appointment.status !== 'upcoming' ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                  placeholder="Paste meeting link..."
                />
                <button
                  onClick={() => openConfirmModal(appointment.id, meetingLinks[appointment.id])}
                  disabled={!meetingLinks[appointment.id] || meetingLinks[appointment.id] === appointment.meetingLink}
                  className={`w-10 h-10 flex items-center justify-center rounded-full shadow transition-all border-2 ${confirmed[appointment.id]
                    ? 'bg-green-400 text-white border-green-400'
                    : !meetingLinks[appointment.id] || meetingLinks[appointment.id] === appointment.meetingLink
                      ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white border-indigo-400 hover:scale-110 hover:shadow-lg'} group`}
                  title={confirmed[appointment.id] ? 'Link Confirmed' : 'Confirm Link'}
                >
                  {confirmed[appointment.id] ? (
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#5FCB9F" /><path d="M8 12.5l2.5 2.5L16 9.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                  ) : (
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#b3baf6" /><path d="M8 12.5l2.5 2.5L16 9.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center">
                {appointment.status === 'completed' && <span className="flex items-center gap-1 text-green-600 font-semibold"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#D1FAE5" /><path d="M8 12.5l2.5 2.5L16 9.5" stroke="#059669" strokeWidth="2" strokeLinecap="round" /></svg>Completed</span>}
                {appointment.status === 'cancelled' && <span className="flex items-center gap-1 text-red-500 font-semibold"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FEE2E2" /><path d="M8 8l8 8M16 8l-8 8" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" /></svg>Cancelled</span>}
                {appointment.status === 'upcoming' && <span className="flex items-center gap-1 text-yellow-500 font-semibold"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FEF3C7" /><path d="M12 8v4l2 2" stroke="#D97706" strokeWidth="2" strokeLinecap="round" /></svg>Upcoming</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {confirmModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-8 w-96 rounded-2xl shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-indigo-700">Confirm Change</h3>
            <p className="text-gray-700 mb-2">Are you sure you want to update the meeting link to:</p>
            <p className="font-bold text-indigo-600 bg-indigo-50 p-3 rounded-xl break-all mb-8">{confirmModal.newLink}</p>
            <div className="flex justify-end gap-4">
              <button onClick={closeConfirmModal} className="px-5 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition font-semibold">Cancel</button>
              <button onClick={confirmChange} className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md font-semibold">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineLinkUpload;
