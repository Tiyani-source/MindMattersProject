import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Chart.register(...registerables);

const districtToProvince = {
    'Colombo': 'Western Province',
    'Gampaha': 'Western Province',
    'Kalutara': 'Western Province',
    'Kandy': 'Central Province',
    'Matale': 'Central Province',
    'Nuwara Eliya': 'Central Province',
    'Galle': 'Southern Province',
    'Matara': 'Southern Province',
    'Hambantota': 'Southern Province',
    'Jaffna': 'Northern Province',
    'Kilinochchi': 'Northern Province',
    'Mannar': 'Northern Province',
    'Vavuniya': 'Northern Province',
    'Mullaitivu': 'Northern Province',
    'Trincomalee': 'Eastern Province',
    'Batticaloa': 'Eastern Province',
    'Ampara': 'Eastern Province',
    'Kurunegala': 'North Western Province',
    'Puttalam': 'North Western Province',
    'Anuradhapura': 'North Central Province',
    'Polonnaruwa': 'North Central Province',
    'Badulla': 'Uva Province',
    'Monaragala': 'Uva Province',
    'Ratnapura': 'Sabaragamuwa Province',
    'Kegalle': 'Sabaragamuwa Province'
};

const provinceColors = {
    'Western Province': '#005F73',
    'Central Province': '#0A9396',
    'Southern Province': '#94D2BD',
    'Northern Province': '#E9D8A6',
    'Eastern Province': '#EE9B00',
    'North Western Province': '#CA6702',
    'North Central Province': '#BB3E03',
    'Uva Province': '#001219',
    'Sabaragamuwa Province': '#9B2226',
};

const OrderDistrictsChart = () => {
    const [orders, setOrders] = useState([]);
    const barRef = useRef(null);
    const pieRef = useRef(null);
    const barInstance = useRef(null);
    const pieInstance = useRef(null);
    const token = localStorage.getItem('token');

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

    // Group by district and province
    const getDistrictData = () => {
        const districtCounts = {};
        orders.forEach(order => {
            const district = order.shippingInfo?.district;
            if (!district) return;
            districtCounts[district] = (districtCounts[district] || 0) + 1;
        });
        return districtCounts;
    };
    const getProvinceData = () => {
        const provinceCounts = {};
        orders.forEach(order => {
            const district = order.shippingInfo?.district;
            const province = districtToProvince[district];
            if (!province) return;
            provinceCounts[province] = (provinceCounts[province] || 0) + 1;
        });
        return provinceCounts;
    };

    // Top 3 districts and provinces
    const getTop = (obj, n = 3) => {
        return Object.entries(obj)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n);
    };

    // Render Bar and Pie charts
    useEffect(() => {
        if (!orders.length) return;
        // Bar chart for districts
        const districtData = getDistrictData();
        const barLabels = Object.keys(districtData);
        const barCounts = Object.values(districtData);
        if (barInstance.current) barInstance.current.destroy();
        if (barLabels.length && barRef.current) {
            barInstance.current = new Chart(barRef.current, {
                type: 'bar',
                data: {
                    labels: barLabels,
                    datasets: [{
                        label: 'Orders by District',
                        data: barCounts,
                        backgroundColor: barLabels.map(d => provinceColors[districtToProvince[d]] || '#ddd'),
                        borderColor: barLabels.map(d => provinceColors[districtToProvince[d]] || '#aaa'),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        x: { ticks: { font: { size: 8 } } },
                        y: { beginAtZero: true, ticks: { font: { size: 8 } } }
                    }
                }
            });
        }
        // Pie chart for provinces
        const provinceData = getProvinceData();
        const pieLabels = Object.keys(provinceData);
        const pieCounts = Object.values(provinceData);
        if (pieInstance.current) pieInstance.current.destroy();
        if (pieLabels.length && pieRef.current) {
            pieInstance.current = new Chart(pieRef.current, {
                type: 'pie',
                data: {
                    labels: pieLabels,
                    datasets: [{
                        label: 'Orders by Province',
                        data: pieCounts,
                        backgroundColor: pieLabels.map(p => provinceColors[p] || '#ddd')
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom', labels: { font: { size: 8 } } },
                        tooltip: { enabled: true }
                    }
                }
            });
        }
        return () => {
            if (barInstance.current) barInstance.current.destroy();
            if (pieInstance.current) pieInstance.current.destroy();
        };
    }, [orders]);

    // Top stats
    const topDistricts = getTop(getDistrictData());
    const topProvinces = getTop(getProvinceData());

    // Simple SVG map (dots for provinces)
    const provinceDotMap = (
        <svg viewBox="0 0 200 80" width="100%" height="40" className="my-1">
            {/* Western */}
            <circle cx="30" cy="40" r="7" fill={provinceColors['Western Province']} />
            {/* Central */}
            <circle cx="60" cy="25" r="7" fill={provinceColors['Central Province']} />
            {/* Southern */}
            <circle cx="60" cy="60" r="7" fill={provinceColors['Southern Province']} />
            {/* Northern */}
            <circle cx="170" cy="15" r="7" fill={provinceColors['Northern Province']} />
            {/* Eastern */}
            <circle cx="170" cy="55" r="7" fill={provinceColors['Eastern Province']} />
            {/* North Western */}
            <circle cx="100" cy="30" r="7" fill={provinceColors['North Western Province']} />
            {/* North Central */}
            <circle cx="130" cy="30" r="7" fill={provinceColors['North Central Province']} />
            {/* Uva */}
            <circle cx="120" cy="60" r="7" fill={provinceColors['Uva Province']} />
            {/* Sabaragamuwa */}
            <circle cx="90" cy="60" r="7" fill={provinceColors['Sabaragamuwa Province']} />
        </svg>
    );

    // PDF Download Handler
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text('Order Geography Report', 14, 16);
        doc.setFontSize(10);
        // Top stats
        doc.text(`Top Districts: ${topDistricts.map(([d, c]) => `${d} (${c})`).join(', ') || 'N/A'}`, 14, 26);
        doc.text(`Top Provinces: ${topProvinces.map(([p, c]) => `${p.replace(' Province','')} (${c})`).join(', ') || 'N/A'}`, 14, 32);
        // Analysis
        if (topProvinces.length > 0) {
            doc.text(`Province with most orders: ${topProvinces[0][0].replace(' Province','')} (${topProvinces[0][1]})`, 14, 40);
        }
        if (topDistricts.length > 0) {
            doc.text(`District with most orders: ${topDistricts[0][0]} (${topDistricts[0][1]})`, 14, 46);
        }
        // Table for all provinces
        const provinceData = getProvinceData();
        autoTable(doc, {
            startY: 54,
            head: [['Province', 'Order Count']],
            body: Object.entries(provinceData).map(([p, c]) => [p.replace(' Province',''), c]),
        });
        // Table for all districts
        const districtData = getDistrictData();
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 6,
            head: [['District', 'Order Count']],
            body: Object.entries(districtData).map(([d, c]) => [d, c]),
        });
        doc.save('order_geography_report.pdf');
    };

    return (
        <div className="space-y-2">
            {/* Map Dots */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500">Province Map:</span>
                <div className="flex-1">{provinceDotMap}</div>
            </div>
            {/* Charts */}
            <div className="flex flex-col md:flex-row gap-2 w-full" style={{ minHeight: '300px' }}>
                <div className="w-full md:w-2/3 h-[250px]">
                    <h4 className="text-[10px] font-semibold text-gray-700 mb-1">By District</h4>
                    <div className="bg-white rounded shadow p-1 h-full flex items-center justify-center">
                        <canvas ref={barRef} style={{ maxWidth: '100%', height: '100%' }}></canvas>
                    </div>
                </div>
                <div className="w-full md:w-1/3 h-[250px]">
                    <h4 className="text-[10px] font-semibold text-gray-700 mb-1">By Province</h4>
                    <div className="bg-white rounded shadow p-1 flex items-center justify-center h-full">
                        <canvas ref={pieRef} style={{ maxWidth: '100%', height: '100%' }}></canvas>
                    </div>
                </div>
            </div>
            {/* Report Section */}
            <div className="mt-8 text-xs space-y-2 bg-gray-50 rounded p-3 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-gray-700 border-b pb-1">Top Districts</h3>
                        {topDistricts.map(([district, count], index) => (
                            <div key={district} className="flex justify-between items-center">
                                <span className="text-gray-600">{district}</span>
                                <span className="font-medium text-blue-600">{count} orders</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-gray-700 border-b pb-1">Top Provinces</h3>
                        {topProvinces.map(([province, count], index) => (
                            <div key={province} className="flex justify-between items-center">
                                <span className="text-gray-600">{province.replace(' Province', '')}</span>
                                <span className="font-medium text-blue-600">{count} orders</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-2 pt-2 border-t">
                    {topProvinces.length > 0 && (
                        <div className="mb-1">
                            <span className="font-medium text-gray-700">Highest Volume:</span> {topProvinces[0][0].replace(' Province', '')} with {topProvinces[0][1]} orders
                        </div>
                    )}
                    {topDistricts.length > 0 && (
                        <div className="mb-1">
                            <span className="font-medium text-gray-700">Top District:</span> {topDistricts[0][0]} with {topDistricts[0][1]} orders
                        </div>
                    )}
                    {topProvinces.length > 1 && (
                        <div>
                            <span className="font-medium text-gray-700">Order Concentration:</span> {((topProvinces[0][1] / orders.length) * 100).toFixed(1)}% of all orders are from {topProvinces[0][0].replace(' Province', '')}
                        </div>
                    )}
                </div>
                <button 
                    onClick={handleDownloadPDF} 
                    className="mt-2 w-full px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF Report
                </button>
            </div>
        </div>
    );
};

export default OrderDistrictsChart; 