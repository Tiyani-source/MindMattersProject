import { useState } from "react";
import { Button } from "./components/Button";
import { Lock } from "lucide-react";
import "./css/UserProfile.css";
import { Phone } from "lucide-react";
import { MapPin } from "lucide-react";

export default function DoctorUserProfile() {
  const [firstName, setFirstName] = useState("Januda");
  const [lastName, setLastName] = useState("Silunaka");
  const [age, setAge] = useState("23");
  const [university, setUniversity] = useState(
    "Sri Lanka Institute of Information Technology"
  );
  const [universityID, setUniversityID] = useState("IT23331234");
  const [nic, setNic] = useState("123456789V");
  const [hiredDate, setHiredDate] = useState("2021-09-01");
  const [phone, setPhone] = useState("+94-77-1234567");
  const [email, setEmail] = useState("IT2333212@my.sliit.lk");
  const [linkedIn, setLinkedIn] = useState(
    "https://www.linkedin.com/in/ameliah"
  );
  const [emergencyContact, setEmergencyContact] = useState("+1(213)555-4276");
  const [whatsapp, setWhatsApp] = useState("+94-77-1234567");
  const [postalCode, setPostalCode] = useState("10306");
  const [address, setAddress] = useState("193/3 Delinnawatte Rd");
  const [city, setCity] = useState("Piliyandala");
  const [district, setDistrict] = useState("Colombo");
  const [country, setCountry] = useState("Sri Lanka");

  return (
    <>
      {/* Parent container to stack the rows vertically */}
      <div className="flex flex-col ml-10 mr-10 pt-10">
      <h1 class="text-4xl">Doctor Profile</h1>

        {/* First Row */}
        <div className="flex space-x-10">
          {/* First Profile Content (Full Width) */}
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

            {/* Buttons below the profile content */}
            <div className="mt-4 flex space-x-4 w-full">
              <div className="flex-1">
                <label className="labelInput">First Name:</label>
                <input
                  id="firstName"
                  required
                  className="customInput w-full"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="flex-1">
                <label className="labelInput" htmlFor="lastName">
                  Last Name:
                </label>
                <input
                  id="lastName"
                  required
                  className="customInput w-full"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Read Only Data */}
            <div className="mt-4 flex space-x-4 w-full">
              <div className="flex-1">
                <label className="labelInput">University:</label>
                <input
                  id="university"
                  required
                  className="customInput w-full"
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>

              <div className="flex-1">
                <label className="labelInput" htmlFor="universityID">
                  University ID:
                </label>
                <input
                  id="universityID"
                  required
                  className="customInput w-full"
                  type="text"
                  value={universityID}
                  onChange={(e) => setUniversityID(e.target.value)}
                />
              </div>

              <div className="flex-1">
                <label className="labelInput" htmlFor="nic">
                  NIC:
                </label>
                <input
                  id="nic"
                  required
                  className="customInput w-full"
                  type="text"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                />
              </div>

              <div className="flex-1">
                <label className="labelInput" htmlFor="jiredDate">
                  Hired Date:
                </label>
                <input
                  id="HiredDate"
                  required
                  className="customInput w-full"
                  type="text"
                  value={hiredDate}
                  onChange={(e) => setHiredDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="flex space-x-10">
          {/* Second Profile Content (50% Width) */}
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

            {/* Profile Details */}
            <div className="mt-4 flex space-x-4 w-full">
              <div className="flex-1">
                <label className="labelInput">Phone:</label>
                <input
                  id="phone"
                  required
                  className="customInput w-full"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="flex-1">
                <label className="labelInput" htmlFor="email">
                  Email:
                </label>
                <input
                  id="email"
                  required
                  className="customInput w-full"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Read Only Data */}

            <label className="labelInput">LinkedIn:</label>
            <input
              id="LinkedIn"
              required
              className="customInput w-full"
              type="text"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
            />

            <label className="labelInput" htmlFor="EmergencyContact">
              Emergency Contact:
            </label>
            <input
              id="emergencyContact"
              required
              className="customInput w-full"
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
            />

            <label className="labelInput" htmlFor="WhatsApp">
              WhatsApp :
            </label>
            <input
              id="whatsapp"
              required
              className="customInput w-full"
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsApp(e.target.value)}
            />
          </div>

          {/* Third Profile Content (50% Width) */}
          <div className="p-4 bg-white flex flex-col items-start rounded-lg mt-10 shadow-md w-1/2">
            <div className="flex items-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-700">
                  {address},{city},{district}
                </h3>
              </div>
            </div>

            {/* Profile Details */}
            <div className="mt-4 flex space-x-4 w-full">
              <div className="flex-1">
                <label className="labelInput">Country:</label>
                <input
                  id="country"
                  required
                  className="customInput w-full"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <div className="flex-1">
                <label className="labelInput" htmlFor="City">
                  City:
                </label>
                <input
                  id="city"
                  required
                  className="customInput w-full"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            {/* Read Only Data */}

            <label className="labelInput" htmlFor="universityID">
              District:
            </label>
            <input
              id="District"
              required
              className="customInput w-full"
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />

            <label className="labelInput" htmlFor="address">
              Address:
            </label>
            <input
              id="address"
              required
              className="customInput w-full"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <label className="labelInput" htmlFor="Postal Code">
              Postal Code:
            </label>
            <input
              id="Postal Code:"
              required
              className="customInput w-full"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
