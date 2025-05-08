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

const TableRow = ({ name, type, status }) => (
  <div className="flex justify-between text-sm py-2 border-b">
    <div className="font-medium w-1/3">{name}</div>
    <div className="text-gray-600 w-1/3">{type}</div>
    <div className="text-xs font-semibold text-center w-1/3">
      <span className={`px-2 py-1 rounded-full ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status}</span>
    </div>
  </div>
);

export default function DoctorDashboard() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const [months, setMonths] = React.useState([]);
  const [patientCounts, setPatientCounts] = React.useState([]);
  const [activeUsers, setActiveUsers] = React.useState([]);
  const [studentCount, setStudentCount] = React.useState(0);

  React.useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/user-overview/userOverview');
        const result = await response.json();
        setMonths(result.months || []);
        setPatientCounts(result.patientCounts || []);
        setActiveUsers(result.activeUsers || []);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    };

    const fetchStudentCount = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/student/count');
        const data = await res.json();
        setStudentCount(data.count || 0);
      } catch (err) {
        console.error('Failed to fetch student count:', err);
      }
    };

    fetchChartData();
    fetchStudentCount();
  }, []);

  const earningsData = months.map((month, index) => ({
    name: month.slice(0, 3),
    current: 800 + Math.floor(Math.random() * 500),
    lastYear: 700 + Math.floor(Math.random() * 500),
    twoYearsAgo: 600 + Math.floor(Math.random() * 500),
  }));

  return (
    <div className="p-6 grid gap-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 mt-10 text-black">Doctor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Patients" value={studentCount} color="border-blue-500" />
        <StatCard icon={Activity} label="Appointments" value="87" color="border-green-500" />
        <StatCard icon={University} label="Reports Filed" value="35" color="border-purple-500" />
        <StatCard icon={CalendarCheck} label="Sessions Scheduled" value="23" color="border-pink-500" />
      </div>

      <div className="bg-white rounded-md shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Monthly Patient & User Overview</h2>
        {months.length > 0 && patientCounts.length > 0 && activeUsers.length > 0 ? (
          <BarChart
            height={300}
            borderRadius={6}
            series={[
              { data: patientCounts, label: 'Patients', id: 'patientId', color: primary },
              { data: activeUsers, label: 'Active Users', id: 'activeId', color: secondary },
            ]}
            xAxis={[{
              data: months,
              scaleType: 'band',
              categoryGapRatio: 0.8,
              barGapRatio: 0.8,
            }]}
          />
        ) : (
          <p className="text-sm text-gray-400">Chart data not available.</p>
        )}
      </div>

      <div className="bg-white rounded-md shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Patients</h2>
        <div className="grid gap-2">
          <TableRow name="Anushka Perera" type="Follow-up" status="Active" />
          <TableRow name="Nimali Fernando" type="Initial Consult" status="Active" />
          <TableRow name="Sahan Gunasekara" type="Online Session" status="Inactive" />
          <TableRow name="Thisuri Jayasena" type="Therapy" status="Active" />
        </div>
      </div>

      <div className="bg-white rounded-md shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Earnings Trend</h2>
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
            <YAxis domain={[0, 'dataMax + 100']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="current" name="This Year" stroke="url(#colorLine)" strokeWidth={3} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="lastYear" name="Last Year" stroke="#f97316" strokeWidth={2} />
            <Line type="monotone" dataKey="twoYearsAgo" name="Two Years Ago" stroke="#64748b" strokeWidth={2} />
          </ReLineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Manage Patients
        </button>
      </div>
    </div>
  );
}