import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AppContext from '../context/AppContext'

const TicketResponses = ({ ticketId }) => {
  const [responses, setResponses] = useState([]);
  const [newResponse, setNewResponse] = useState('');
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

  
  const fetchResponses = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/supportTickets/${ticketId}/responses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setResponses(response.data);
    } catch (err) {
      setError('Failed to fetch ticket responses.');
      console.error(err);
    }
  };

  
  const handleAddResponse = async (e) => {
    e.preventDefault();
    
    if (!newResponse.trim()) {
      setError('Response cannot be empty');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/supportTickets/${ticketId}/responses`, 
        { content: newResponse },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      
      setResponses([...responses, response.data]);
      
      
      setNewResponse('');
      setError('');
    } catch (err) {
      setError('Failed to add response. Please try again.');
      console.error(err);
    }
  };

  
  useEffect(() => {
    fetchResponses();
  }, [ticketId]);

  return (
    <div className="mt-6 bg-white shadow-md rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4">Ticket Responses</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}


      {responses.length === 0 ? (
        <p className="text-gray-600 mb-4">No responses yet.</p>
      ) : (
        <div className="space-y-4 mb-6">
          {responses.map((response) => (
            <div 
              key={response._id} 
              className={`p-3 rounded-lg ${
                response.isStaff 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'bg-gray-50 border-l-4 border-gray-500'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">
                  {response.isStaff ? 'Support Team' : 'You'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(response.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700">{response.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Response Form
      <form onSubmit={handleAddResponse} className="mt-4">
        <div className="mb-4">
          <label 
            htmlFor="response" 
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Add a Response
          </label>
          <textarea
            id="response"
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
            placeholder="Type your response here..."
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Send Response
        </button>
      </form> */}
    </div>
  );
};


const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/supportTickets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTickets(response.data);
    } catch (err) {
      setError('Failed to fetch tickets. Please try again.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDelete = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await axios.delete(`${API_URL}/api/supportTickets/${ticketId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setTickets(tickets.filter(ticket => ticket._id !== ticketId));
      } catch (err) {
        setError('Failed to delete ticket. Please try again.');
        console.error(err);
      }
    }
  };

  const handleEditClick = (ticket) => {
    setEditingTicket(ticket);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_URL}/api/supportTickets/${editingTicket._id}`, 
        { 
          title: editingTicket.title, 
          description: editingTicket.description
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      
      setTickets(tickets.map(ticket => 
        ticket._id === editingTicket._id ? response.data : ticket
      ));
      
      
      setEditingTicket(null);
    } catch (err) {
      setError('Failed to update ticket. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">My Support Tickets</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}
      {tickets.length === 0 ? (
        <p className="text-gray-600">No support tickets found.</p>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <div 
              key={ticket._id} 
              className="bg-white shadow-md rounded-lg p-4 border hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{ticket.title}</h3>
                <div className="flex items-center space-x-2">
                  <span 
                    className={`px-2 py-1 rounded text-xs font-medium mr-2
                      ${ticket.status === 'Open' ? 'bg-green-100 text-green-800' : 
                        ticket.status === 'Closed' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}
                  >
                    {ticket.status || 'Pending'}
                  </span>
                  <button 
                    onClick={() => handleEditClick(ticket)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(ticket._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => setSelectedTicket(selectedTicket?._id === ticket._id ? null : ticket)}
                    className="text-green-500 hover:text-green-700"
                  >
                    {selectedTicket?._id === ticket._id ? 'Hide Responses' : 'View Responses'}
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-2">{ticket.description}</p>
              <div className="text-sm text-gray-500">
                Created on: {new Date(ticket.createdAt).toLocaleDateString()}
              </div>


              {selectedTicket?._id === ticket._id && (
                <TicketResponses ticketId={ticket._id} />
              )}
            </div>
          ))}
        </div>
      )}


      {editingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Ticket</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-title">
                  Ticket Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editingTicket.title}
                  onChange={(e) => setEditingTicket({...editingTicket, title: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-description">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={editingTicket.description}
                  onChange={(e) => setEditingTicket({...editingTicket, description: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Update Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


const CreateTicket = ({ onTicketCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/supportTickets`, 
        { title, description },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setSuccess('Ticket created successfully!');
      
      
      onTicketCreated();
      
      
      setTitle('');
      setDescription('');
    } catch (err) {
      setError('Failed to create ticket. Please try again.');
      console.error(err);
    }
  };

  // Rest of the CreateTicket component remains the same
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Create New Support Ticket</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Ticket Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter ticket title"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            placeholder="Describe your issue in detail"
            required
          ></textarea>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Ticket
          </button>
        </div>
      </form>
    </div>
  );
};

const SupportTicketApp = () => {
  const [activeTab, setActiveTab] = useState('list');

  const handleTicketCreated = () => {
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Support Ticket System</h1>
          <div>
            <button
              onClick={() => setActiveTab('list')}
              className={`mr-4 px-4 py-2 rounded ${
                activeTab === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded ${
                activeTab === 'create' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Create Ticket
            </button>
          </div>
        </div>
      </nav>

      {activeTab === 'list' ? <TicketList /> : <CreateTicket onTicketCreated={handleTicketCreated} />}
    </div>
  );
};

export default SupportTicketApp;