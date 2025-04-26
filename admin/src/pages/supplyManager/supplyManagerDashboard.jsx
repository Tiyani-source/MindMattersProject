import React, { useState, useEffect, useContext } from 'react';
import { SupplyManagerContext } from '../../context/SupplyManagerContext';
import { Container, Row, Col, Card, Table, Button, ProgressBar, Dropdown, Badge } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Package, AlertTriangle, ShoppingBag, Truck, DollarSign, RefreshCw } from 'react-feather';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const SupplierDashboard = () => {
  const { supplyManager } = useContext(SupplyManagerContext);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSuppliers: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    monthlyExpense: 0,
    recentActivity: [],
    categoryDistribution: [],
    monthlyData: []
  });
  
  const [timeRange, setTimeRange] = useState('This Month');
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Use full URL if backend is on a different port (adjust as needed)
        const response = await axios.get(`${API_URL}/api/products`);
        console.log('API Response:', response.data); // Debug the response

        // Ensure products is an array; fallback to empty array if not
        const products = Array.isArray(response.data) ? response.data : response.data?.data || [];

        // Process the product data
        const totalProducts = products.length;
        const lowStockProducts = products.filter(p => p.stock < 10).length;
        const totalSuppliers = [...new Set(products.map(p => p.courier))].length;
        const recentActivity = products
          .slice(0, 4)
          .map((p, index) => ({
            id: p._id,
            type: 'Product Added',
            name: p.name,
            quantity: p.stock,
            date: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: p.stock > 0 ? 'Completed' : 'Pending'
          }));

        const categoryDistribution = [
          { name: 'Electronics', value: products.filter(p => p.desc?.includes('electronics')).length },
          { name: 'Hardware', value: products.filter(p => p.desc?.includes('hardware')).length },
          { name: 'Safety', value: products.filter(p => p.desc?.includes('safety')).length },
          { name: 'Raw Materials', value: products.filter(p => p.desc?.includes('materials')).length },
          { name: 'Others', value: products.length - 
            (products.filter(p => p.desc?.includes('electronics')).length +
             products.filter(p => p.desc?.includes('hardware')).length +
             products.filter(p => p.desc?.includes('safety')).length +
             products.filter(p => p.desc?.includes('materials')).length) }
        ].filter(cat => cat.value > 0);

        const monthlyData = [
          { name: 'Jan', incoming: 65, outgoing: 45 },
          { name: 'Feb', incoming: 78, outgoing: 52 },
          { name: 'Mar', incoming: 82, outgoing: 70 },
          { name: 'Apr', incoming: 70, outgoing: 60 },
          { name: 'May', incoming: 85, outgoing: 65 },
          { name: 'Jun', incoming: 90, outgoing: 75 }
        ];

        setAnalytics({
          totalProducts,
          lowStockProducts,
          totalSuppliers,
          pendingOrders: 17,
          monthlyRevenue: 157500,
          monthlyExpense: 124600,
          recentActivity,
          categoryDistribution,
          monthlyData
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const StatCard = ({ icon, title, value, trend, trendValue, color }) => (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between">
          <div>
            <h6 className="text-muted mb-1">{title}</h6>
            <h3 className="mb-2">{value}</h3>
            {trend && (
              <div className={`d-flex align-items-center text-${color}`}>
                {trend === 'up' ? 
                  <TrendingUp size={16} className="me-1" /> : 
                  <TrendingDown size={16} className="me-1" />
                }
                <small>{trendValue}% from last month</small>
              </div>
            )}
          </div>
          <div 
            className={`d-flex align-items-center justify-content-center bg-${color}-subtle rounded-circle`}
            style={{ width: '50px', height: '50px' }}
          >
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 mt-10">Supply Analytics Dashboard</h2>
          <p className="text-muted">
            Welcome back, {supplyManager?.name || 'Supply Manager'}!
          </p>
        </div>
        <div className="d-flex gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="time-range-dropdown">
              {timeRange}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setTimeRange('Today')}>Today</Dropdown.Item>
              <Dropdown.Item onClick={() => setTimeRange('This Week')}>This Week</Dropdown.Item>
              <Dropdown.Item onClick={() => setTimeRange('This Month')}>This Month</Dropdown.Item>
              <Dropdown.Item onClick={() => setTimeRange('This Year')}>This Year</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="primary" className="d-flex align-items-center">
            <RefreshCw size={16} className="me-2" /> Refresh Data
          </Button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col md={6} lg={3}>
          <StatCard 
            icon={<Package size={24} className="text-primary" />}
            title="Total Products" 
            value={analytics.totalProducts.toLocaleString()}
            trend="up"
            trendValue="8.5"
            color="primary"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard 
            icon={<AlertTriangle size={24} className="text-danger" />}
            title="Low Stock Items" 
            value={analytics.lowStockProducts}
            trend="down"
            trendValue="3.2"
            color="danger"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard 
            icon={<Truck size={24} className="text-success" />}
            title="Total Suppliers" 
            value={analytics.totalSuppliers}
            trend="up"
            trendValue="2.4"
            color="success"
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard 
            icon={<ShoppingBag size={24} className="text-warning" />}
            title="Pending Orders" 
            value={analytics.pendingOrders}
            trend="up"
            trendValue="5.7"
            color="warning"
          />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Inventory Flow</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incoming" name="Incoming Stock" fill="#0088FE" />
                  <Bar dataKey="outgoing" name="Outgoing Stock" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Product Categories</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Inventory Activity</h5>
              <Button variant="link" className="text-decoration-none p-0">View All</Button>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Activity</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div 
                              className={`rounded-circle bg-${
                                activity.type.includes('Added') ? 'success' : 
                                activity.type.includes('Alert') ? 'danger' : 
                                activity.type.includes('Order') ? 'primary' : 'info'
                              }-subtle p-2 me-2`}
                            >
                              <Package size={16} className={`text-${
                                activity.type.includes('Added') ? 'success' : 
                                activity.type.includes('Alert') ? 'danger' : 
                                activity.type.includes('Order') ? 'primary' : 'info'
                              }`} />
                            </div>
                            <div>
                              <p className="mb-0 fw-medium">{activity.type}</p>
                              <small className="text-muted">{activity.date}</small>
                            </div>
                          </div>
                        </td>
                        <td>{activity.name}</td>
                        <td>{activity.quantity}</td>
                        <td>
                          <Badge 
                            className={`rounded-pill px-2 py-1 bg-${
                              activity.status === 'Completed' ? 'success' : 
                              activity.status === 'Pending' ? 'warning' : 'info'
                            }-subtle text-${
                              activity.status === 'Completed' ? 'success' : 
                              activity.status === 'Pending' ? 'warning' : 'info'
                            }`}
                          >
                            {activity.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Supply Budget Overview</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h6 className="text-muted mb-1">Monthly Revenue</h6>
                  <h3 className="mb-0">${analytics.monthlyRevenue.toLocaleString()}</h3>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Monthly Expenses</h6>
                  <h3 className="mb-0">${analytics.monthlyExpense.toLocaleString()}</h3>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Budget Usage</span>
                  <span>{Math.round((analytics.monthlyExpense / analytics.monthlyRevenue) * 100)}%</span>
                </div>
                <ProgressBar now={Math.round((analytics.monthlyExpense / analytics.monthlyRevenue) * 100)} />
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Low Stock Items</span>
                  <span>{Math.round((analytics.lowStockProducts / analytics.totalProducts) * 100)}%</span>
                </div>
                <ProgressBar variant="warning" now={Math.round((analytics.lowStockProducts / analytics.totalProducts) * 100)} />
              </div>
              
              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Order Fulfillment</span>
                  <span>86%</span>
                </div>
                <ProgressBar variant="success" now={86} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SupplierDashboard;