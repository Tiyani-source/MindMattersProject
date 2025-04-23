import shoppingCartModel from "../models/shoppingCartModel.js";

// API to get user's cart
const getCart = async (req, res) => {
    try {
        const cart = await shoppingCartModel.findOne({ userId: req.body.userId });

        if (!cart) {
            return res.json({ success: true, cart: { items: [] } });
        }

        res.json({ success: true, cart });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to add an item to the cart
const addToCart = async (req, res) => {
    try {
        const { productId, name, price, quantity } = req.body;
        const userId = req.body.userId;

        if (!productId || !name || !price || !quantity) {
            return res.json({ success: false, message: 'Missing item details' });
        }

        let cart = await shoppingCartModel.findOne({ userId });

        if (!cart) {
            cart = new shoppingCartModel({
                userId,
                items: [{ productId, name, price, quantity }]
            });
        } else {
            const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

            if (existingItemIndex !== -1) {
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, name, price, quantity });
            }
        }

        await cart.save();
        res.json({ success: true, cart });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to remove an item from the cart
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.body.userId;

        const cart = await shoppingCartModel.findOne({ userId });

        if (!cart) {
            return res.json({ success: true, cart: { items: [] } });
        }

        cart.items = cart.items.filter(item => item.productId !== productId);
        await cart.save();

        res.json({ success: true, cart });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to clear the cart
const clearCart = async (req, res) => {
    try {
        const userId = req.body.userId;
        const cart = await shoppingCartModel.findOne({ userId });

        if (!cart) {
            return res.json({ success: true, cart: { items: [] } });
        }

        cart.items = [];
        await cart.save();

        res.json({ success: true, cart });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export {
    getCart,
    addToCart,
    removeFromCart,
    clearCart
}