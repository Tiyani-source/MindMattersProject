import express from 'express';
import {addDoctorRequest, viewDoctorRequests, deleteDoctorRequest, addDoctorFromRequest }from '../controllers/dRequestController.js';
import authAdmin from '../middleware/authAdmin.js'; // Assuming only admins can approve/reject
import upload from '../middleware/uploadMiddleware.js';

const dRequestRouter = express.Router();

// Route to submit a doctor request
dRequestRouter.post("/submit", upload.single("documents"), addDoctorRequest);
dRequestRouter.get("/view", viewDoctorRequests);
dRequestRouter.delete("/delete/:id",deleteDoctorRequest);
dRequestRouter.post("/approve/:id",addDoctorFromRequest);



export default dRequestRouter;
