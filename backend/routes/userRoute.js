import express from 'express';
import {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  paymentStripe,
  verifyStripe,
  bookTherapist,
  rescheduleAppointment,
  cancelTherapistAppointment,
  getUserTherapistAppointments,
  getMeetingLink
} from '../controllers/userController.js';

import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';

const userRouter = express.Router();

// Auth
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Profile
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile);

// Appointments with doctors
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.get("/appointments/therapists", authUser, getUserTherapistAppointments);
// Payments
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay);
userRouter.post("/payment-stripe", authUser, paymentStripe);
userRouter.post("/verifyStripe", authUser, verifyStripe);

// Appointments with therapists
userRouter.post("/book-therapist", authUser, bookTherapist);
userRouter.post("/reschedule-appointment", authUser, rescheduleAppointment);
userRouter.post("/cancel-appointment", authUser, cancelTherapistAppointment);
userRouter.post("/meeting-link", authUser, getMeetingLink);
userRouter.get("/appointments", authUser, getUserTherapistAppointments); // Replaces existing line

// Meeting Link
userRouter.post("/meeting-link", authUser, getMeetingLink);


export default userRouter;