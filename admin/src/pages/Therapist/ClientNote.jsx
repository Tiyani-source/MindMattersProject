


import React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const ClientNote = () => {
    const { clientId } = useParams();
    const dummyAppointments = [
        { id: 'A001', clientId: 'C001', client: 'John Doe', date: '2025-03-15', status: 'online', notes: 'Discussed coping strategies', notedetails: 'Explored various coping mechanisms for stress and anxiety, including breathing exercises and journaling.' },
        { id: 'A002', clientId: 'C002', client: 'Jane Smith', date: '2025-03-14', status: 'in-person', notes: 'Worked on relaxation techniques', notedetails: 'Practiced guided meditation and progressive muscle relaxation to reduce tension.' },
        { id: 'A003', clientId: 'C003', client: 'Alice Brown', date: '2025-03-10', status: 'online', notes: '', notedetails: '' },
        { id: 'A004', clientId: 'C001', client: 'John Doe', date: '2025-03-20', status: 'online', notes: '', notedetails: '' },
        { id: 'A005', clientId: 'C001', client: 'John Doe', date: '2025-03-22', status: 'in-person', notes: 'Reviewed progress', notedetails: 'Reflected on achievements since the last session and identified areas for improvement.' },
        { id: 'A006', clientId: 'C002', client: 'Jane Smith', date: '2025-03-18', status: 'in-person', notes: 'Planned next steps', notedetails: 'Discussed goals for the upcoming month and created an action plan.' },
        { id: 'A007', clientId: 'C003', client: 'Alice Brown', date: '2025-03-25', status: 'in-person', notes: '', notedetails: '' },
        { id: 'A008', clientId: 'C004', client: 'William Brown', date: '2025-03-28', status: 'online', notes: 'Final session, client discharged', notedetails: 'Reviewed overall progress, provided resources for continued self-care, and concluded therapy sessions.' },
    ];

    const [showPopup, setShowPopup] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [editedNote, setEditedNote] = useState('');
    const clientAppointments = dummyAppointments.filter(app => app.clientId === clientId);      
    const location = useLocation();
    const { client, appointments } = location.state || { client: '', appointments: [] };
    const [showModal, setShowModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const navigate = useNavigate();

    const handleDeleteClick = (note) => {
        setSelectedNote(note);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedNote(null);
    };

    const handleConfirmDelete = () => {
        console.log(`Deleting note: ${selectedNote?.id}`);
        setShowModal(false);
    };

    return (
        <div className='w-full max-w-full px-8'>
            <div className="flex items-center gap-4 mb-3 mt-3">
            <button 
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
                onClick={() => navigate(-1)}> ← Back</button>
                <p className="text-lg font-medium">
                    {client || (clientAppointments.length > 0 ? clientAppointments[0].client : 'Unknown Client')} - Case Notes
                </p>
    </div>



            {/* Appointments List */}
            <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
                <div className='grid grid-cols-7 gap-4 py-3 px-6 border-b font-medium text-center'>
                    <p>Appointment ID</p>
                    <p>Visit Number</p>
                    <p>Date</p>
                    <p>Type</p>
                    <p>Note Overview</p>
                    <p>View Notes</p>
                    <p>Delete Note</p>
                </div>
                {clientAppointments.map((item, index) => (
                    <div className='grid grid-cols-7 gap-4 py-3 px-6 border-b text-gray-500 text-center' key={index}>
                        <p>{item.id}</p>
                        <p>{index + 1}</p>
                        <p>{item.date}</p>
                        <p>{item.status}</p>
                        <p>{item.notes || 'No Notes'}</p>
                        <button 
                            className="px-3 py-1.5 rounded bg-primary text-white hover:opacity-90 transition"
                            onClick={() => {
                                setSelectedAppointment(item); // Store selected appointment
                                setEditedNote(item.notedetails || ''); // Load existing notes
                                setShowPopup(true); // Show popup
                            }}
                        >
                            View Notes
                        </button>
                        <button onClick={() => handleDeleteClick(item)} className="px-3 py-1.5 rounded text-red-600 border px-4 py-2 rounded hover:bg-red-100 transition">
    Delete Note
</button>
                    </div>
                ))}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseModal}>
                        <div className="bg-white p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                            <p className="mb-4">Are you sure you want to delete this note permanently?</p>
                            <div className="flex justify-end">
                                <button className="px-4 py-2 mr-2 bg-gray-300 rounded" onClick={handleCloseModal}>No</button>
                                <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={handleConfirmDelete}>Yes</button>
                            </div>
                        </div>
                    </div>
                )}
                {showPopup && selectedAppointment && (
                    <div 
                        className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50"
                        onClick={() => setShowPopup(false)} // Close when clicking outside
                    >
                        <div 
                        className="bg-white p-6 rounded-lg shadow-lg w-96"
                        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
                        >
                        <h2 className="text-lg font-semibold text-primary mb-3">Edit Notes</h2>

                        {/* Textarea for Notes */}
                        <textarea 
                            className="w-full p-2 border rounded text-sm text-gray-700"
                            rows="5"
                            placeholder="Enter or modify notes..."
                            value={editedNote}
                            onChange={(e) => setEditedNote(e.target.value)}
                        ></textarea>

                        {/* Buttons Section */}
                        <div className="flex justify-between mt-4">
                            <button 
                            className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 transition"
                            onClick={() => {
                                console.log(`Saving Note for ${selectedAppointment.id}:`, editedNote);
                                setShowPopup(false);
                            }}
                            >
                            Save Note
                            </button>

                            <button 
                            className="text-gray-600 border px-4 py-2 rounded hover:bg-gray-200 transition"
                            onClick={() => setShowPopup(false)}
                            >
                            Close
                            </button>
                        </div>
                        </div>
                    </div>
                    )}
            </div>
        </div>
    );
}

export default ClientNote;