import React, { useContext } from 'react'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import {TherapistContext} from './context/TherapistContext'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import TherapistsList from './pages/Admin/TherapistsList';
import AddTherapist from './pages/Admin/AddTherapist';
import Login from './pages/Login';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import TherapistDashboard from './pages/Therapist/TherapistDashboard';
import MySchedule from './pages/Therapist/MySchedule'
import TherapistAppointments from './pages/Therapist/TherapistAppointments'
import TherapistSchedule from './pages/Therapist/TherapistSchedule'
import ClientsManage from './pages/Therapist/ClientsManage'
import OnlineLinkUpload from './pages/Therapist/OnlineLinkUpload'

const App = () => {

  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const { tToken } = useContext(TherapistContext)
  

  return dToken || aToken || tToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllAppointments />} />
          <Route path='/add-therapist' element={<AddTherapist />} />
          <Route path='/therapist-list' element={<TherapistsList />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctor-list' element={<DoctorsList />} />
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/therapist-dashboard' element={<TherapistDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='my-schedule' element={<MySchedule />} />
          <Route path='/therapist-appointments' element={<TherapistAppointments />} />
          <Route path='/therapist-schedule' element={<TherapistSchedule />} />
          <Route path='/clients-manage' element={<ClientsManage />} />
          <Route path='/online-appointments' element={<OnlineLinkUpload />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <ToastContainer />
      <Login />
    </>
  )
}

export default App