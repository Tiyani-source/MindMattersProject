import express from 'express';
import { loginSupplyManager, signupSupplyManager } from '../controllers/supplyManagerController.js';
import authUser from '../middleware/authMiddleware.js';
import supplyManagerModel from '../models/supplyManagerModel.js';

const smRouter = express.Router();


smRouter.route('/login')
  .post(loginSupplyManager);

smRouter.route('/signUp')
  .post(signupSupplyManager);

smRouter.route('/profile')
  .get(authUser,async (req, res) => {
    try {
      const supplyManager = await supplyManagerModel.findById(req.user.id).select('-password');
      if (!supplyManager) {
        return res.status(404).json({ success: false, message: 'Supply Manager not found' });
      }
      res.json({ success: true, supplyManager });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

export default smRouter;