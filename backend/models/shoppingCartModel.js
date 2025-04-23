import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // reference to Product model
    required: true,
  },
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: [1, "Quantity cannot be less than 1"] 
  },
});

const shoppingCartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // reference to User model
    required: true,
    unique: true, // one cart per user
  },
  items: { 
    type: [cartItemSchema], 
    default: [] 
  },
}, { timestamps: true });

const shoppingCartModel = mongoose.models.shoppingcart || mongoose.model("shoppingcart", shoppingCartSchema);

export default shoppingCartModel;