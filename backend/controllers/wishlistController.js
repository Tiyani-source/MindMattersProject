import wishlistModel from '../models/wishlistModel.js';

// API to get user's wishlist
const getWishlist = async (req, res) => {
  try {
      const wishlist = await wishlistModel.findOne({ userId: req.user._id }).populate('items.productId');

      if (!wishlist) {
          return res.json({ success: true, items: [] });
      }

      res.json({ success: true, data: wishlist });
  } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
  }
};

// API to add an item to wishlist
const addToWishlist = async (req, res) => {
  try {
      const { productId, name, price } = req.body;

      if (!productId || !name || !price) {
          return res.json({ success: false, message: 'Missing product details' });
      }

      let wishlist = await wishlistModel.findOne({ userId: req.user._id });

      if (!wishlist) {
          wishlist = new wishlistModel({
              userId: req.user._id,
              items: [{ productId, name, price }]
          });
      } else {
          const itemExists = wishlist.items.some(item =>
              item.productId.toString() === productId.toString()
          );

          if (itemExists) {
              return res.json({ success: false, message: 'Item already in wishlist' });
          }

          wishlist.items.push({ productId, name, price });
      }

      await wishlist.save();
      res.json({ success: true, data: wishlist });
  } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
  }
};


// API to remove an item from wishlist
const removeFromWishlist = async (req, res) => {
  try {
      const { productId } = req.params;

      const wishlist = await wishlistModel.findOne({ userId: req.user._id });

      if (!wishlist) {
          return res.json({ success: false, message: 'Wishlist not found' });
      }

      wishlist.items = wishlist.items.filter(item =>
          item.productId.toString() !== productId.toString()
      );

      await wishlist.save();

      res.json({ success: true, data: wishlist });
  } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
  }
};

export {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};