import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, XCircle, ClipboardList, Star } from "lucide-react";

const dummyAppointments = [
  { id: "A001", clientId: "C001", client: "John Doe", date: "2025-03-15", status: "archived" },
  { id: "A002", clientId: "C002", client: "Jane Smith", date: "2025-03-14", status: "archived" },
  { id: "A003", clientId: "C003", client: "Alice Brown", date: "2025-03-10", status: "goal setting" },
  { id: "A004", clientId: "C001", client: "John Doe", date: "2025-03-20", status: "goal setting" },
  { id: "A005", clientId: "C001", client: "John Doe", date: "2025-03-22", status: "ongoing" },
  { id: "A006", clientId: "C002", client: "Jane Smith", date: "2025-03-18", status: "ongoing" },
  { id: "A007", clientId: "C003", client: "Alice Brown", date: "2025-03-25", status: "ongoing" },
  { id: "A008", clientId: "C004", client: "William Brown", date: "2025-03-28", status: "terminated" },
];

const statusCategories = ["goal setting", "ongoing", "terminated", "archived"];

const ClientsManage = () => {
  const [clientsData, setClientsData] = useState([]);
  const [kanbanView, setKanbanView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [confirmation, setConfirmation] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();
  

  useEffect(() => {
    const clientsMap = {};
    
    dummyAppointments.forEach(({ client, clientId, date, status }) => {
      if (!clientsMap[client]) {
        clientsMap[client] = { client, clientId, appointments: 0, lastAppointment: "", status };
      }
      clientsMap[client].appointments++;
      if (!clientsMap[client].lastAppointment || new Date(date) > new Date(clientsMap[client].lastAppointment)) {
        clientsMap[client].lastAppointment = date;
        clientsMap[client].status = status;
      }
    });

    setClientsData(Object.values(clientsMap));
  }, []);

  const handleDragStart = (e, client) => {
    e.dataTransfer.setData("client", JSON.stringify(client));
  };
  const updateClientStatus = (client, newStatus) => {
    setClientsData((prev) =>
      prev.map((c) => (c.client === client.client ? { ...c, status: newStatus } : c))
    );
    setConfirmation(null);
  };
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const client = JSON.parse(e.dataTransfer.getData("client"));
  
    if (newStatus === "terminated" || newStatus === "archived") {
      setConfirmation({ client, newStatus });
    } else {
      updateClientStatus(client, newStatus);
    }
  };


  const allowDrop = (e) => {
    e.preventDefault();
  };

  // Count ongoing clients (goal setting + ongoing)
  const ongoingClients = clientsData.filter(client =>
    client.status.includes("goal setting") || client.status.includes("ongoing")
  ).length;

  // Count archived clients
  const archivedClients = clientsData.filter(client => client.status.includes("archived")).length;

  // Count total unique clients
  const totalClients = clientsData.length;

  // Calculate average appointments per client
  const totalAppointments = dummyAppointments.length;
  const avgAppointments = totalClients > 0 ? (totalAppointments / totalClients).toFixed(1) : 0;

  // Card Data for UI
  const cardData = [
    { 
      label: "Ongoing Clients", 
      value: ongoingClients, 
      icon: <CalendarCheck className="text-white w-6 h-6" />, 
      bg: "bg-[#1E3A8A]",
      textColor: "text-white" 
    },
    { 
      label: "Archived Clients", 
      value: archivedClients, 
      icon: <XCircle className="text-white w-6 h-6" />, 
      bg: "bg-[#3758A6]",
      textColor: "text-white" 
    },
    { 
      label: "Total Clients", 
      value: totalClients, 
      icon: <ClipboardList className="text-white w-6 h-6" />, 
      bg: "bg-[#4F75C2]",
      textColor: "text-white" 
    },
    { 
      label: "Avg. Appointments per Client", 
      value: avgAppointments, 
      icon: <Star className="text-white w-6 h-6" />, 
      bg: "bg-[#7DA4E6]",
      textColor: "text-white" 
    },
  ];

  
  return (
    <div className="w-full max-w-full px-8">
      <h2 className="text-xl font-bold pt-4 mb-2 text-[#1F2937]">Clients Overview</h2>
      <p className="font-light text-sm pb-5 text-[#4B5563]">
        Manage all your clients and their progress here.
      </p>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {cardData.map((card, index) => (
          <div 
            key={index}
            className={`shadow-xl rounded-xl p-6 flex flex-col items-center justify-center ${card.bg} transition-all transform hover:scale-105 hover:shadow-2xl`}
          >
            <div className="w-12 h-12 flex items-center justify-center bg-white bg-opacity-20 rounded-full shadow-md mb-3">
              {card.icon}
            </div>
            <h3 className='text-md font-semibold text-white mb-1'>{card.label}</h3>
            <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Controls Section */}
      <div className="flex justify-between items-center mb-4">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search clients..."
          className="px-4 py-2 border rounded-lg w-1/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5F6FFF]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Filter & Kanban Button (Aligned Right) */}
        <div className="flex items-center gap-3">
          {/* Status Filter (Only in Table View) */}
          {!kanbanView && (
            <select
              className="px-4 py-2 border rounded-lg shadow-sm bg-white text-gray-700 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-[#5F6FFF]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="" className="bg-white text-gray-700 hover:bg-gray-100">
    All Statuses
  </option>
  {statusCategories.map((status, index) => (
    <option
      key={index}
      value={status}
      className="bg-white text-gray-700 hover:bg-gray-100 font-medium"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </option>
              ))}
            </select>
          )}

          {/* Kanban Toggle Button */}
          <button
            className="px-4 py-2 bg-[#5F6FFF] text-white rounded-lg shadow-md hover:bg-[#4C5AE3] transition-all"
            onClick={() => setKanbanView(!kanbanView)}
          >
            {kanbanView ? "Table View" : "Change Status"}
          </button>
        </div>
      </div>

      {kanbanView ? (
        
        <div className="flex gap-4 overflow-x-scroll">
          {statusCategories.map((status) => (
            <div
              key={status}
              className="w-1/4 bg-[#E5E7EB] p-4 rounded-lg shadow"
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={allowDrop}
            >
              <h3 className="text-center font-semibold text-sm text-[#374151] mb-3">
                {status.toUpperCase()}
              </h3>
              {clientsData
                .filter(
                  (client) =>
                    client.status === status &&
                    client.client.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((client, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white border border-gray-300 rounded-lg shadow-md mb-2 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
                    draggable
                    onDragStart={(e) => handleDragStart(e, client)}
                  >
                    <p className="text-sm font-semibold text-[#374151]">{client.client}</p>
                    <p className="text-xs text-[#6B7280]">Appointments: {client.appointments}</p>
                    <p className="text-xs text-[#6B7280]">Last: {client.lastAppointment}</p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll shadow-lg">
          <div className="grid grid-cols-5 gap-4 py-3 px-6 border-b font-medium text-center bg-[#F3F4F6]">
            <p className="text-[#1F2937]">Client Name</p>
            <p className="text-[#1F2937]">Appointments</p>
            <p className="text-[#1F2937]">Last Appointment</p>
            <p className="text-[#1F2937]">Status</p>
            <p className="text-[#1F2937]">Action</p>
          </div>
          {clientsData
            .filter(
              (client) =>
                client.client.toLowerCase().includes(searchQuery.toLowerCase()) &&
                (filterStatus === "" || client.status === filterStatus)
            )
            .map((client, index) => (
              <div
                className="grid grid-cols-5 gap-4 py-3 px-6 border-b text-[#4B5563] text-center hover:bg-[#F9FAFB] transition-all"
                key={index}
              >
                <p>{client.client}</p>
                <p>{client.appointments}</p>
                <p>{client.lastAppointment}</p>
                <p className="font-semibold">{client.status}</p>
                <button
                  className="px-3 py-1.5 rounded bg-[#5F6FFF] text-white hover:bg-[#4C5AE3] transition-all shadow-md"
                  onClick={() => navigate(`/client-note/${client.clientId}`)}
                >
                  View Notes
                </button>
              </div>
            ))}
        </div>
      )}{confirmation && (
        <div 
          className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50"
          onClick={() => setConfirmation(null)} // Close when clicking outside
        >
          <div 
            className="bg-white p-6 rounded-lg shadow-lg w-96"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
          >
            <h2 className="text-lg font-semibold text-[#1F2937] mb-3">
              Confirm Status Change
            </h2>
      
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to <span className="font-semibold text-red-600">{confirmation.newStatus}</span> <span className="font-medium">{confirmation.client.client}</span>?
            </p>
      
            {/* Buttons Section */}
            <div className="flex flex-col gap-3">
              {/* Dynamic Button Text */}
              <button
                className={`text-sm px-4 py-2 rounded-lg transition ${
                  confirmation.newStatus === "terminated"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
                onClick={() => updateClientStatus(confirmation.client, confirmation.newStatus)}
              >
                {confirmation.newStatus === "terminated" ? "Terminate Client" : "Archive Client"}
              </button>
      
              {/* Cancel Button */}
              <button
                className="text-sm text-gray-600 border px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                onClick={() => setConfirmation(null)}
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

export default ClientsManage;