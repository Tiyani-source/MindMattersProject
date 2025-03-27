import React, { useContext, useEffect, useState } from 'react';
import { PaymentContext } from '../../context/PaymentContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

const PaymentDashboard = () => {
    const { pToken, paymentData, getPaymentData, completePayment, refundPayment, removeRecord } = useContext(PaymentContext);
    const { currency } = useContext(AppContext);
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        // if (pToken) {
            getPaymentData();
        // }
    }, [pToken]);

    useEffect(() => {
        if (paymentData) {
            setFilteredData(paymentData.latestPayments);
        }
    }, [paymentData]);

    // Function to export data as CSV
    const exportToCSV = () => {
        if (!filteredData || filteredData.length === 0) {
            alert("No data to export.");
            return;
        }

        const csvData = filteredData.map(item => ({
            Name: item.name,
            Amount: `${currency} ${item.amount}`,
            Status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
            Therapy_Completed: item.therapyCompleted ? "Yes" : "No",
            Removed: item.removed ? "Yes" : "No"
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "Payment_Data.csv");
    };

    return paymentData && (
        <div className='m-5'>

            {/* Header with Download Button */}
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl font-bold">Payment Dashboard</h1>
                <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={exportToCSV}
                >
                    Download CSV
                </button>
            </div>

            {/* Dashboard Stats */}
            <div className='flex flex-wrap gap-5 justify-center'>
                <div className='flex items-center gap-3 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.earning_icon} alt="Earnings" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{currency} {paymentData.totalEarnings}</p>
                        <p className='text-gray-400'>Total Earnings</p>
                    </div>
                </div>
                <div className='flex items-center gap-3 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.transactions_icon} alt="Transactions" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{paymentData.totalTransactions}</p>
                        <p className='text-gray-400'>Total Transactions</p>
                    </div>
                </div>
                <div className='flex items-center gap-3 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.pending_icon} alt="Pending Payments" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{paymentData.pendingPayments}</p>
                        <p className='text-gray-400'>Pending Payments</p>
                    </div>
                </div>
            </div>

            {/* Latest Payments Table */}
            <div className='bg-white mt-10 p-6 rounded shadow'>
                <div className='flex items-center gap-3 px-4 py-4 border-b'>
                    <img src={assets.list_icon} alt="Latest Payments" />
                    <p className='font-semibold text-lg'>Latest Payments</p>
                </div>

                <table className="w-full border-collapse mt-4 text-center">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-3">User</th>
                            <th className="border p-3">Amount</th>
                            <th className="border p-3">Status</th>
                            <th className="border p-3">Therapy Session</th>
                            <th className="border p-3">Remove Record</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.slice(0, 5).map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="border p-3 flex items-center gap-3 justify-center">
                                    <img className='rounded-full w-10' src={`https://ui-avatars.com/api/?name=${item.name}`} alt="User" />
                                    <span>{item.name}</span>
                                </td>
                                <td className="border p-3">{currency} {item.amount}</td>
                                <td className="border p-3">
                                    <span className={`text-xs font-medium ${item.status === "succeeded" ? "text-green-500" : "text-red-400"}`}>
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </span>
                                </td>
                                <td className="border p-3">
                                    {item.therapyCompleted == false && 
                                    <button 
                                        className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                                        onClick={() => completePayment(item._id)}
                                    >
                                        Done
                                    </button>}
                                    {item.therapyCompleted == false && <button 
                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                        onClick={() => refundPayment(item._id)}
                                    >
                                        Refund
                                    </button>}
                                    {item.therapyCompleted && <span>Completed {item.therapyCompleted}</span>}
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
    );
};

export default PaymentDashboard;
