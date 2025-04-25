import { useState, useEffect } from "react";
import { Trash, Eye, X } from "lucide-react";
import axios from "axios";

export default function PatientRequests() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctorRequests = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/doctor-request/view");
        if (response.data.success) {
          setData(response.data.data);
        } else {
          console.error("Failed to fetch doctor requests:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching doctor requests:", error);
      }
    };

    fetchDoctorRequests();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:4000/api/doctor-request/delete/${id}`);
      if (res.data.success) {
        setData((prev) => prev.filter((doc) => doc._id !== id));
        if (selectedDoctor?._id === id) setSelectedDoctor(null);
      } else {
        console.error(res.data.message);
      }
    } catch (error) {
      console.error("Error deleting doctor request:", error);
    }
  };

  const handleAddDoctor = async (id) => {
    try {
      const res = await axios.post(`http://localhost:4000/api/doctor-request/approve/${id}`);
      if (res.data.success) {
        setData((prev) => prev.filter((doc) => doc._id !== id));
        setSelectedDoctor(null);
        alert(` Doctor approved successfully!\n🔐 Password: ${res.data.password}`);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Error approving doctor:", error);
    }
  };

  const handleViewProfile = (user) => {
    setSelectedDoctor(user);
  };

  const closeModal = () => {
    setSelectedDoctor(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto mt-10 bg-gradient-to-br from-indigo-50 to-white shadow-xl rounded-3xl">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 text-center">🩺 Doctor Requests</h2>

      <input
        type="text"
        placeholder="🔍 Search by name..."
        className="mb-6 w-full p-4 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="w-full text-sm text-left text-gray-800 border-collapse">
          <thead className="text-xs uppercase bg-indigo-100 text-gray-700">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">University ID</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data
              .filter((user) =>
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase())
              )
              .map((user) => (
                <tr
                  key={user._id}
                  className="bg-white hover:bg-indigo-50 transition border-b"
                >
                  <td className="px-6 py-4 font-medium">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.universityId}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        className="text-indigo-600 hover:text-indigo-800 transition"
                        onClick={() => handleViewProfile(user)}
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 transition"
                        onClick={() => handleDelete(user._id)}
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No doctor requests found.</p>
        )}
      </div>

      {/* MODAL */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-3xl p-10 rounded-3xl shadow-2xl relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={closeModal}
            >
              <X size={28} />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-indigo-600 text-center">
              Doctor Profile: {selectedDoctor.firstName} {selectedDoctor.lastName}
            </h3>

            <div className="grid grid-cols-2 gap-5 text-[15px] text-gray-700">
              <p><strong>Email:</strong> {selectedDoctor.email}</p>
              <p><strong>Phone:</strong> {selectedDoctor.phone}</p>
              <p><strong>Doctor ID:</strong> {selectedDoctor.doctorId}</p>
              <p><strong>University ID:</strong> {selectedDoctor.universityId}</p>
              <p><strong>Gender:</strong> {selectedDoctor.gender}</p>
              <p><strong>Address:</strong> {selectedDoctor.address}</p>
              <p><strong>Experience:</strong> {selectedDoctor.experience} yrs</p>
              <p><strong>Qualifications:</strong> {selectedDoctor.qualifications}</p>
              <p><strong>Degree:</strong> {selectedDoctor.degree}</p>
              <p><strong>Specialty:</strong> {selectedDoctor.specialty}</p>
              <p className="col-span-2"><strong>About:</strong> {selectedDoctor.about}</p>
              <p><strong>Fees:</strong> ${selectedDoctor.fees}</p>
              <p className="col-span-2">
                <strong>Documents:</strong>{" "}
                <a
                  href={selectedDoctor.documents}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  View Uploaded Document
                </a>
              </p>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                className="px-6 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 shadow font-semibold"
                onClick={() => handleAddDoctor(selectedDoctor._id)}
              >
                ✅ Add Doctor
              </button>
              <button
                className="px-6 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 shadow font-semibold"
                onClick={() => handleDelete(selectedDoctor._id)}
              >
                🗑️ Delete Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
