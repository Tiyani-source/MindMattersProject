
'use client';
import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, University, Activity } from 'lucide-react';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const colorStyles = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div whileHover={{ scale: 1.05 }} className={`w-full shadow-md border-l-8 ${color} bg-white p-4 rounded-md`}>
    <div className="flex items-center gap-4">
      <Icon className="w-8 h-8 text-gray-700" />
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </div>
  </motion.div>
);

const UniversityRow = ({ name, contact, programs, sessions, color }) => {
  const colorClass = colorStyles[color] || 'bg-gray-100 text-gray-800';

  return (
    <div className="flex items-center justify-between py-2 border-b">
      <div className="flex flex-col w-1/4">
        <div className="text-sm font-semibold">{name}</div>
        <div className="text-xs text-gray-500">{contact}</div>
      </div>
      <div className="text-sm w-1/4">{programs}</div>
      <div className="text-sm w-1/4">{sessions}</div>
      <div className={`text-xs w-1/6 px-2 py-1 rounded-full text-center ${colorClass}`}>
        {color.charAt(0).toUpperCase() + color.slice(1)}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const [studentCount, setStudentCount] = React.useState(0);
  const [doctorCount, setDoctorCount] = React.useState(0);
 
   React.useEffect(() => {
     
     const fetchStudentCount = async () => {
       try {
         const res = await fetch('http://localhost:4000/api/student/count');
         const data = await res.json();
         setStudentCount(data.count || 0);
       } catch (err) {
         console.error('Failed to fetch student count:', err);
       }
     };

     const fetchDoctorCount = async () => {
       try {
         const res = await fetch('http://localhost:4000/api/doctor/count');
         const data = await res.json();
         setDoctorCount(data.count || 0);
       } catch (err) {
         console.error('Failed to fetch student count:', err);
       }
     };
 
 
     fetchDoctorCount();
     fetchStudentCount();
   }, []);
 const months = ['January', 'February', 'March', 'April', 'May', 'June'];
  const avgEarnings = [1200, 1300, 1100, 1500, 1400, 1600];
  const activeUsers = [300, 320, 310, 340, 350, 370];
  const patientCounts = [150, 170, 160, 180, 175, 190];
  const sessionAttendance = [
    { id: 0, value: 65, label: 'Attended' },
    { id: 1, value: 25, label: 'Missed' },
    { id: 2, value: 10, label: 'Cancelled' },
  ];
  const sessionsPerMonth = [800, 850, 900, 880, 950, 970];

  const earningsData = months.map((month, index) => ({
    name: month.slice(0, 3),
    value: avgEarnings[index],
  }));

  return (
    <div className="p-6 grid gap-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-black-700 mt-10">System Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={Users} label="Students" value={studentCount} color="border-blue-500" />
      <StatCard icon={Activity} label="Doctors" value={doctorCount} color="border-green-500" />
        <StatCard icon={University} label="Universities" value="35" color="border-purple-500" />
        <StatCard icon={CalendarCheck} label="Sessions this Month" value="870" color="border-pink-500" />
      </div>

      <div className="bg-white rounded-md shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">User Status</h2>
        <BarChart
          height={300}
          borderRadius={6}
          series={[
            { data: patientCounts, label: 'Patients', id: 'patientId', color: primary },
            { data: activeUsers, label: 'Active Users', id: 'activeId', color: secondary },
          ]}
          xAxis={[
            {
              data: months,
              scaleType: 'band',
              categoryGapRatio: 0.8,
              barGapRatio: 0.8,
            },
          ]}
        />
      </div>

      <div className="bg-white rounded-md shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Sri Lankan Universities (Mental Health Program)</h2>
        <div className="grid gap-2">
          <UniversityRow name="University of Colombo" contact="Dr. Perera" programs="Psych Counseling" sessions="120" color="green" />
          <UniversityRow name="University of Moratuwa" contact="Prof. Silva" programs="Student Wellness" sessions="98" color="yellow" />
          <UniversityRow name="University of Jaffna" contact="Dr. Sinnarajah" programs="Teletherapy" sessions="75" color="red" />
          <UniversityRow name="University of Ruhuna" contact="Dr. Lakmal" programs="In-person Counseling" sessions="110" color="blue" />
        </div>
      </div>

      <div className="bg-white rounded-md shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Average Earnings (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ReLineChart data={earningsData}>
            <defs>
              <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8884d8" />
                <stop offset="100%" stopColor="#82ca9d" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#colorLine)"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </ReLineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-md shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Sessions Per Month</h2>
          <BarChart
            height={300}
            series={[{ data: sessionsPerMonth, label: 'Sessions', color: '#3b82f6' }]}
            xAxis={[{ data: months, scaleType: 'band' }]}
          />
        </div>

        <div className="bg-white rounded-md shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Session Attendance</h2>
          <PieChart series={[{ data: sessionAttendance }]} height={300} />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Manage Users
        </button>
      </div>
    </div>
  );
}
