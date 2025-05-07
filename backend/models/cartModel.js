import mongoose from "mongoose"

const cartItemSchema = new mongoose.Schema({
  productId: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: [1, "Quantity cannot be less than 1"]
  },
  color: {
    type: String,
    required: false
  },
  size: {
    type: String,
    required: false
  }
})

const cartSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  items: { 
    type: [cartItemSchema], 
    default: [] 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
})

const cartModel = mongoose.models.cart || mongoose.model("cart", cartSchema)

export default cartModel




