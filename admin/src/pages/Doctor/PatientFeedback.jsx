import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { Star, StarHalf } from "lucide-react";
import { motion } from "framer-motion";

const initialRatings = [
  { id: 1, rating: 8, review: "Great session!", month: "January" },
  { id: 2, rating: 9, review: "Very understanding.", month: "January" },
  { id: 3, rating: 7, review: "Good but could be better.", month: "February" },
  { id: 4, rating: 10, review: "Outstanding!", month: "March" },
  { id: 5, rating: 6, review: "Average experience.", month: "April" },
  { id: 6, rating: 8, review: "Helpful and kind.", month: "April" },
  { id: 7, rating: 9, review: "Professional.", month: "May" },
  { id: 8, rating: 7, review: "Nice overall.", month: "May" },
  { id: 9, rating: 10, review: "Amazing session!", month: "June" },
  { id: 10, rating: 9, review: "Loved it!", month: "June" },
];

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#845EC2",
  "#D65DB1",
  "#FF6F91",
  "#FFC75F",
  "#F9F871",
  "#2C73D2",
];

const PatientFeedbackPage = () => {
  const [ratings] = useState(initialRatings);
  const [filterMonth, setFilterMonth] = useState("All");

  const filteredRatings =
    filterMonth === "All"
      ? ratings
      : ratings.filter((r) => r.month === filterMonth);

  const ratingDistribution = Array.from({ length: 10 }, (_, i) => ({
    rating: `${i + 1} Star${i === 0 ? "" : "s"}`,
    count: filteredRatings.filter((r) => r.rating === i + 1).length,
  }));

  const months = ["January", "February", "March", "April", "May", "June"];
  const avgRatings = months.map((month) => {
    const inMonth = filteredRatings.filter((r) => r.month === month);
    const avg = inMonth.reduce((sum, r) => sum + r.rating, 0) / inMonth.length;
    return {
      month,
      average: parseFloat(avg.toFixed(2)) || 0,
      total: inMonth.length,
    };
  });

  const feedbackTrend = filteredRatings.map((r, i) => ({
    session: `Session ${i + 1}`,
    rating: r.rating,
  }));

  const summaryStats = {
    totalReviews: filteredRatings.length,
    averageRating: (
      filteredRatings.reduce((a, b) => a + b.rating, 0) / filteredRatings.length
    ).toFixed(1),
    highest: filteredRatings.reduce(
      (a, b) => (a.rating > b.rating ? a : b),
      filteredRatings[0] || {}
    ),
  };

  return (
    <motion.div
      className="p-6 max-w-screen-xl mx-auto space-y-12 text-gray-800"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl font-bold text-center mt-4">
        Patient Feedback Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-100 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold">🧾 Total Reviews</h3>
          <p className="text-3xl font-bold mt-2">{summaryStats.totalReviews}</p>
        </div>
        <div className="bg-green-100 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold">⭐ Average Rating</h3>
          <p className="text-3xl font-bold mt-2">
            {summaryStats.averageRating || 0} / 10
          </p>
        </div>
        <div className="bg-purple-100 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold">🏆 Top Feedback</h3>
          <p className="text-md mt-1">
            "{summaryStats.highest?.review || "No data"}"
          </p>
          <p className="mt-1 text-sm text-gray-600">
            ({summaryStats.highest?.rating || "-"}/10)
          </p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold">📅 Filtered Month</h3>
          <p className="text-xl font-bold mt-2">{filterMonth}</p>
        </div>
      </div>

      <div className="w-full mt-4">
        <select
          className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="All">All Months</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          className="bg-white p-6 rounded-xl shadow"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-xl font-semibold mb-4">📊 Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ratingDistribution}
                dataKey="count"
                nameKey="rating"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {ratingDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-xl font-semibold mb-4">
            📅 Avg Rating Per Month
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgRatings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

    
      </div>

      <motion.div
        className="bg-gradient-to-br from-pink-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-2xl font-bold mb-4 text-center text-indigo-700">
          📝 Detailed Patient Reviews
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 border">
            <thead className="bg-indigo-100">
              <tr>
                <th className="p-3">Rating</th>
                <th className="p-3">Review</th>
                <th className="p-3">Month</th>
              </tr>
            </thead>
            <tbody>
              {filteredRatings.map((entry) => {
                const full = Math.floor(entry.rating / 2);
                const half = entry.rating % 2 >= 1 ? 1 : 0;
                return (
                  <tr
                    key={entry.id}
                    className="border-b even:bg-white odd:bg-indigo-50"
                  >
                    <td className="p-3 flex items-center gap-1">
                      {[...Array(full)].map((_, i) => (
                        <Star
                          key={`f-${i}`}
                          size={16}
                          className="text-yellow-500 fill-yellow-500"
                        />
                      ))}
                      {half > 0 && (
                        <StarHalf
                          size={16}
                          className="text-yellow-500 fill-yellow-500"
                        />
                      )}
                      {[...Array(5 - full - half)].map((_, i) => (
                        <Star
                          key={`e-${i}`}
                          size={16}
                          className="text-gray-300 fill-gray-300"
                        />
                      ))}
                    </td>
                    <td className="p-3 italic">"{entry.review}"</td>
                    <td className="p-3 font-semibold">{entry.month}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
        <motion.div
          className="bg-white p-6 rounded-xl shadow"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-xl font-semibold mb-4">📈 Rating Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={feedbackTrend}>
              <XAxis dataKey="session" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#00C49F"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-xl font-semibold mb-4">
            🌀 Monthly Feedback Intensity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={avgRatings}>
              <PolarGrid />
              <PolarAngleAxis dataKey="month" />
              <Radar
                dataKey="total"
                stroke="#FF6F91"
                fill="#FF6F91"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default PatientFeedbackPage;
