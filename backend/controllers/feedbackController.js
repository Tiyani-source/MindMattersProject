import Feedback from '../models/feedbackModel.js';
import Product from '../models/productModel.js';

const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({});
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getFeedbacksByProductID = async (req, res) => {
  try {
    const feedback = await Feedback.find({product : req.params.id});
    if (feedback) {
      res.json(feedback);
    } else {
      res.status(404).json({ message: 'Feedback not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (feedback) {
      res.json(feedback);
    } else {
      res.status(404).json({ message: 'Feedback not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addFeedback = async (req, res) => {
  const { product, rating, comment } = req.body;
  const feedback = new Feedback({
    user: req.user.id,
    product,
    rating,
    comment
  });

  try {
    const newFeedback = await feedback.save();
    updateProductFeedback(product);
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (feedback) {
      if (feedback.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized' });
      }
      feedback.rating = req.body.rating || feedback.rating;
      feedback.comment = req.body.comment || feedback.comment;

      const updatedFeedback = await feedback.save();
      updateProductFeedback(feedback.product);
      res.json(updatedFeedback);
    } else {
      res.status(404).json({ message: 'Feedback not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (feedback) {
      if (feedback.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized' });
      }
      await feedback.remove();
      updateProductFeedback(feedback.product);
      res.json({ message: 'Feedback removed' });
    } else {
      res.status(404).json({ message: 'Feedback not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProductFeedback = async (productId) => {
  try {
    const feedbacks = await Feedback.find({ product: productId });
    const avgRating = feedbacks.reduce((acc, item) => item.rating + acc, 0) / feedbacks.length;

    const product = await Product.findById(productId);
    if (product) {
      product.feedback = avgRating;
      await product.save();
    }
  } catch (error) {
    console.error(error);
  }
};

export {
  getFeedbacks,
  getFeedbackById,
  addFeedback,
  updateFeedback,
  getFeedbacksByProductID,
  deleteFeedback
};