import React, { useContext, useEffect, useState } from 'react';
import { PaymentContext } from '../../context/PaymentContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, Legend
} from 'recharts';

const PaymentDashboard = () => {
    const { pToken, paymentData, getPaymentData, completePayment, refundPayment, removeRecord } = useContext(PaymentContext);
    const { currency } = useContext(AppContext);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [chartView, setChartView] = useState("all"); // "all", "weekly", "monthly"

    useEffect(() => {
        getPaymentData();
    }, [pToken]);

    useEffect(() => {
        if (paymentData) {
            const term = searchTerm.toLowerCase();
            setFilteredData(
                paymentData.latestPayments.filter(
                    (item) =>
                        item.name.toLowerCase().includes(term) ||
                        item.status.toLowerCase().includes(term) ||
                        (item.therapyName && item.therapyName.toLowerCase().includes(term)) ||
                        (item.therapyId && item.therapyId.toLowerCase().includes(term))
                )
            );
        }
    }, [paymentData, searchTerm]);

    const exportToCSV = () => {
        if (!filteredData || filteredData.length === 0) {
            alert("No data to export.");
            return;
        }

        const csvData = filteredData.map(item => ({
            Name: item.name,
            Therapy: item.therapyName || item.therapyId || "N/A",
            Amount: `${currency} ${item.amount}`,
            Status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
            Therapy_Completed: item.therapyCompleted ? "Yes" : "No",
            Removed: item.removed ? "Yes" : "No",
            Date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "Payment_Data.csv");
    };

    // Pie chart data for payment status
    const pieData = [
        { name: "Succeeded", value: filteredData.filter(p => p.status === "succeeded").length },
        { name: "Failed", value: filteredData.filter(p => p.status !== "succeeded").length }
    ];

    const COLORS = ['#4CAF50', '#F44336'];
    const PIE_COLORS = ['#4CAF50', '#F44336', '#2196F3', '#FF9800', '#9C27B0'];

    // Group earnings by therapy
    const therapyMap = {};
    filteredData.forEach(p => {
        const key = p.therapyName || p.therapyId || "Unknown Therapy";
        if (!therapyMap[key]) {
            therapyMap[key] = 0;
        }
        therapyMap[key] += p.amount;
    });
    const barData = Object.entries(therapyMap)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5); // Show top 5 therapies

    // Generate time series data for line chart
    const generateTimeSeriesData = () => {
        if (!paymentData || !paymentData.latestPayments || paymentData.latestPayments.length === 0) {
            return [];
        }

        const paymentsWithDates = paymentData.latestPayments
            .filter(p => p.createdAt)
            .map(p => ({
                ...p,
                date: new Date(p.createdAt)
            }));

        // Sort by date
        paymentsWithDates.sort((a, b) => a.date - b.date);

        // Group by time period based on view
        const timeMap = {};
        const successMap = {};
        const failureMap = {};

        paymentsWithDates.forEach(payment => {
            let timeKey;
            if (chartView === "weekly") {
                // Group by week (using ISO week date)
                const year = payment.date.getFullYear();
                const weekNumber = getWeekNumber(payment.date);
                timeKey = `Week ${weekNumber}, ${year}`;
            } else if (chartView === "monthly") {
                // Group by month
                timeKey = payment.date.toLocaleString('default', { month: 'short', year: 'numeric' });
            } else {
                // Group by day (default)
                timeKey = payment.date.toLocaleDateString();
            }

            if (!timeMap[timeKey]) {
                timeMap[timeKey] = 0;
                successMap[timeKey] = 0;
                failureMap[timeKey] = 0;
            }

            timeMap[timeKey] += payment.amount || 0;
            
            if (payment.status === "succeeded") {
                successMap[timeKey] += payment.amount || 0;
            } else {
                failureMap[timeKey] += payment.amount || 0;
            }
        });

        return Object.keys(timeMap).map(date => ({
            date,
            totalAmount: timeMap[date],
            successAmount: successMap[date],
            failureAmount: failureMap[date]
        }));
    };

    const getWeekNumber = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const week1 = new Date(d.getFullYear(), 0, 4);
        return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };

    const lineData = generateTimeSeriesData();

    // Group payments by therapy type for advanced pie chart
    const therapyTypeMap = {};
    filteredData.forEach(p => {
        // This is a simplified example - you would need to map therapies to categories in a real app
        const therapyType = p.therapyType || "Other";
        if (!therapyTypeMap[therapyType]) {
            therapyTypeMap[therapyType] = 0;
        }
        therapyTypeMap[therapyType]++;
    });
    
    // Create pie chart data
    const advancedPieData = Object.entries(therapyTypeMap).map(([name, value]) => ({
        name,
        value
    }));

    return paymentData && (
        <div className='m-5'>

            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl font-bold">Payment Dashboard</h1>
                <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={exportToCSV}
                >
                    Download CSV
                </button>
            </div>

            {/* Stats */}
            <div className='flex flex-wrap gap-5 justify-center'>
                <div className='flex items-center gap-3 bg-white p-4 min-w-52 rounded border-2 border-gray-100 hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.earning_icon} alt="Earnings" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{currency} {paymentData.totalEarnings}</p>
                        <p className='text-gray-400'>Total Earnings</p>
                    </div>
                </div>
                <div className='flex items-center gap-3 bg-white p-4 min-w-52 rounded border-2 border-gray-100 hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.transactions_icon} alt="Transactions" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{paymentData.totalTransactions}</p>
                        <p className='text-gray-400'>Total Transactions</p>
                    </div>
                </div>
                <div className='flex items-center gap-3 bg-white p-4 min-w-52 rounded border-2 border-gray-100 hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.pending_icon} alt="Pending Payments" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{paymentData.pendingPayments}</p>
                        <p className='text-gray-400'>Pending Payments</p>
                    </div>
                </div>
                <div className='flex items-center gap-3 bg-white p-4 min-w-52 rounded border-2 border-gray-100 hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.earning_icon} alt="Success Rate" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>
                            {paymentData.totalTransactions ? 
                                `${Math.round((filteredData.filter(p => p.status === "succeeded").length / paymentData.totalTransactions) * 100)}%` : 
                                '0%'
                            }
                        </p>
                        <p className='text-gray-400'>Success Rate</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
                <div className="flex-grow">
                    <input
                        type="text"
                        placeholder="Search by name, status, or therapy..."
                        className="px-4 py-2 border rounded w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-600">Chart View:</span>
                    <select 
                        className="border px-3 py-2 rounded bg-white"
                        value={chartView}
                        onChange={(e) => setChartView(e.target.value)}
                    >
                        <option value="all">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
            </div>

            {/* Line Chart for Payment Trends */}
            <div className="bg-white p-6 rounded shadow mt-6">
                <h2 className="font-semibold mb-4">Payment Trends Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="totalAmount" stroke="#8884d8" name="Total Amount" />
                        <Line type="monotone" dataKey="successAmount" stroke="#4CAF50" name="Successful Payments" />
                        <Line type="monotone" dataKey="failureAmount" stroke="#F44336" name="Failed Payments" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="font-semibold mb-4">Payment Status Distribution</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie 
                                data={pieData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={80}
                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="font-semibold mb-4">Top 5 Therapies by Earnings</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="amount" fill="#8884d8" name="Amount" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="font-semibold mb-4">Therapy Types</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie 
                                data={advancedPieData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={80}
                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {advancedPieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Latest Payments Table */}
            <div className='bg-white mt-6 p-6 rounded shadow'>
                <div className='flex items-center gap-3 px-4 py-4 border-b'>
                    <img src={assets.list_icon} alt="Latest Payments" />
                    <p className='font-semibold text-lg'>Latest Payments</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse mt-4 text-center">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-3">User</th>
                                <th className="border p-3">Therapy Name / ID</th>
                                <th className="border p-3">Amount</th>
                                <th className="border p-3">Status</th>
                                <th className="border p-3">Date</th>
                                <th className="border p-3">Therapy Session</th>
                                <th className="border p-3">Remove Record</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.slice(0, 10).map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border p-3 flex items-center gap-3 justify-center">
                                        <img className='rounded-full w-10' src={`https://ui-avatars.com/api/?name=${item.name}`} alt="User" />
                                        <span>{item.name}</span>
                                    </td>
                                    <td className="border p-3">{item.therapyName || item.therapyId || "N/A"}</td>
                                    <td className="border p-3">{currency} {item.amount}</td>
                                    <td className="border p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            item.status === "succeeded" ? "bg-green-100 text-green-800" : 
                                            item.status === "processing" ? "bg-blue-100 text-blue-800" : 
                                            "bg-red-100 text-red-800"
                                        }`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="border p-3">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                                    </td>
                                    <td className="border p-3">
                                        {!item.therapyCompleted ? (
                                            <>
                                                <button 
                                                    className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                                                    onClick={() => completePayment(item._id)}
                                                >
                                                    Done
                                                </button>
                                                <button 
                                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                                    onClick={() => refundPayment(item._id)}
                                                >
                                                    Refund
                                                </button>
                                            </>
                                        ) : (
                                            <span className="bg-gray-100 px-2 py-1 rounded">Completed</span>
                                        )}
                                    </td>
                                    <td className="border p-3">
                                        <button 
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            onClick={() => removeRecord(item._id)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentDashboard;