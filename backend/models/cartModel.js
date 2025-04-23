import mongoose from "mongoose"

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  updatedAt: { type: Date, default: Date.now }
})

const cartModel = mongoose.models.cart || mongoose.model("cart", cartSchema)
export default cartModel




