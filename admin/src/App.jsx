import React, { useContext } from "react";
import { DoctorContext } from "./context/DoctorContext";
import { AdminContext } from "./context/AdminContext";
import { UniversityContext } from "./context/UniversityContext";

import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import OrderInsights from './pages/Admin/OrderInsights';
import DoctorsList from "./pages/Admin/DoctorsList";
import Login from "./pages/Login";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorProfile from "./pages/Doctor/DoctorProfile";

import PatientRequests from "./pages/Doctor/PatientRequests";
import PatientFeedback from "./pages/Doctor/PatientFeedback";
import DoctorUserProfile from "./pages/Doctor/UsrProfile";
import AdminProfile from "./pages/Admin/AdminProfile";
import AdminDashboard from "./pages/Admin/AdminDashBoard";
import UniversityDashboard from "./pages/University/UDashboard";

import Requests from "./pages/Admin/Requests";
import AddUni from "./pages/Admin/AddUni";
import StudentList from "./pages/Doctor/studentList";

import PaymentDashboard from './pages/Payment/PaymentDashboard';
import { PaymentProvider } from './context/PaymentContext';
import AdminProductManagement from './pages/supplyManager/ProductManagementDashboard.jsx'
import { SupplyManagerContext } from './context/SupplyManagerContext.jsx';
import SupplierProfileDashboard from './pages/supplyManager/supplierProfile.jsx';
import SupplierDashboard from './pages/supplyManager/supplyManagerDashboard.jsx';

import ChatEmbed from "./components/ChatEmbed";

const App = () => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);
  const { uToken } = useContext(UniversityContext);
  const { smToken } = useContext(SupplyManagerContext)

  return dToken || aToken || uToken || smToken? (
    <PaymentProvider>
    <div className="bg-[#F8F9FD]">
      <ToastContainer />
      <Navbar />
      <div className="flex items-start mt-11 ">
        <Sidebar />
        <div className="ml-72 w-full">
          <Routes>
            <Route path="/" element={<></>} />
            <Route path="/all-appointments" element={<AllAppointments />} />
            <Route path="/add-doctor" element={<AddDoctor />} />
            <Route path='/order-insights' element={<OrderInsights />} />
            <Route path="/doctor-list" element={<DoctorsList />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route  path="/doctor-appointments" element={<DoctorAppointments />}/>
            <Route path="/doctor-profile" element={<DoctorProfile />} />
            <Route path="/patient-requests" element={<PatientRequests />} />
            <Route path="/patient-feedback" element={<PatientFeedback />} />
            <Route path="/doctor-user-profile" element={<DoctorUserProfile />} />
            <Route path="/admin-profile" element={<AdminProfile />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/add-uni" element={<AddUni />} />
            <Route path="/uni-dashboard" element={<UniversityDashboard />} />
            <Route path="/student-list" element={<StudentList />} />
            <Route path='/payment-dashboard' element={<PaymentDashboard />} />
            <Route path="/product-management" element={<AdminProductManagement />} />
            <Route path='/supplier-profile' element={<SupplierProfileDashboard />} />
            <Route path='/supplier-dashboard' element={<SupplierDashboard />} />
            <Route path="/doctor-chat" element={<ChatEmbed />} />
          

            

          </Routes>
        </div>
      </div>
    </div>
    </PaymentProvider>
  ) : (
    <>
      <ToastContainer />
      <Login />
    </>
  );
};

export default App;
