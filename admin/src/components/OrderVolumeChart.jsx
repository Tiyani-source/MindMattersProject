import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Chart.register(...registerables);

const OrderVolumeChart = () => {
    const [orders, setOrders] = useState([]);
    const [timeRange, setTimeRange] = useState('month');
    const [selectedMetric, setSelectedMetric] = useState('all');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Get token if needed
    const token = localStorage.getItem('token'); // or from context

    useEffect(() => {
        axios.get('http://localhost:4000/api/orders/all', token ? { headers: { Authorization: `Bearer ${token}` } } : {})
            .then(res => {
                if (res.data.success) setOrders(res.data.orders || []);
                else setOrders([]);
            })
            .catch(err => {
                setOrders([]);
                console.error('Order fetch error:', err);
            });
    }, [token]);

    useEffect(() => {
        console.log('Fetched orders:', orders);
    }, [orders]);

    // Helper: Group orders by period
    const groupOrders = (orders, range) => {
        const groups = {};
        orders.forEach(order => {
            if (!order.date) return;
            const date = new Date(order.date);
            if (isNaN(date)) return;
            let key;
            if (range === 'month') key = date.toLocaleString('default', { month: 'short' });
            else if (range === 'week') key = `W${Math.ceil(date.getDate() / 7)}`;
            else key = date.toLocaleString('default', { weekday: 'short' });
            if (!groups[key]) groups[key] = [];
            groups[key].push(order);
        });
        return groups;
    };

    // Prepare chart data
    const getChartData = () => {
        const grouped = groupOrders(orders, timeRange);
        const labels = Object.keys(grouped);
        const totalOrders = labels.map(label => grouped[label].length);
        const completedOrders = labels.map(label => grouped[label].filter(o => o.status === 'Delivered').length);
        const pendingOrders = labels.map(label => grouped[label].filter(o => o.status === 'Pending').length);
        const shippedOrders = labels.map(label => grouped[label].filter(o => o.status === 'Shipped').length);

        return {
            labels,
            datasets: [
                {
                    label: 'Total Orders',
                    data: totalOrders,
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Completed Orders',
                    data: completedOrders,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Pending Orders',
                    data: pendingOrders,
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Shipped Orders',
                    data: shippedOrders,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        };
    };

    // Chart rendering
    useEffect(() => {
        if (!orders.length) return;
        if (chartInstance.current) chartInstance.current.destroy();

        let data;
        try {
            data = getChartData();
        } catch (e) {
            console.error('Chart data error:', e);
            return;
        }

        const metricMap = { all: null, completed: 'Completed Orders', pending: 'Pending Orders', shipped: 'Shipped Orders' };
        const filterLabel = metricMap[selectedMetric];

        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.datasets.map(dataset => ({
                    ...dataset,
                    hidden: filterLabel ? dataset.label !== filterLabel : false
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { size: 10 } } },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} orders`
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { font: { size: 10 } } },
                    x: { ticks: { font: { size: 10 } } }
                }
            }
        });

        return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [orders, timeRange, selectedMetric]);

    // Growth rate
    const getGrowthRate = () => {
        const data = getChartData();
        const arr = data.datasets[0].data;
        if (arr.length < 2) return 0;
        const last = arr[arr.length - 1], prev = arr[arr.length - 2];
        return prev ? (((last - prev) / prev) * 100).toFixed(1) : 0;
    };

    // Helper: Get insights for admin
    const getInsights = () => {
        const data = getChartData();
        if (!data.labels.length) return null;
        // Find best and worst period
        const maxOrders = Math.max(...data.datasets[0].data);
        const minOrders = Math.min(...data.datasets[0].data);
        const bestPeriod = data.labels[data.datasets[0].data.indexOf(maxOrders)];
        const worstPeriod = data.labels[data.datasets[0].data.indexOf(minOrders)];
        // Calculate completion rate
        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
        const completed = data.datasets[1].data.reduce((a, b) => a + b, 0);
        const shipped = data.datasets[3].data.reduce((a, b) => a + b, 0);
        const pending = data.datasets[2].data.reduce((a, b) => a + b, 0);
        const completionRate = total ? ((completed / total) * 100).toFixed(1) : 0;
        const shippedRate = total ? ((shipped / total) * 100).toFixed(1) : 0;
        const pendingRate = total ? ((pending / total) * 100).toFixed(1) : 0;
        return {
            bestPeriod,
            worstPeriod,
            maxOrders,
            minOrders,
            completionRate,
            shippedRate,
            pendingRate,
            total
        };
    };

    const insights = getInsights();

    // Helper: Prepare table data for report
    const getTableData = () => {
        const data = getChartData();
        return data.labels.map((label, idx) => ({
            period: label,
            total: data.datasets[0].data[idx],
            completed: data.datasets[1].data[idx],
            pending: data.datasets[2].data[idx],
            shipped: data.datasets[3].data[idx],
        }));
    };

    // PDF Download Handler
    const handleDownloadPDF = () => {
        console.log('Download PDF clicked');
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text('Order Volume Report', 14, 16);
        doc.setFontSize(10);
        if (insights) {
            doc.text(`Best ${timeRange}: ${insights.bestPeriod} (${insights.maxOrders} orders)`, 14, 26);
            doc.text(`Lowest ${timeRange}: ${insights.worstPeriod} (${insights.minOrders} orders)`, 14, 32);
            doc.text(`Completion Rate: ${insights.completionRate}%`, 14, 38);
            doc.text(`Shipped Rate: ${insights.shippedRate}%`, 14, 44);
            doc.text(`Pending Rate: ${insights.pendingRate}%`, 14, 50);
            doc.text(`Total Orders in Range: ${insights.total}`, 14, 56);
        }
        autoTable(doc, {
            head: [[
                timeRange.charAt(0).toUpperCase() + timeRange.slice(1),
                'Total',
                'Completed',
                'Pending',
                'Shipped',
            ]],
            body: getTableData().map(row => [row.period, row.total, row.completed, row.pending, row.shipped]),
            startY: 62,
        });
        doc.save('order_volume_report.pdf');
    };

    if (!orders.length) {
        return <div className="text-xs text-gray-400">No order data available.</div>;
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
                <div className="flex space-x-1">
                    <button onClick={() => setTimeRange('day')} className={`px-2 py-0.5 rounded text-xs ${timeRange === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Daily</button>
                    <button onClick={() => setTimeRange('week')} className={`px-2 py-0.5 rounded text-xs ${timeRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Weekly</button>
                    <button onClick={() => setTimeRange('month')} className={`px-2 py-0.5 rounded text-xs ${timeRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Monthly</button>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => setSelectedMetric('all')} className={`px-2 py-0.5 rounded text-xs ${selectedMetric === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
                    <button onClick={() => setSelectedMetric('completed')} className={`px-2 py-0.5 rounded text-xs ${selectedMetric === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Completed</button>
                    <button onClick={() => setSelectedMetric('pending')} className={`px-2 py-0.5 rounded text-xs ${selectedMetric === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Pending</button>
                    <button onClick={() => setSelectedMetric('shipped')} className={`px-2 py-0.5 rounded text-xs ${selectedMetric === 'shipped' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Shipped</button>
                </div>
            </div>
            <div className="h-48 bg-white rounded shadow p-2">
                <canvas ref={chartRef}></canvas>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
                <span>Total: {orders.length}</span>
                <span className={getGrowthRate() >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {getGrowthRate() >= 0 ? '↑' : '↓'} {Math.abs(getGrowthRate())}% from last period
                </span>
            </div>
            {/* Insights Section */}
            {insights && (
                <div className="bg-gray-50 rounded p-2 mt-2 text-xs text-gray-700 space-y-1">
                    <div><b>Best {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}:</b> {insights.bestPeriod} ({insights.maxOrders} orders)</div>
                    <div><b>Lowest {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}:</b> {insights.worstPeriod} ({insights.minOrders} orders)</div>
                    <div><b>Completion Rate:</b> {insights.completionRate}% | <b>Shipped Rate:</b> {insights.shippedRate}% | <b>Pending Rate:</b> {insights.pendingRate}%</div>
                    <div><b>Total Orders in Range:</b> {insights.total}</div>
                    {insights.completionRate > 80 && <div className="text-green-600">Great job! Most orders are being completed.</div>}
                    {insights.pendingRate > 20 && <div className="text-yellow-600">Notice: There are a significant number of pending orders.</div>}
                    {insights.shippedRate > 30 && <div className="text-blue-600">Shipped orders are trending up.</div>}
                </div>
            )}
            {/* Data Table */}
            <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-xs text-gray-700">Detailed Data</span>
                    <button onClick={handleDownloadPDF} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">Download PDF Report</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border rounded">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-2 py-1 border">{timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}</th>
                                <th className="px-2 py-1 border">Total</th>
                                <th className="px-2 py-1 border">Completed</th>
                                <th className="px-2 py-1 border">Pending</th>
                                <th className="px-2 py-1 border">Shipped</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getTableData().map((row, idx) => (
                                <tr key={idx} className="even:bg-gray-50">
                                    <td className="px-2 py-1 border">{row.period}</td>
                                    <td className="px-2 py-1 border">{row.total}</td>
                                    <td className="px-2 py-1 border">{row.completed}</td>
                                    <td className="px-2 py-1 border">{row.pending}</td>
                                    <td className="px-2 py-1 border">{row.shipped}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderVolumeChart;