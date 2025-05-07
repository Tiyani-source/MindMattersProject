import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MyAppointments = () => {
        const {
            appointments,
            getUserAppointments,
            confirmCancellation: cancelAppointment,
            handleViewMeetingClick: fetchMeetingLink
        } = useContext(AppContext);
    
        useEffect(() => {
            getUserAppointments();
        }, []);
    
        const [filter, setFilter] = useState('current');
        const [showPopup, setShowPopup] = useState(false);
        const [selectedAppointment, setSelectedAppointment] = useState(null);
        const [showMeetingPopup, setShowMeetingPopup] = useState(false);
        const [meetingLink, setMeetingLink] = useState('');
        const [requestMessage, setRequestMessage] = useState('');
        const [showMessageInput, setShowMessageInput] = useState(false);
        const [showReviewPopup, setShowReviewPopup] = useState(false);
        const [showRatingPopup, setShowRatingPopup] = useState(false);
        const [review, setReview] = useState('');
        const [rating, setRating] = useState(0);
    
        const navigate = useNavigate();
    

    const handleReviewClick = (appointment) => {
        setSelectedAppointment(appointment);
        setReview(appointment.review || '');
        setShowReviewPopup(true);
    };
    const handleRatingClick = (appointment) => {
        setSelectedAppointment(appointment);
        setRating(appointment.rating || 0);
        setShowRatingPopup(true);
    };
    const submitReview = () => {
        alert(`Review submitted: ${review}`);
        selectedAppointment.review = review;
        setShowReviewPopup(false);
    };
    
    const submitRating = () => {
        alert(`Rating submitted: ${rating} stars`);
        selectedAppointment.rating = rating;
        setShowRatingPopup(false);
    };
    // Generate test appointments dynamically
    const filteredAppointments = appointments.filter(app => {
        const isCancelled = app.statusOfAppointment === 'cancelled';
        if (isCancelled) return false;
      
        const appointmentDate = new Date(app.date);
        const today = new Date();
      
        // Only keep date parts
        const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];
      
        if (filter === 'current') {
          return appointmentDateStr >= todayStr;
        } else {
          return appointmentDateStr < todayStr;
        }
      });
    const handleCancelClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowPopup(true);
    };


    const confirmCancel = async () => {
        if (!selectedAppointment?._id) return;
        await cancelAppointment(selectedAppointment._id);
        setShowPopup(false);
      };
      const handleMeetingLink = async (appointmentId) => {
        const link = await fetchMeetingLink(appointmentId);
        if (link) {
          setMeetingLink(link);       // ✅ This is defined here
          setShowMeetingPopup(true);  // ✅ Also defined here
        }
      };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(meetingLink);
        alert('Meeting link copied to clipboard!');
    };

    const requestNewLink = () => {
        setShowMessageInput(true);
        setRequestMessage('');
    };

    const submitNewLinkRequest = () => {
        if (!requestMessage.trim()) {
            alert('Please enter a message before submitting.');
            return;
        }
        alert('New meeting link requested successfully.');
        setShowMessageInput(false);
        setRequestMessage('');
    };

    useEffect(() => {
        console.log("Appointments fetched:", appointments);
    }, [appointments]);

    return (
        <div>
            <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
            <div className="flex flex-row items-start gap-5 mt-5">
                <div className="flex gap-4 text-sm text-gray-600">
                    <p 
                        className={`pl-3 py-1.5 pr-16 border rounded cursor-pointer transition-all ${filter === 'current' ? 'bg-primary text-white' : ''}`} 
                        onClick={() => setFilter('current')}
                    >Current Appointments</p>
                    <p 
                        className={`pl-3 py-1.5 pr-16 border rounded cursor-pointer transition-all ${filter === 'past' ? 'bg-primary text-white' : ''}`} 
                        onClick={() => setFilter('past')}
                    >Past Appointments</p>
                </div>
            </div>
            
            {filteredAppointments.map((appointment) => {
    const therapist = appointment.therapistID;
    if (!therapist) return null;

    const appointmentDate = new Date(appointment.date);
    const todayStr = new Date().toISOString().split('T')[0];
    const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
    const isPast = appointmentDateStr < todayStr;

                if ((filter === 'current' && isPast) || (filter === 'past' && !isPast)) {
                    return null;
                }

                return (
                    <div key={appointment.id} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b'>
                        <div>
                            <img className='w-32 bg-indigo-50' src={therapist.image} alt={therapist.name} />
                        </div>
                        <div className='flex-1 text-sm text-zinc-600'>
                            <p className='text-neutral-800 font-semibold'>{therapist.name}</p>
                            <p>{therapist.speciality}</p>
                            <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium'>Type:</span> {appointment.typeOfAppointment === 'online' ? 'Online' : 'In-Person'}</p>
                            <p className='text-zinc-700 font-medium mt-1'>Address:</p>
                            <p className='text-xs'>{therapist.address.line1}</p>
                            <p className='text-xs'>{therapist.address.line2}</p>
                            <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {appointmentDate.toDateString()} | {appointment.timeSlot?.startTime}</p>
                
                        </div>
                        <div className='flex flex-col gap-2 justify-end'>
                            {isPast ? (
                                <>
                                {appointment.rating && (
                                    <p className='text-yellow-500'>⭐ {appointment.rating}/5</p>
                                )}
                                    <button className='text-sm text-stone-500  text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300' onClick={() => handleRatingClick(appointment)}>{appointment.rating ? 'Edit Rating' : 'Leave a Rating'}</button>
                                    <button className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'  onClick={() => handleReviewClick(appointment)}>{appointment.review ? 'Edit Review' : 'Leave a Review'}</button>
                                </>
                            ) : (
                               <>
                                    {appointment.typeOfAppointment === 'online' && (
                                        <button onClick={() => handleMeetingLink(appointment._id)} className='text-sm border p-3 py-2 rounded hover:bg-primary hover:text-white'>
                                            View Meeting Link
                                        </button>
                                    )}
                                    <button onClick={() => navigate(`/reschedule/${therapist._id}`, { state: { appointmentId: appointment._id } })} className='text-sm border py-2 rounded hover:bg-primary p-3 hover:text-white'>Reschedule Appointment</button>
                                    <button onClick={() => handleCancelClick(appointment)} className='text-sm border py-2 rounded hover:bg-red-600 hover:text-white'>Cancel Appointment</button>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}

            {showReviewPopup && (
                <div className='fixed inset-0 flex justify-center items-center bg-black bg-opacity-50'>
                    <div className='bg-white p-6 rounded shadow-lg w-96'>
                        <h2 className='text-lg font-semibold mb-3'>Submit Review</h2>
                        <textarea className='w-full p-2 border rounded' value={review} onChange={(e) => setReview(e.target.value)} placeholder='Write your review...'></textarea>
                        <div className='flex justify-between mt-4'>
                            <button onClick={submitReview} className='bg-primary text-white px-4 py-2 rounded'>Submit</button>
                            <button onClick={() => setShowReviewPopup(false)} className='border px-4 py-2 rounded'>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {showRatingPopup && (
                <div className='fixed inset-0 flex justify-center items-center bg-black bg-opacity-50'>
                    <div className='bg-white p-6 rounded shadow-lg w-96'>
                        <h2 className='text-lg font-semibold mb-3'>Submit Rating</h2>
                        <div className='flex gap-1'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} onClick={() => setRating(star)} className={`cursor-pointer text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                            ))}
                        </div>
                        <div className='flex justify-between mt-4'>
                            <button onClick={submitRating} className='bg-primary text-white px-4 py-2 rounded'>Submit</button>
                            <button onClick={() => setShowRatingPopup(false)} className='border px-4 py-2 rounded'>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {showPopup && selectedAppointment && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Are you sure you want to cancel?</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Cancellations may be charged depending on our policy. <br />
                            <span className="font-semibold">Paid appointments cancelled within the last 3 days will be charged the full amount.</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                className="text-sm text-gray-600 border px-4 py-2 rounded hover:bg-gray-200 transition"
                                onClick={() => setShowPopup(false)}
                            >
                                No
                            </button>
                            <button 
                                className="text-sm text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
                                onClick={confirmCancel}
                            >
                                Cancel Appointment
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showMeetingPopup && (
                <div 
                    className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50"
                    onClick={() => setShowMeetingPopup(false)}>
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold text-primary mb-3">Meeting Link</h2>
                        <p className="text-sm text-gray-600 mb-4 break-all">{meetingLink}</p>

                        <div className="flex flex-col gap-3">
                            <button 
                                className="text-sm text-primary border px-4 py-2 rounded hover:bg-primary hover:text-white transition"
                                onClick={copyToClipboard}
                            >
                                Copy Link
                            </button>
                            
                            {!showMessageInput ? (
                                <button 
                                    className="text-sm text-red-600 border px-4 py-2 rounded hover:bg-red-100 transition"
                                    onClick={requestNewLink}
                                >
                                    Request New Link
                                </button>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <textarea 
                                        className="w-full p-2 border rounded text-sm text-gray-700"
                                        placeholder="Enter a reason for requesting a new link..."
                                        value={requestMessage}
                                        onChange={(e) => setRequestMessage(e.target.value)}
                                    />
                                    <button 
                                        className="text-sm bg-primary text-white px-4 py-2 rounded hover:opacity-90 transition"
                                        onClick={submitNewLinkRequest}
                                    >
                                        Submit Request
                                    </button>
                                </div>
                            )}
                            
                            <button 
                                className="text-sm text-gray-600 border px-4 py-2 rounded hover:bg-gray-200 transition"
                                onClick={() => setShowMeetingPopup(false)}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default MyAppointments;
