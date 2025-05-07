import cartModel from "../models/cartModel.js";
import Product from "../models/productModel.js";

// API to get student's cart
const getCart = async (req, res) => {
    try {
        const userId = req.userId;
        const cart = await cartModel.findOne({ userId });

        if (!cart) {
            return res.json({ success: true, cart: { items: [] } });
        }

        // Fetch product details for each item
        const itemsWithDetails = await Promise.all(cart.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
                ...item.toObject(),
                name: product?.name || 'Product not found',
                price: product?.price || 0,
                image: product?.image || null,
                color: item.color || null,
                size: item.size || null
            };
        }));

        res.json({ success: true, cart: { ...cart.toObject(), items: itemsWithDetails } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to add an item to the cart
const addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId, quantity, color, size } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ success: false, message: 'Missing required item details' });
        }

        // Fetch product details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let cart = await cartModel.findOne({ userId });

        if (!cart) {
            cart = new cartModel({
                userId,
                items: [{
                    productId,
                    quantity,
                    color: color || null,
                    size: size || null,
                    name: product.name,
                    price: product.price,
                    image: product.image
                }]
            });
        } else {
            // Find existing item with matching productId and optional attributes
            const existingItemIndex = cart.items.findIndex(item => {
                // First check if productId matches
                if (item.productId !== productId) return false;
                
                // Then check if both items have color and they match
                if (color && item.color && color !== item.color) return false;
                
                // Then check if both items have size and they match
                if (size && item.size && size !== item.size) return false;
                
                // If we get here, it's a match
                return true;
            });

            if (existingItemIndex !== -1) {
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                cart.items.push({
                    productId,
                    quantity,
                    color: color || null,
                    size: size || null,
                    name: product.name,
                    price: product.price,
                    image: product.image
                });
            }
        }

        await cart.save();
        
        // Fetch updated cart with product details
        const updatedCart = await cartModel.findOne({ userId });
        const itemsWithDetails = await Promise.all(updatedCart.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
                ...item.toObject(),
                name: product?.name || 'Product not found',
                price: product?.price || 0,
                image: product?.image || null,
                color: item.color || null,
                size: item.size || null
            };
        }));

        res.json({ success: true, cart: { ...updatedCart.toObject(), items: itemsWithDetails } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to remove an item from the cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;
        const cart = await cartModel.findOne({ userId });

        if (!cart) {
            return res.json({ success: true, cart: { items: [] } });
        }

        cart.items = cart.items.filter(item => item.productId !== productId);
        await cart.save();

        // Fetch updated cart with product details
        const updatedCart = await cartModel.findOne({ userId });
        const itemsWithDetails = await Promise.all(updatedCart.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
                ...item.toObject(),
                name: product?.name || 'Product not found',
                price: product?.price || 0,
                image: product?.image || null
            };
        }));

        res.json({ success: true, cart: { ...updatedCart.toObject(), items: itemsWithDetails } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to clear the cart
const clearCart = async (req, res) => {
    try {
        const userId = req.userId;
        const cart = await cartModel.findOne({ userId });

        if (!cart) {
            return res.json({ success: true, cart: { items: [] } });
        }

        cart.items = [];
        await cart.save();

        res.json({ success: true, cart: { ...cart.toObject(), items: [] } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to update cart item quantity
const updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Invalid quantity' });
        }

        const cart = await cartModel.findOne({ userId });

        if (!cart) {
            return res.json({ success: true, cart: { items: [] } });
        }

        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        // Fetch updated cart with product details
        const updatedCart = await cartModel.findOne({ userId });
        const itemsWithDetails = await Promise.all(updatedCart.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
                ...item.toObject(),
                name: product?.name || 'Product not found',
                price: product?.price || 0,
                image: product?.image || null
            };
        }));

        res.json({ success: true, cart: { ...updatedCart.toObject(), items: itemsWithDetails } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    updateCartItemQuantity
}