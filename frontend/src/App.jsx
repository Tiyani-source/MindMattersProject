import React from 'react';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import Appointment from './pages/Appointment';
import MyAppointments from './pages/MyAppointments';
import MyProfile from './pages/MyProfile';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify';
import DoctorSignUp from './pages/DoctorSignUp';
import StudentSignUp from './SignUpForms/StudentSignUp';
import PatientSignUp from './SignUpForms/PatientSignUpForm';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App = () => {
  return (
    <GoogleOAuthProvider clientId="1098024355377-jsa2abgn5buq1gisom9s7l3sat8v2m5n.apps.googleusercontent.com">
      <div className='mx-4 sm:mx-[10%]'>
        <ToastContainer />
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/login' element={<Login />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/appointment/:docId' element={<Appointment />} />
          <Route path='/my-appointments' element={<MyAppointments />} />
          <Route path='/my-profile' element={<MyProfile />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/doctor-signup' element={<DoctorSignUp />} />
          <Route path='/student-signup' element={<StudentSignUp />} />
          <Route path='/patient-signup' element={<PatientSignUp />} />
        </Routes>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
