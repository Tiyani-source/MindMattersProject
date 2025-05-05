import express from 'express';
import { getUserOverviewStats } from '../controllers/userOverviewController.js';

const userOverviewRouter = express.Router();

userOverviewRouter.get('/userOverview', getUserOverviewStats);

export default userOverviewRouter;