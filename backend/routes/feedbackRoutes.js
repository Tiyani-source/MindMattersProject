import express from 'express';
import { getFeedbacks, getFeedbackById, addFeedback, updateFeedback, deleteFeedback, getFeedbacksByProductID } from '../controllers/feedbackController.js';
import authUser from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getFeedbacks)
  .post(authUser, addFeedback);

router.route('/product/:id')
  .get(getFeedbacksByProductID)

router.route('/:id')
  .get(getFeedbackById)
  .put(authUser, updateFeedback)
  .delete(authUser, deleteFeedback);

export default router;