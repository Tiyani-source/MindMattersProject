import express from 'express';
import { getFeedbacks, getFeedbackById, addFeedback, updateFeedback, deleteFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getFeedbacks)
  .post(protect, addFeedback);

router.route('/:id')
  .get(getFeedbackById)
  .put(protect, updateFeedback)
  .delete(protect, deleteFeedback);

export default router;