'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const salesData = [
  {
    name: 'Jan',
    revenue: 4000,
  },
  {
    name: 'Feb',
    revenue: 3000,
  },
  {
    name: 'Mar',
    revenue: 9800,
  },
  {
    name: 'Apr',
    revenue: 3908,
  },
  {
    name: 'May',
    revenue: 4800,
  },
  {
    name: 'Jun',
    revenue: 3800,
  },
];

const PieChartComponent = () => {
  // Colors for the pie segments
  const COLORS = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#fbbf24', '#8b5cf6'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Pie
          data={salesData}
          dataKey="revenue"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#3b82f6"
          paddingAngle={5}
        >
          {salesData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-slate-900 flex flex-col gap-4 rounded-md">
        <p className="text-medium text-lg">{label}</p>
        <p className="text-sm text-blue-400">
          Revenue:
          <span className="ml-2">${payload[0].value}</span>
        </p>
      </div>
    );
  }
};
