// routes/feedbackRoute.js
import express from "express";
import { getAllFeedback } from "../controllers/patientFeedbackController.js";

const patientFeedbackRouter = express.Router();

patientFeedbackRouter.get("/all", getAllFeedback);

export default patientFeedbackRouter;