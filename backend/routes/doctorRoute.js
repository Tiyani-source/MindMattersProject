import express from 'express';
import { loginDoctor, appointmentsDoctor, appointmentCancel, doctorList, changeAvailablity, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile,deleteDoctor } from '../controllers/doctorController.js';
import {authDoctor} from '../middleware/authDoctor.js';
const doctorRouter = express.Router();

doctorRouter.post("/login", authDoctor);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel)
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor)
doctorRouter.get("/list", doctorList)
doctorRouter.post("/change-availability", authDoctor, changeAvailablity)
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete)
doctorRouter.get("/dashboard", authDoctor, doctorDashboard)
doctorRouter.get("/profile",doctorProfile)
doctorRouter.put("/update-profile", updateDoctorProfile)
doctorRouter.delete("/delete/:id", deleteDoctor);


export default doctorRouter;