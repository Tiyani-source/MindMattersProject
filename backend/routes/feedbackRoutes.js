import express from 'express';
import { getFeedbacks, getFeedbackById, addFeedback, updateFeedback, deleteFeedback } from '../controllers/feedbackController.js';
import authUser from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getFeedbacks)
  .post(authUser, addFeedback);

router.route('/:id')
  .get(getFeedbackById)
  .put(authUser, updateFeedback)
  .delete(authUser, deleteFeedback);

export default router;