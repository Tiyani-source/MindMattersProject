import React from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import Home from "../../Charts/page";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
const DoctorDashboard = () => {
  return (

    <div className="flex flex-col ml-10 mr-10">
       <h1 className="text-3xl font-bold mb-4 mt-10">Doctor Dashboard</h1>
      <div className="flex flex-wrap gap-3 mt-10 ml-5 ">
        <div className="flex items-center gap-2 bg-white p-4 flex-1 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.earning_icon} alt="" />
          <div>
            <p>Earnings</p>
            <p className="text-xl font-semibold text-gray-600">Rs.100000</p>
            <p className="text-gray-400">Earnings</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-4 flex-1 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.appointments_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">Appointment</p>
            <p className="text-gray-400">Appointments</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-4 flex-1 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.patients_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">100</p>
            <p className="text-gray-400">Patients</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-5 ml-5 ">
        <div className="flex items-center gap-2 bg-white p-4 flex-1 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.earning_icon} alt="" />
          <div>
            <p>Earnings</p>
            <p className="text-xl font-semibold text-gray-600">Rs.100000</p>
            <p className="text-gray-400">Earnings</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-4 flex-1 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.appointments_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">Appointment</p>
            <p className="text-gray-400">Appointments</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-4 flex-1 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.patients_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">100</p>
            <p className="text-gray-400">Patients</p>
          </div>
        </div>
      </div>

      <Home />

      {/* <div className="flex flex-wrap gap-3 mt-5 ml-5 ">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar />
        </LocalizationProvider>
      </div> */}
    </div>
  );
};

export default DoctorDashboard;
