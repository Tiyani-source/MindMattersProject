import { useState, useEffect } from "react";
import { Trash, Eye, X } from "lucide-react";
import axios from "axios";

export default function StudentRequests() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchStudentRequests = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/student-request/view");
        if (response.data.success) {
          setData(response.data.data);
        } else {
          console.error("Failed to fetch student requests:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching student requests:", error);
      }
    };

    fetchStudentRequests();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:4000/api/student-request/delete/${id}`);
      if (res.data.success) {
        setData((prev) => prev.filter((user) => user._id !== id));
        if (selectedStudent?._id === id) setSelectedStudent(null);
      } else {
        console.error(res.data.message);
      }
    } catch (error) {
      console.error("Error deleting student request:", error);
    }
  };

  const handleApproveStudent = async (id) => {
    try {
      const res = await axios.post(`http://localhost:4000/api/student-request/approve/${id}`);
      if (res.data.success) {
        setData((prev) => prev.filter((user) => user._id !== id));
        setSelectedStudent(null);
        alert(`✅ Student approved successfully!\n🔐 Password: ${res.data.password}`);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Error approving student:", error);
    }
  };

  const handleViewProfile = (user) => {
    setSelectedStudent(user);
  };

  const closeModal = () => setSelectedStudent(null);

  return (
    <div className="p-6 max-w-7xl mx-auto mt-10 bg-gradient-to-br from-blue-50 to-white shadow-xl rounded-3xl">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 text-center">📚 Student Requests</h2>

      <input
        type="text"
        placeholder="🔍 Search by name..."
        className="mb-6 w-full p-4 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="w-full text-sm text-left text-gray-800 border-collapse">
          <thead className="text-xs uppercase bg-blue-100 text-gray-600">
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
                  className="bg-white hover:bg-blue-50 transition border-b"
                >
                  <td className="px-6 py-4 font-medium">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.universityId}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        className="text-blue-600 hover:text-blue-800 transition"
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
          <p className="text-center text-gray-500 mt-6">No student requests found.</p>
        )}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md transition-all">
          <div className="bg-white w-full max-w-3xl p-10 rounded-3xl shadow-2xl relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={closeModal}
            >
              <X size={28} />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-blue-600 text-center">
              Student Profile: {selectedStudent.firstName} {selectedStudent.lastName}
            </h3>

            <div className="grid grid-cols-2 gap-5 text-[15px] text-gray-700">
              <p><strong>Email:</strong> {selectedStudent.email}</p>
              <p><strong>Phone:</strong> {selectedStudent.phone}</p>
              <p><strong>Gender:</strong> {selectedStudent.gender}</p>
              <p><strong>University ID:</strong> {selectedStudent.universityId}</p>
              <p><strong>University Name:</strong> {selectedStudent.universityName}</p>
              <p><strong>Degree:</strong> {selectedStudent.degree}</p>
              <p><strong>Year:</strong> {selectedStudent.year}</p>
              <p><strong>Semester:</strong> {selectedStudent.semester}</p>
              <p className="col-span-2"><strong>Address:</strong> {selectedStudent.address}</p>
              <p className="col-span-2">
                <strong>Documents:</strong>{" "}
                <a
                  href={selectedStudent.documents}
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
                onClick={() => handleApproveStudent(selectedStudent._id)}
              >
                Approve Student
              </button>
              <button
                className="px-6 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 shadow font-semibold"
                onClick={() => handleDelete(selectedStudent._id)}
              >
                 Delete Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
