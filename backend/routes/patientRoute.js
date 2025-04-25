import express from "express";
import { signup, googleAuth } from "../controllers/patientController.js";
const patientRouter =  express.Router();

patientRouter.post("/signup", signup);
patientRouter.post("/google-auth", googleAuth);

export default patientRouter;
