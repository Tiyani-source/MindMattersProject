import React, { useState } from "react";

import { Star, StarHalf } from "lucide-react";
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
} from "recharts";

// Example Ratings
const initialRatings = [
  {
    id: 1,
    rating: 8,
    review: "Great session! Helped me a lot.",
    month: "January",
  },
  {
    id: 2,
    rating: 9,
    review: "Very understanding and professional.",
    month: "January",
  },
  {
    id: 3,
    rating: 7,
    review: "Good experience, but could be more interactive.",
    month: "February",
  },
  {
    id: 4,
    rating: 10,
    review: "Best therapist ever! Highly recommend.",
    month: "March",
  },
  {
    id: 5,
    rating: 6,
    review: "It was fine, but I expected more.",
    month: "April",
  },
  { id: 6, rating: 8, review: "Helpful and kind.", month: "April" },
  { id: 7, rating: 9, review: "Very professional.", month: "May" },
  { id: 8, rating: 7, review: "Good experience overall.", month: "May" },
  { id: 9, rating: 10, review: "Absolutely amazing session!", month: "June" },
  { id: 10, rating: 9, review: "Great session!", month: "June" },
];

const PatientFeedbackPage = () => {
  const [ratings] = useState(initialRatings);

  // 1. Pie Chart Data - Count of Ratings
  const ratingCount = [
    {
      rating: "1 Star",
      count: ratings.filter((entry) => entry.rating === 1).length,
    },
    {
      rating: "2 Stars",
      count: ratings.filter((entry) => entry.rating === 2).length,
    },
    {
      rating: "3 Stars",
      count: ratings.filter((entry) => entry.rating === 3).length,
    },
    {
      rating: "4 Stars",
      count: ratings.filter((entry) => entry.rating === 4).length,
    },
    {
      rating: "5 Stars",
      count: ratings.filter((entry) => entry.rating === 5).length,
    },
    {
      rating: "6 Stars",
      count: ratings.filter((entry) => entry.rating === 6).length,
    },
    {
      rating: "7 Stars",
      count: ratings.filter((entry) => entry.rating === 7).length,
    },
    {
      rating: "8 Stars",
      count: ratings.filter((entry) => entry.rating === 8).length,
    },
    {
      rating: "9 Stars",
      count: ratings.filter((entry) => entry.rating === 9).length,
    },
    {
      rating: "10 Stars",
      count: ratings.filter((entry) => entry.rating === 10).length,
    },
  ];

  // 2. Bar Chart Data - Average Rating per Month
  const months = ["January", "February", "March", "April", "May", "June"];
  const averageRatingsPerMonth = months.map((month) => {
    const ratingsInMonth = ratings.filter((entry) => entry.month === month);
    const averageRating =
      ratingsInMonth.reduce((sum, entry) => sum + entry.rating, 0) /
      ratingsInMonth.length;
    return {
      month,
      averageRating: isNaN(averageRating) ? 0 : averageRating.toFixed(1),
    };
  });

  // Pie chart colors (different colors for each rating)
  const COLORS = [
    "#FFB6C1",
    "#FF69B4",
    "#FF1493",
    "#C71585",
    "#DB7093",
    "#8B008B",
    "#9B30FF",
    "#6A5ACD",
    "#483D8B",
    "#0000CD",
  ];

  // For debugging: log the processed data
  console.log("Rating Count:", ratingCount);
  console.log("Average Ratings per Month:", averageRatingsPerMonth);

  return (
    <div className="flex flex-col  ml-10 mr-10 ">
      <h2 className="text-2xl font-semibold mb-4 text-center mt-10">
        Patient Feedback Overview
      </h2>

      {/* Charts Section: Pie Chart and Bar Chart */}
      <div className="flex justify-between gap-6 mb-6">
        {/* Pie Chart - Rating Distribution */}
        <div className="w-full lg:w-1/2">
          <h3 className="text-xl font-semibold mb-2">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ratingCount}
                dataKey="count"
                nameKey="rating"
                outerRadius={120}
                fill="#8884d8"
                label
              >
                {ratingCount.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length > 0) {
                    const { name, value } = payload[0];
                    return (
                      <div>
                        <strong>{name}</strong>
                        <br />
                        Count: {value}
                        <br />
                        Percentage:{" "}
                        {((value / ratings.length) * 100).toFixed(2)}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Average Rating Per Month */}
        <div className="w-full lg:w-1/2">
          <h3 className="text-xl font-semibold mb-2">
            Average Rating Per Month
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={averageRatingsPerMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageRating" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Patient Reviews Table */}
      <div className="patient-reviews mb-6">
        <h3 className="text-xl font-semibold mb-2">Patient Reviews</h3>

        <div className="flex-grow overflow-auto">
          <table className="w-full border rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4">Rating</th>
                <th className="p-4">Review</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((entry) => {
                const fullStars = Math.floor(entry.rating / 2); // Number of full stars
                const halfStars = entry.rating % 2 >= 1 ? 1 : 0; // Check for half star
                return (
                  <tr key={entry.id} className="border-t even:bg-gray-50">
                    <td className="p-4 text-lg font-bold flex items-center gap-1">
                      {[...Array(fullStars)].map((_, i) => (
                        <Star
                          key={`full-${i}`}
                          size={16}
                          className="text-yellow-500 fill-yellow-500"
                        />
                      ))}
                      {halfStars > 0 && (
                        <StarHalf
                          size={16}
                          className="text-yellow-500 fill-yellow-500"
                        />
                      )}
                      {[...Array(5 - fullStars - halfStars)].map((_, i) => (
                        <Star
                          key={`empty-${i}`}
                          size={16}
                          className="text-gray-300 fill-gray-300"
                        />
                      ))}
                    
                    </td>
                    <td className="p-4">{entry.review}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientFeedbackPage;
