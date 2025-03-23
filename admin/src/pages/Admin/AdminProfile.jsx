import { useState, useEffect } from "react";
import { Lock, Phone, MapPin } from "lucide-react";
import axios from "axios";
import "./css/UserProfile.css";

export default function AdminProfile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("");
  const [accessLevel, setAccessLevel] = useState("");
  const [lastLogin, setLastLogin] = useState("");
  const [status, setStatus] = useState("");
  const [hiredDate, setHiredDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("admin@mindmatters.lk"); // for fetching
  const [linkedIn, setLinkedIn] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [whatsapp, setWhatsApp] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [country, setCountry] = useState("");


  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/admin/profile?email=${email}`);
        if (res.data.success) {
          const admin = res.data.admin;
          setFirstName(admin.firstName || "");
          setLastName(admin.lastName || "");
          setAge(admin.age || "");
          setEmployeeId(admin.employeeId || "");
          setRole(admin.role || "");
          setAccessLevel(admin.accessLevel || "");
          setHiredDate(admin.hiredDate || "");
          setPhone(admin.phone || "");
          setEmail(admin.email || "");
          setLinkedIn(admin.linkedIn || "");
          setEmergencyContact(admin.emergencyContact || "");
          setWhatsApp(admin.whatsapp || "");
          setAddress(admin.address || "");
          setCity(admin.city || "");
          setDistrict(admin.district || "");
          setCountry(admin.country || "");
          setPostalCode(admin.postalCode || "");
          setLastLogin(admin.lastLogin || "");
          setStatus(admin.status || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    fetchAdmin();
  }, []);


  const handleUpdateProfile = async () => {
    try {
      const res = await axios.put("http://localhost:4000/api/admin/profile", {
        firstName,
        lastName,
        age,
        employeeId,
        role,
        accessLevel,
        hiredDate,
        phone,
        email,
        linkedIn,
        emergencyContact,
        whatsapp,
        address,
        city,
        district,
        country,
        postalCode,
        lastLogin,
        status,
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
  };

  return (
    <div className="flex flex-col ml-10 mr-10 pt-10">
      <h1 className="text-4xl">Admin Profile</h1>

      {/* First Row */}
      <div className="flex space-x-10">
        <div className="p-4 bg-white flex flex-col items-start rounded-lg mt-10 shadow-md w-full">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gray-400" />
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-700">
                {firstName} {lastName}
              </h3>
              <p className="text-sm text-gray-500">{age} Years</p>
              <button className="mt-2 flex items-center hover:bg-gray-200 px-4 py-1 rounded-sm text-sm shadow-md">
                <Lock className="w-3 h-3 mr-2" />
                CHANGE PASSWORD
              </button>
            </div>
          </div>

          <div className="mt-4 flex space-x-4 w-full">
            <div className="flex-1">
              <label className="labelInput">First Name:</label>
              <input className="customInput w-full" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>

            <div className="flex-1">
              <label className="labelInput">Last Name:</label>
              <input className="customInput w-full" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 flex space-x-4 w-full">
            <div className="flex-1">
              <label className="labelInput">Employee ID:</label>
              <input className="customInput w-full" type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
            </div>

            <div className="flex-1">
              <label className="labelInput">Role:</label>
              <input className="customInput w-full" type="text" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>

            <div className="flex-1">
              <label className="labelInput">Access Level:</label>
              <input className="customInput w-full" type="text" value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)} />
            </div>

            <div className="flex-1">
              <label className="labelInput">Hired Date:</label>
              <input className="customInput w-full" type="date" value={hiredDate} onChange={(e) => setHiredDate(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="flex space-x-10">
        {/* Contact Info */}
        <div className="p-4 bg-white flex flex-col items-start rounded-lg mt-10 shadow-md w-1/2">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Phone className="w-10 h-10 text-green-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-700">{phone}</h3>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>

          <div className="mt-4 flex space-x-4 w-full">
            <div className="flex-1">
              <label className="labelInput">Phone:</label>
              <input className="customInput w-full" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="labelInput">Email:</label>
              <input className="customInput w-full" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <label className="labelInput">LinkedIn:</label>
          <input className="customInput w-full" type="text" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} />

          <label className="labelInput">Emergency Contact:</label>
          <input className="customInput w-full" type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />

          <label className="labelInput">WhatsApp:</label>
          <input className="customInput w-full" type="text" value={whatsapp} onChange={(e) => setWhatsApp(e.target.value)} />
        </div>

        {/* Address Info */}
        <div className="p-4 bg-white flex flex-col items-start rounded-lg mt-10 shadow-md w-1/2">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-700">
                {address}, {city}, {district}
              </h3>
            </div>
          </div>

          <div className="mt-4 flex space-x-4 w-full">
            <div className="flex-1">
              <label className="labelInput">Country:</label>
              <input className="customInput w-full" type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="labelInput">City:</label>
              <input className="customInput w-full" type="text" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>

          <label className="labelInput">District:</label>
          <input className="customInput w-full" type="text" value={district} onChange={(e) => setDistrict(e.target.value)} />

          <label className="labelInput">Address:</label>
          <input className="customInput w-full" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />

          <label className="labelInput">Postal Code:</label>
          <input className="customInput w-full" type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
        </div>
      </div>

      {/* Update Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleUpdateProfile}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
}
