import express from 'express';
import { loginAdmin, appointmentsAdmin, appointmentCancel, addDoctor, allDoctors, adminDashboard,getAdminProfile,updateAdminProfile } from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import {authAdmin }from '../middleware/authAdmin.js';
import { changeStatus } from '../controllers/orderController.js';

import upload from '../middleware/multer.js';
const adminRouter = express.Router();

adminRouter.post("/login", authAdmin)
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/all-doctors", authAdmin, allDoctors)
adminRouter.post("/change-availability", authAdmin, changeAvailablity)
adminRouter.get("/dashboard",  adminDashboard)
adminRouter.get("/profile", getAdminProfile);
adminRouter.put("/update-profile", updateAdminProfile)
adminRouter.post("/change-status", authAdmin, changeStatus)




export default adminRouter;