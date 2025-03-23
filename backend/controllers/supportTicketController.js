import SupportTicket from '../models/supportTicketModel.js';
import SupportResponse from '../models/supportResponseModel.js';

// Get all support tickets for the authenticated user
const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get support ticket by ID
const getSupportTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('user');
    if (ticket) {
      const responses = await SupportResponse.find({ ticket: req.params.id }).populate('user');
      res.json({ ticket, responses });
    } else {
      res.status(404).json({ message: 'Support ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new support ticket
const addSupportTicket = async (req, res) => {
  const { title, description } = req.body;

  const ticket = new SupportTicket({
    user: req.user._id,
    title,
    description
  });

  try {
    const newTicket = await ticket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add a response to a support ticket
const addSupportResponse = async (req, res) => {
  const { message } = req.body;

  const response = new SupportResponse({
    ticket: req.params.id,
    user: req.user._id,
    message
  });

  try {
    const newResponse = await response.save();
    res.status(201).json(newResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  getSupportTickets,
  getSupportTicketById,
  addSupportTicket,
  addSupportResponse
};