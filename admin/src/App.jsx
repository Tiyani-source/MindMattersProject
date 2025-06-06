import React, { useContext } from 'react'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import OrderInsights from './pages/Admin/OrderInsights';
import DoctorsList from './pages/Admin/DoctorsList';
import Login from './pages/Login';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import PaymentDashboard from './pages/Payment/PaymentDashboard';
import { PaymentProvider } from './context/PaymentContext';
import AdminProductManagement from './pages/supplyManager/ProductManagementDashboard.jsx'
import { SupplyManagerContext } from './context/SupplyManagerContext.jsx';
import SupplierProfileDashboard from './pages/supplyManager/supplierProfile.jsx';
import SupplierDashboard from './pages/supplyManager/supplyManagerDashboard.jsx';


const App = () => {

  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const { smToken } = useContext(SupplyManagerContext)
  

  return dToken || aToken || smToken ? (
    <PaymentProvider>
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllAppointments />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/order-insights' element={<OrderInsights />} />
          <Route path='/doctor-list' element={<DoctorsList />} />
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='/payment-dashboard' element={<PaymentDashboard />} />
          <Route path="/product-management" element={<AdminProductManagement />} />
          <Route path='/supplier-profile' element={<SupplierProfileDashboard />} />
          <Route path='/supplier-dashboard' element={<SupplierDashboard />} />

        </Routes>
      </div>
    </div>
    </PaymentProvider>
  ) : (
    <>
      <ToastContainer />
      <Login />
    </>
  )
}

export default App