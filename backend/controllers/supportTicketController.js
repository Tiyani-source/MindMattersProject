import SupportTicket from '../models/supportTicketModel.js';
import SupportResponse from '../models/supportResponseModel.js';

// Get all support tickets for the authenticated user
const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResponses = async (req, res) => {
  try {
    const tickets = await SupportResponse.find({ticket:req.params.id});
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

// Delete a support ticket
const deleteSupportTicket = async (req, res) => {
  const { id } = req.params; // Assuming the ticket ID is passed as a parameter

  try {
    // Find the ticket by ID
    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if the user is authorized to delete the ticket
    if (ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this ticket' });
    }

    // Delete the ticket
    await SupportTicket.findByIdAndDelete(id);
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add a new support ticket
const addSupportTicket = async (req, res) => {
  const { title, description } = req.body;


  const ticket = new SupportTicket({
    user: req.user.id,
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


// Edit an existing support ticket
const editSupportTicket = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    // Find the ticket by ID
    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if the user is authorized to edit the ticket
    if (ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to edit this ticket' });
    }

    // Update the ticket's fields
    ticket.title = title || ticket.title;
    ticket.description = description || ticket.description;

    // Save the updated ticket
    const updatedTicket = await ticket.save();
    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add a response to a support ticket
const addSupportResponse = async (req, res) => {
  const { message } = req.body;

  const response = new SupportResponse({
    ticket: req.params.id,
    user: req.user.id,
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
  addSupportResponse,
  editSupportTicket,
  getResponses,
  deleteSupportTicket
};