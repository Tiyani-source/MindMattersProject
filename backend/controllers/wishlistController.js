import wishlistModel from "../models/wishlistModel.js";
import Product from "../models/productModel.js";

// API to get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const wishlist = await wishlistModel.findOne({ userId });

        if (!wishlist) {
            return res.json({ success: true, wishlist: { items: [] } });
        }

        // Fetch product details for each item
        const itemsWithDetails = await Promise.all(wishlist.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
                ...item.toObject(),
                name: product?.name || 'Product not found',
                price: product?.price || 0,
                image: product?.image || null
            };
        }));

        res.json({ success: true, wishlist: { ...wishlist.toObject(), items: itemsWithDetails } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to add an item to wishlist
const addToWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId, color, size } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Missing product ID' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Validate required attributes
        if (product.colors && product.colors.length > 0 && !color) {
            return res.status(400).json({ success: false, message: 'Color is required for this product' });
        }

        if (product.sizes && product.sizes.length > 0 && !size) {
            return res.status(400).json({ success: false, message: 'Size is required for this product' });
        }

        let wishlist = await wishlistModel.findOne({ userId });

        if (!wishlist) {
            wishlist = new wishlistModel({
                userId,
                items: [{
                    productId,
                    name: product.name,
                    price: product.price,
                    color: color || null,
                    size: size || null
                }]
            });
        } else {
            const itemExists = wishlist.items.some(item => 
                item.productId.toString() === productId.toString() &&
                item.color === color &&
                item.size === size
            );

            if (itemExists) {
                return res.status(400).json({ success: false, message: 'Item already in wishlist' });
            }

            wishlist.items.push({
                productId,
                name: product.name,
                price: product.price,
                color: color || null,
                size: size || null
            });
        }

        await wishlist.save();

        // Fetch updated wishlist with product details
        const updatedWishlist = await wishlistModel.findOne({ userId });
        const itemsWithDetails = await Promise.all(updatedWishlist.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
                ...item.toObject(),
                name: product?.name || 'Product not found',
                price: product?.price || 0,
                image: product?.image || null
            };
        }));

        res.json({ success: true, wishlist: { ...updatedWishlist.toObject(), items: itemsWithDetails } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to remove an item from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;

        const wishlist = await wishlistModel.findOne({ userId });

        if (!wishlist) {
            return res.json({ success: true, wishlist: { items: [] } });
        }

        // Convert both IDs to strings for comparison
        const productIdStr = productId.toString();
        wishlist.items = wishlist.items.filter(item => 
            item.productId.toString() !== productIdStr
        );
        
        await wishlist.save();

        // Fetch updated wishlist with product details
        const updatedWishlist = await wishlistModel.findOne({ userId });
        const itemsWithDetails = await Promise.all(updatedWishlist.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
                ...item.toObject(),
                name: product?.name || 'Product not found',
                price: product?.price || 0,
                image: product?.image || null
            };
        }));

        res.json({ 
            success: true, 
            wishlist: { 
                ...updatedWishlist.toObject(), 
                items: itemsWithDetails 
            } 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to clear the wishlist
const clearWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const wishlist = await wishlistModel.findOne({ userId });

        if (!wishlist) {
            return res.json({ success: true, wishlist: { items: [] } });
        }

        wishlist.items = [];
        await wishlist.save();

        res.json({ 
            success: true, 
            wishlist: { 
                ...wishlist.toObject(), 
                items: [] 
            } 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
};