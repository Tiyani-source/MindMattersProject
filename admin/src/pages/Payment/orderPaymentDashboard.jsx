import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const OrderPaymentDashboard = () => {
  // State for search, filter, and data
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refundData, setRefundData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  
  // Table pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Fetch order data from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/orders/all');
        
        if (response.data.success) {
          // Transform order data to match the dashboard format
          const formattedOrders = response.data.orders.map((order, index) => ({
            key: index.toString(),
            orderId: order.orderId,
            customerName: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
            amount: `$${(order.totalAmount / 100).toFixed(2)}`, // Assuming amount is in cents
            paymentStatus: mapOrderStatusToPaymentStatus(order.status),
            date: new Date(order.date).toISOString().split('T')[0],
            rawData: order // Keep the raw data for additional details if needed
          }));
          
          setPaymentData(formattedOrders);
          setFilteredData(formattedOrders);
          setError(null);
        } else {
          setError('Failed to fetch order data');
        }
      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('Error connecting to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Fetch refund and revenue data
  useEffect(() => {
    // Fetch refund data
    const fetchRefunds = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/refunds');
        if (response.data.success) {
          setRefundData(response.data.refunds);
        }
      } catch (err) {
        console.error('Error fetching refund data:', err);
      }
    };

    // Fetch revenue data
    const fetchRevenue = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/revenue');
        if (response.data.success) {
          setRevenueData(response.data.revenue);
        }
      } catch (err) {
        console.error('Error fetching revenue data:', err);
      }
    };

    fetchRefunds();
    fetchRevenue();
  }, []);
  
  // Map order status to payment status
  const mapOrderStatusToPaymentStatus = (status) => {
    switch (status) {
      case 'Delivered':
        return 'Completed';
      case 'Pending':
      case 'Shipped':
        return 'Pending';
      case 'Cancelled':
        return 'Failed';
      default:
        return 'Pending';
    }
  };
  
  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(paymentData);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = paymentData.filter(item => 
        item.orderId.toLowerCase().includes(lowercasedSearch) ||
        item.customerName.toLowerCase().includes(lowercasedSearch) ||
        item.amount.toLowerCase().includes(lowercasedSearch) ||
        item.paymentStatus.toLowerCase().includes(lowercasedSearch) ||
        item.date.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, paymentData]);

  // Pagination calculation
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / pageSize);
  
  // Download report functionality
  const downloadCSV = () => {
    // Create CSV content
    const headers = ['Order ID', 'Customer Name', 'Amount', 'Payment Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => 
        [
          item.orderId,
          item.customerName,
          item.amount,
          item.paymentStatus,
          item.date
        ].join(',')
      )
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Download PDF report with jsPDF
  const downloadPDF = () => {
    try {
      // Import jsPDF dynamically to avoid SSR issues
      import('jspdf').then(({ default: jsPDF }) => {
        import('jspdf-autotable').then(() => {
          const doc = new jsPDF();
          
          // Add title
          doc.setFontSize(18);
          doc.text('Order Payment Report', 14, 22);
          
          // Add report metadata
          doc.setFontSize(11);
          doc.setTextColor(100);
          doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
          doc.text(`Total Orders: ${filteredData.length}`, 14, 36);
          
          // Add the table
          doc.autoTable({
            head: [['Order ID', 'Customer Name', 'Amount', 'Payment Status', 'Date']],
            body: filteredData.map(item => [
              item.orderId,
              item.customerName,
              item.amount,
              item.paymentStatus, 
              item.date
            ]),
            startY: 45,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [66, 139, 202] }
          });
          
          // Save the PDF
          doc.save(`order_payment_report_${new Date().toISOString().split('T')[0]}.pdf`);
        });
      }).catch(err => {
        console.error('Error loading jsPDF:', err);
        alert('Could not generate PDF. Please ensure jsPDF is installed.');
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error generating PDF report. Please try again.');
    }
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    const statusCounts = {};
    
    // Count occurrences of each status
    filteredData.forEach(item => {
      const status = item.paymentStatus;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Convert to array format
    return Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));
  };
  
  const chartData = prepareChartData();
  
  // Status badge styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Custom pie chart using SVG
  const PieChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }
    
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;

    // Pre-defined colors
    const getColor = (status) => {
      switch (status) {
        case 'Completed': return '#10B981'; // green
        case 'Pending': return '#F59E0B';   // yellow/amber
        case 'Failed': return '#EF4444';    // red
        default: return '#6B7280';          // gray
      }
    };

    return (
      <svg viewBox="0 0 100 100">
        <g transform="translate(50,50)">
          {chartData.map((item, i) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            const endAngle = startAngle + angle;
            
            // Calculate slice path
            const x1 = Math.cos((startAngle - 90) * (Math.PI / 180)) * 40;
            const y1 = Math.sin((startAngle - 90) * (Math.PI / 180)) * 40;
            const x2 = Math.cos((endAngle - 90) * (Math.PI / 180)) * 40;
            const y2 = Math.sin((endAngle - 90) * (Math.PI / 180)) * 40;
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = `M 0 0 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            // For label positioning
            const labelAngle = startAngle + angle / 2;
            const labelX = Math.cos((labelAngle - 90) * (Math.PI / 180)) * 20;
            const labelY = Math.sin((labelAngle - 90) * (Math.PI / 180)) * 20;
            
            // Save the ending angle to be the next slice's start angle
            const currentStartAngle = startAngle;
            startAngle = endAngle;
            
            return (
              <g key={i}>
                <path d={pathData} fill={getColor(item.name)} />
                <text 
                  x={labelX} 
                  y={labelY} 
                  textAnchor="middle" 
                  fontSize="4"
                  fill="white"
                  fontWeight="bold"
                  dominantBaseline="middle"
                >
                  {(percentage * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
        </g>
        {/* Legend */}
        <g transform="translate(50, 90)">
          {chartData.map((item, i) => (
            <g key={i} transform={`translate(${(i - chartData.length / 2 + 0.5) * 25}, 0)`}>
              <rect width="6" height="6" fill={getColor(item.name)} />
              <text x="8" y="5" fontSize="4" textAnchor="start">{item.name}</text>
            </g>
          ))}
        </g>
      </svg>
    );
  };

  // Search icon SVG
  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  // Loading spinner
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  // Error message
  const ErrorMessage = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );

  // Dashboard summary cards
  const DashboardSummary = () => {
    // Calculate summary metrics
    const totalOrders = filteredData.length;
    const completedOrders = filteredData.filter(item => item.paymentStatus === 'Completed').length;
    const pendingOrders = filteredData.filter(item => item.paymentStatus === 'Pending').length;
    const failedOrders = filteredData.filter(item => item.paymentStatus === 'Failed').length;
    
    // Calculate total revenue (removing the $ sign and converting to number)
    const totalRevenue = filteredData.reduce((sum, item) => {
      const amount = parseFloat(item.amount.replace('$', ''));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Completed Payments</p>
          <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Pending Payments</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>
      </div>
    );
  };

  // RefundTable component
  const RefundTable = () => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-4">Refund Details</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {refundData.length > 0 ? (
                refundData.map((refund, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{refund.refundId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{refund.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${refund.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{refund.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No refunds available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // LineGraph component
  const LineGraph = () => {
    const chartData = {
      labels: revenueData.map(item => item.date),
      datasets: [
        {
          label: 'Revenue',
          data: revenueData.map(item => item.revenue),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Revenue ($)',
          },
        },
      },
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-4">Revenue Over Time</h4>
        <Line data={chartData} options={options} />
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h3 className="text-xl font-bold">Order Payment Dashboard</h3>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Download Buttons */}
            <div className="flex gap-2">
              <button
                onClick={downloadCSV}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={loading || error}
              >
                Export CSV
              </button>
              <button
                onClick={downloadPDF}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading || error}
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
        
        {/* Error message if any */}
        {error && <ErrorMessage message={error} />}
        
        {/* Dashboard Summary */}
        {!loading && !error && <DashboardSummary />}
        
        {/* Dashboard Layout - Chart and Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Pie Chart */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-700 mb-4">Payment Status Distribution</h4>
            <div className="h-64">
              {loading ? <LoadingSpinner /> : <PieChart />}
            </div>
          </div>
          
          {/* Table Container */}
          <div className="lg:col-span-2">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length > 0 ? (
                        currentItems.map((item) => (
                          <tr key={item.key} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.orderId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(item.paymentStatus)}`}>
                                {item.paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No results found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              
                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{filteredData.length > 0 ? indexOfFirstItem + 1 : 0}</span> to{' '}
                        <span className="font-medium">{Math.min(indexOfLastItem, filteredData.length)}</span> of{' '}
                        <span className="font-medium">{filteredData.length}</span> results
                        {searchTerm && ` (filtered from ${paymentData.length} total)`}
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          &laquo; Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              page === currentPage
                                ? 'bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages || totalPages === 0}
                          className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 ${(currentPage === totalPages || totalPages === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Next &raquo;
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Additional Components: RefundTable and LineGraph */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <RefundTable />
          </div>
          <div>
            <LineGraph />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentDashboard;