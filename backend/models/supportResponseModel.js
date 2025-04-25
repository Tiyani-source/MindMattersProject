import mongoose from 'mongoose';

const supportResponseSchema = mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SupportTicket'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const SupportResponse = mongoose.model('SupportResponse', supportResponseSchema);

export default SupportResponse;