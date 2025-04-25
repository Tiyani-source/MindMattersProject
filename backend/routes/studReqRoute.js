import express from 'express';
import {addStudentRequest,approveStudentRequest,deleteStudentRequest,viewStudentRequests}from '../controllers/studentRequestController.js';
import {authAdmin} from '../middleware/authAdmin.js'; // Assuming only admins can approve/reject
import upload from '../middleware/uploadMiddleware.js';

const studRequestRouter = express.Router();

// Route to submit a doctor request
studRequestRouter.post("/submit", upload.single("documents"), addStudentRequest);
studRequestRouter.get("/view", viewStudentRequests);
studRequestRouter.delete("/delete/:id",deleteStudentRequest);
studRequestRouter.post("/approve/:id",  approveStudentRequest);




export default studRequestRouter;
