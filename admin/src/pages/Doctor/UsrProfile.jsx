import { useState, useEffect } from "react";
import { Lock, Phone } from "lucide-react";
import axios from "axios";
import decodeJWT from "../../utils/decodeJWT";
import "./css/UserProfile.css";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem("dToken");
        if (!token) return;

        const decoded = decodeJWT(token);
        const emailFromToken = decoded?.email;
        if (!emailFromToken) return;

        const res = await axios.get(
          `http://localhost:4000/api/doctor/profile?email=${emailFromToken}`
        );

        if (res.data.success) {
          setDoctor(res.data.doctor);
        }
      } catch (err) {
        console.error("Failed to load doctor profile:", err);
      }
    };

    fetchDoctor();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDoctor((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleUpdateToggle = async () => {
    if (isEditing) {
      try {
        const res = await axios.put("http://localhost:4000/api/doctor/update-profile", {
          ...doctor,
          email: doctor.email, // ensure email is sent
        });
        if (res.data.success) {
          alert("Profile updated successfully!");
        } else {
          alert("Update failed: " + res.data.message);
        }
      } catch (err) {
        console.error("Error updating profile:", err);
        alert("Failed to update profile.");
      }
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex flex-col ml-10 mr-10 pt-10">
      <h1 className="text-4xl">Doctor Profile</h1>

      <div className="flex space-x-10">
        <div className="p-4 bg-white flex flex-col items-start rounded-lg mt-10 shadow-md w-full">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gray-400" />
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-700">{doctor.name}</h3>
              <p className="text-sm text-gray-500">{doctor.gender}</p>
              <button className="mt-2 flex items-center hover:bg-gray-200 px-4 py-1 rounded-sm text-sm shadow-md">
                <Lock className="w-3 h-3 mr-2" /> CHANGE PASSWORD
              </button>
            </div>
          </div>

          <div className="mt-4 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="labelInput">Speciality:</label>
                <input
                  className="customInput w-full"
                  name="speciality"
                  value={doctor.speciality || ""}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="labelInput">Degree:</label>
                <input
                  className="customInput w-full"
                  name="degree"
                  value={doctor.degree || ""}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="labelInput">Experience:</label>
                <input
                  className="customInput w-full"
                  name="experience"
                  value={doctor.experience || ""}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="labelInput">Qualifications:</label>
                <input
                  className="customInput w-full"
                  name="qualifications"
                  value={doctor.qualifications || ""}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="col-span-2">
                <label className="labelInput">About:</label>
                <textarea
                  className="customInput w-full"
                  name="about"
                  value={doctor.about || ""}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-10">
        {/* Contact Info */}
        <div className="p-4 bg-white flex flex-col items-start rounded-lg mt-10 shadow-md w-full">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Phone className="w-10 h-10 text-green-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-700">{doctor.phone}</h3>
              <p className="text-sm text-gray-500">{doctor.email}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 w-full">
            <div>
              <label className="labelInput">Phone:</label>
              <input
                className="customInput w-full"
                name="phone"
                value={doctor.phone || ""}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </div>

            <div>
              <label className="labelInput">Email:</label>
              <input className="customInput w-full" value={doctor.email || ""} readOnly />
            </div>

            <div>
              <label className="labelInput">Doctor ID:</label>
              <input className="customInput w-full" value={doctor.doctorId || ""} readOnly />
            </div>

            <div>
              <label className="labelInput">Fees:</label>
              <input
                className="customInput w-full"
                name="fees"
                type="number"
                value={doctor.fees || ""}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleUpdateToggle}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md"
        >
          {isEditing ? "Done" : "Update Profile"}
        </button>
      </div>
    </div>
  );
}
