import React, { useContext } from "react";
import { DoctorContext } from "./context/DoctorContext";
import { AdminContext } from "./context/AdminContext";
import { UniversityContext } from "./context/UniversityContext";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
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
const App = () => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);
  const { uToken } = useContext(UniversityContext);

  return dToken || aToken || uToken ? (
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

            

          </Routes>
        </div>
      </div>
    </div>
  ) : (
    <>
      <ToastContainer />
      <Login />
    </>
  );
};

export default App;
