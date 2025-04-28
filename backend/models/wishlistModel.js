import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  color: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: null
  }
});

const wishlistSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true 
  },
  items: { 
    type: [wishlistItemSchema], 
    default: [] 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const wishlistModel = mongoose.models.wishlist || mongoose.model("wishlist", wishlistSchema);

export default wishlistModel;