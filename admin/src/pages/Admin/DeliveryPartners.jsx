import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Truck, Edit2, Star, CheckCircle2, XCircle, Download, BarChart2, PieChart, Activity } from 'lucide-react';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { useContext } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import DeliveryPartnersReport from '../../components/DeliveryPartnersReport';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DeliveryPartners = () => {
  const { aToken } = useContext(AdminContext);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);
  const [selectedPartnerOrders, setSelectedPartnerOrders] = useState([]);
  const [selectedPartnerType, setSelectedPartnerType] = useState(''); // 'active' or 'completed'
  const [newPartner, setNewPartner] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    isAvailable: true,
    province: 'Western Province',
    rating: 0,
    totalDeliveries: 0
  });
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState({
    totalPartners: 0,
    availablePartners: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    provinceDistribution: {},
    vehicleTypeDistribution: {},
    performanceMetrics: []
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);

  // Remove the provinces array with coordinates
  const provinces = [
    'Western Province',
    'Central Province',
    'Southern Province',
    'Northern Province',
    'Eastern Province',
    'North Western Province',
    'North Central Province',
    'Uva Province',
    'Sabaragamuwa Province'
  ];

  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const fetchDeliveryPartners = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/deliveryPartners', {
        headers: {
          Authorization: `Bearer ${aToken}`
        }
      });
      setDeliveryPartners(response.data.data);
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/deliveryPartners', newPartner, {
        headers: {
          Authorization: `Bearer ${aToken}`
        }
      });
      setShowAddForm(false);
      setNewPartner({
        name: '',
        email: '',
        phone: '',
        vehicleType: 'Bike',
        vehicleNumber: '',
        isAvailable: true,
        province: 'Western Province',
        rating: 0,
        totalDeliveries: 0
      });
      fetchDeliveryPartners();
    } catch (error) {
      console.error('Error adding delivery partner:', error);
    }
  };

  const handleEditPartner = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:4000/api/deliveryPartners/${editingPartner._id}`, editingPartner, {
        headers: {
          Authorization: `Bearer ${aToken}`
        }
      });
      setShowEditForm(false);
      setEditingPartner(null);
      fetchDeliveryPartners();
    } catch (error) {
      console.error('Error updating delivery partner:', error);
    }
  };

  const handleDeletePartner = async (id) => {
    setPartnerToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeletePartner = async () => {
    if (!partnerToDelete) return;
    try {
      await axios.delete(`http://localhost:4000/api/deliveryPartners/${partnerToDelete}`, {
        headers: {
          Authorization: `Bearer ${aToken}`
        }
      });
      setShowDeleteModal(false);
      setPartnerToDelete(null);
      fetchDeliveryPartners();
    } catch (error) {
      console.error('Error deleting delivery partner:', error);
      setShowDeleteModal(false);
      setPartnerToDelete(null);
    }
  };

  const handleEditClick = (partner) => {
    setEditingPartner({ ...partner });
    setShowEditForm(true);
  };

  const handleLocationChange = (provinceName) => {
    setEditingPartner({
      ...editingPartner,
      province: provinceName
    });
  };

  const generateReport = () => {
    console.log('Generating report...');
    console.log('Delivery Partners:', deliveryPartners);
    
    const provinceData = {};
    const vehicleData = {};
    const performanceData = [];

    deliveryPartners.forEach(partner => {
      // Province distribution
      provinceData[partner.province] = (provinceData[partner.province] || 0) + 1;
      
      // Vehicle type distribution
      vehicleData[partner.vehicleType] = (vehicleData[partner.vehicleType] || 0) + 1;
      
      // Performance metrics
      performanceData.push({
        name: partner.name,
        totalDeliveries: partner.totalDeliveries || 0,
        activeDeliveries: partner.assignedOrdersCount || 0,
        completedDeliveries: partner.completedOrdersCount || 0,
        rating: partner.rating || 0
      });
    });

    const newReportData = {
      totalPartners: deliveryPartners.length,
      availablePartners: deliveryPartners.filter(p => p.isAvailable).length,
      activeDeliveries: deliveryPartners.reduce((acc, p) => acc + (p.assignedOrdersCount || 0), 0),
      completedDeliveries: deliveryPartners.reduce((acc, p) => acc + (p.completedOrdersCount || 0), 0),
      provinceDistribution: provinceData,
      vehicleTypeDistribution: vehicleData,
      performanceMetrics: performanceData
    };

    console.log('Generated Report Data:', newReportData);
    setReportData(newReportData);
    setShowReport(true);
    console.log('Report state updated:', { showReport, reportData: newReportData });
  };

  const downloadReport = () => {
    const reportContent = `
Delivery Partners Report
Generated on: ${new Date().toLocaleString()}

Summary:
- Total Partners: ${reportData.totalPartners}
- Available Partners: ${reportData.availablePartners}
- Active Deliveries: ${reportData.activeDeliveries}
- Completed Deliveries: ${reportData.completedDeliveries}

Province Distribution:
${Object.entries(reportData.provinceDistribution)
  .map(([province, count]) => `- ${province}: ${count}`)
  .join('\n')}

Vehicle Type Distribution:
${Object.entries(reportData.vehicleTypeDistribution)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

Performance Metrics:
${reportData.performanceMetrics
  .map(p => `
Partner: ${p.name}
- Total Deliveries: ${p.totalDeliveries}
- Active Deliveries: ${p.activeDeliveries}
- Completed Deliveries: ${p.completedDeliveries}
- Rating: ${p.rating}/5
  `)
  .join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-partners-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  

  const handleViewOrders = async (partnerId, type) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/orders/all`, {
        headers: {
          Authorization: `Bearer ${aToken}`
        }
      });

      if (response.data.success) {
        const allOrders = response.data.orders;
        const partnerOrders = allOrders.filter(order => {
          if (order.deliveryPartner && order.deliveryPartner._id === partnerId) {
            if (type === 'active') {
              return order.deliveryStatus === 'Assigned';
            } else if (type === 'completed') {
              return order.deliveryStatus === 'Delivered';
            }
          }
          return false;
        });

        setSelectedPartnerOrders(partnerOrders);
        setSelectedPartnerType(type);
        setShowOrdersPopup(true);
      }
    } catch (error) {
      console.error('Error fetching partner orders:', error);
    }
  };

  const OrdersPopup = () => {
    if (!showOrdersPopup) return null;

    const partner = deliveryPartners.find(p => p._id === selectedPartnerOrders[0]?.deliveryPartner?._id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {selectedPartnerType === 'active' ? 'Active' : 'Completed'} Orders for {partner?.name}
            </h2>
            <button
              onClick={() => setShowOrdersPopup(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            {selectedPartnerOrders.length > 0 ? (
              selectedPartnerOrders.map(order => (
                <div key={order._id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Order ID: {order.orderId}</p>
                      <p className="text-sm text-gray-600">Date: {new Date(order.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Status: {order.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Customer: {order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                      <p className="text-sm text-gray-600">Location: {order.shippingInfo.district}</p>
                      <p className="text-sm text-gray-600">Amount: LKR {order.totalAmount}</p>
                    </div>
                  </div>
                  {order.estimatedDelivery && (
                    <p className="text-sm text-gray-600 mt-2">
                      Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No {selectedPartnerType} orders found</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Partners</h1>
            <p className="text-gray-600">Manage your delivery partners and their information</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={generateReport}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <BarChart2 size={20} />
              Generate Report
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Add New Partner
            </button>
          </div>
        </div>

        {/* Report Section */}
        {showReport && (
          <div className="mb-8">
            <DeliveryPartnersReport 
              reportData={reportData}
              onDownload={downloadReport}
              onClose={() => setShowReport(false)}
            />
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Partners</p>
                <p className="text-2xl font-bold text-gray-900">{deliveryPartners.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Truck className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available Now</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveryPartners.filter(partner => partner.isAvailable).length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveryPartners.reduce((acc, partner) => acc + (partner.assignedOrdersCount || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <MapPin className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveryPartners.reduce((acc, partner) => acc + (partner.completedOrdersCount || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Star className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Partners Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Partner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Deliveries</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryPartners.map((partner) => (
                  <tr key={partner._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 text-sm font-medium">{partner.name.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{partner.name}</div>
                          <div className="text-xs text-gray-500">ID: {partner._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 truncate max-w-[140px]">{partner.email}</div>
                      <div className="text-xs text-gray-500">{partner.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Truck className="text-gray-400" size={14} />
                        <span className="text-sm text-gray-900">{partner.vehicleType}</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[100px]">{partner.vehicleNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="text-gray-400" size={14} />
                        <span className="text-sm text-gray-900 truncate max-w-[100px]">{partner.province}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                        partner.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {partner.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                      <button
                          onClick={() => handleViewOrders(partner._id, 'active')}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <Activity className="w-3 h-3" />
                          Active: {partner.assignedOrdersCount || 0}
                        </button>
                        <button
                          onClick={() => handleViewOrders(partner._id, 'completed')}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Completed: {partner.completedOrdersCount || 0}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(partner)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                          title="Edit Partner"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePartner(partner._id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Delete Partner"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Partner Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Delivery Partner</h2>
                <form onSubmit={handleAddPartner} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newPartner.email}
                      onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newPartner.phone}
                      onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                    <select
                      value={newPartner.vehicleType}
                      onChange={(e) => setNewPartner({ ...newPartner, vehicleType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="Bike">Bike</option>
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                    <input
                      type="text"
                      value={newPartner.vehicleNumber}
                      onChange={(e) => setNewPartner({ ...newPartner, vehicleNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <select
                      value={newPartner.province}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {provinces.map((province, index) => (
                        <option key={index} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      Add Partner
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Partner Modal */}
        {showEditForm && editingPartner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Delivery Partner</h2>
                <form onSubmit={handleEditPartner} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editingPartner.name}
                      onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editingPartner.email}
                      onChange={(e) => setEditingPartner({ ...editingPartner, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editingPartner.phone}
                      onChange={(e) => setEditingPartner({ ...editingPartner, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                    <select
                      value={editingPartner.vehicleType}
                      onChange={(e) => setEditingPartner({ ...editingPartner, vehicleType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="Bike">Bike</option>
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                    <input
                      type="text"
                      value={editingPartner.vehicleNumber}
                      onChange={(e) => setEditingPartner({ ...editingPartner, vehicleNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <select
                      value={editingPartner.province}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {provinces.map((province, index) => (
                        <option key={index} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Partner Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
              <div className="flex flex-col items-center">
                <XCircle className="text-red-500 mb-2" size={48} />
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Are you sure?</h2>
                <p className="text-gray-600 mb-6 text-center">Do you really want to delete this delivery partner? This action cannot be undone.</p>
                <div className="flex gap-4 w-full justify-center">
                  <button
                    onClick={() => { setShowDeleteModal(false); setPartnerToDelete(null); }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeletePartner}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        

        {/* Add OrdersPopup component */}
        <OrdersPopup />
      </div>
    </div>
  );
};

export default DeliveryPartners; 