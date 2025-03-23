import express from 'express';
import { getSupportTickets, getSupportTicketById, addSupportTicket, addSupportResponse } from '../controllers/supportTicketController.js';
import authUser from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(authUser, getSupportTickets)
  .post(authUser, addSupportTicket);

router.route('/:id')
  .get(authUser, getSupportTicketById)
  .post(authUser, addSupportResponse);

export default router;