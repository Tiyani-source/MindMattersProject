import mongoose from "mongoose"

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [
    {
      productId: { type: String, required: true },
      addedAt: { type: Date, default: Date.now }
    }
  ]
})

const wishlistModel = mongoose.models.wishlist || mongoose.model("wishlist", wishlistSchema)
export default wishlistModel








