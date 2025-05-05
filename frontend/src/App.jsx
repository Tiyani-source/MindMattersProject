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
import MyOrders from './pages/MyOrders'
import OrderAnalytics from './pages/OrderAnalytics';
import MyProfile from './pages/MyProfile';
import PaymentForm from './pages/PaymentForm'
import ShoppingCart from './pages/ShoppingCart'
import Checkout from './pages/Checkout'
import Wishlist from './pages/Wishlist'
import Payment from './pages/Payment'
import OrderConfirmation from './pages/OrderConfirmation'
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify';
import Store from './pages/Store'
import ProductDetails from './pages/ProductDetails';
import SupportTicketsPage from './pages/supportDesk.jsx'
import DoctorSignUp from './pages/DoctorSignUp';
import StudentSignUp from './SignUpForms/StudentSignUp';
import PatientSignUp from './SignUpForms/PatientSignUpForm';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Rechedule from './pages/Rechedule';

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
          <Route path='/store' element={<Store />} />
          <Route path='/store/:category' element={<Store />} />
          <Route path='/product/:prodId' element={<ProductDetails />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/appointment/:therapistId' element={<Appointment />} />
          <Route path='/payment/:amount/:appointmentId' element={<PaymentForm />} />
          <Route path='/my-appointments' element={<MyAppointments />} />
          <Route path='/my-orders' element={<MyOrders />} />
          <Route path="/order-analytics" element={<OrderAnalytics />} />
          <Route path='/my-profile' element={<MyProfile />} />
          <Route path='/cart' element={<ShoppingCart />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/payment' element={<Payment />} />
        <Route path='/wishlist' element={<Wishlist />} />
        <Route path='/order-confirmation' element={<OrderConfirmation />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/doctor-signup' element={<DoctorSignUp />} />
          <Route path='/student-signup' element={<StudentSignUp />} />
          <Route path='/patient-signup' element={<PatientSignUp />} />
          <Route path='/reschedule/:therapistId' element={<Rechedule />} />
          <Route path='/support-desk' element={<SupportTicketsPage />} />
        </Routes>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
