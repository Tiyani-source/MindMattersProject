import express from 'express';
import { getSupportTickets, getSupportTicketById, addSupportTicket, addSupportResponse, editSupportTicket ,getResponses, deleteSupportTicket} from '../controllers/supportTicketController.js';
import authUser from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(authUser, getSupportTickets)
  .post(authUser, addSupportTicket);

router.route('/:id')
  .get(authUser, getSupportTicketById)
  .put(authUser,editSupportTicket)
  .post(authUser, addSupportResponse)
  .delete(authUser,deleteSupportTicket);

  
router.route('/:id/responses')
  .get(authUser,getResponses)
export default router;