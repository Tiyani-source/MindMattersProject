'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const salesData = [
  {
    name: 'Jan',
    sessions: 190,
    profit: 2400,
  },
  {
    name: 'Feb',
    sessions: 290,
    profit: 1398,
  },
  {
    name: 'Mar',
    sessions: 98,
    profit: 2000,
  },
  {
    name: 'Apr',
    sessions: 88,
    profit: 2780,
  },
  {
    name: 'May',
    sessions: 200,
    profit: 1890,
  },
  {
    name: 'Jun',
    sessions: 100,
    profit: 2390,
  },
];

const LineChartComponent = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={salesData}
        margin={{
          right: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="sessions" stroke="#3b82f6" />
        <Line type="monotone" dataKey="profit" stroke="#8b5cf6" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-slate-900 flex flex-col gap-4 rounded-md">
        <p className="text-medium text-lg">{label}</p>
        <p className="text-sm text-blue-400">
          Revenue:
          <span className="ml-2">${payload[0].value}</span>
        </p>
        {payload[1] && (
          <p className="text-sm text-indigo-400">
            Profit:
            <span className="ml-2">${payload[1].value}</span>
          </p>
        )}
      </div>
    );
  }

  return null;
};
