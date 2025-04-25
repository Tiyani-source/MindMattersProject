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

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const sessionData = [
  { month: "Jan", sessions: 200, students: 100 },
  { month: "Feb", sessions: 300, students: 200 },
  { month: "Mar", sessions: 500, students: 300 },
  { month: "Apr", sessions: 400, students: 120 },
  { month: "May", sessions: 200, students: 50 },
  { month: "Jun", sessions: 600, students: 200 },
];

const attendanceData = [
  { name: "Attended", value: 75 },
  { name: "Missed", value: 15 },
  { name: "Canceled", value: 10 },
];

const therapistPerformance = [
  { name: "Dr. Smith", sessions: 50 },
  { name: "Dr. Jane", sessions: 80 },
  { name: "Dr. John", sessions: 40 },
];

const UniversityDashboard = () => {
  return (
    <div className="flex flex-col  ml-10 mr-10">
      <h1 className="text-3xl font-bold mb-4 mt-10">Admin Dashboard</h1>
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

      <div className="flex flex-wrap gap-3 mt-5 ml-5 ">
        <div className="flex items-center gap-2 bg-white p-4 flex-1 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.student} alt="" />
          <div>
            <p>Students</p>
            <p className="text-xl font-semibold text-gray-600">1000</p>
            <p className="text-gray-400">Student Count</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-4 flex-1 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.university} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">University</p>
            <p className="text-gray-400">Universities Joined</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-4 flex-1 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.doctor_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">10</p>
            <p className="text-gray-400">Doctors</p>
          </div>
        </div>
      </div>

     
      {/* <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold">Total Therapists</h2>
            <p className="text-2xl font-bold">25</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold">Total Students</h2>
            <p className="text-2xl font-bold">500</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold">Total Sessions</h2>
            <p className="text-2xl font-bold">1200</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold">Utilization Rate</h2>
            <p className="text-2xl font-bold">85%</p>
          </div>
        </div> */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Sessions Per Month</h3>
          <LineChart width={400} height={250} data={sessionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sessions" stroke="#8884d8" />
            <Line type="monotone" dataKey="students" stroke="#2784d8" />
          </LineChart>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Session Attendance</h3>
          <PieChart width={400} height={250}>
            <Pie
              data={attendanceData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {attendanceData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default UniversityDashboard;
