const Cart = require("../models/cart");
const Product = require("../models/product");

/*
=====================================================
Add Product To Cart
=====================================================
*/
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        let cart = await Cart.findOne({ customer: req.userId });

        if (!cart) {
            cart = await Cart.create({
                customer: req.userId,
                items: []
            });
        }

        const existingItem = cart.items.find(
  item => item.product.toString() === productId.toString()
);

        if (existingItem) {
            const newQuantity = existingItem.quantity + Number(quantity);

           existingItem.quantity = Math.min(newQuantity, product.stock);

            existingItem.quantity = newQuantity;
        } else {
            cart.items.push({
                product: productId,
                quantity: Number(quantity)
            });
        }

        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate({
                path: "items.product",
                populate: {
                    path: "shop vendor",
                    select: "name email"
                }
            });

        res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart: populatedCart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/*
=====================================================
Get Customer Cart
=====================================================
*/
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            customer: req.userId
        }).populate({
            path: "items.product",
            populate: [
                {
                    path: "shop",
                    select: "name logo"
                },
                {
                    path: "vendor",
                    select: "name"
                }
            ]
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                cart: {
                    items: [],
                    totalAmount: 0
                }
            });
        }

        let totalAmount = 0;

        cart.items.forEach(item => {
            if (item.product) {
                totalAmount += item.product.price * item.quantity;
            }
        });

        res.status(200).json({
            success: true,
            cart,
            totalAmount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/*
=====================================================
Update Cart Item Quantity
=====================================================
*/
const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || isNaN(quantity)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity"
            });
        }

        // 🔥 FIX: use CUSTOMER not user
        const cart = await Cart.findOne({ customer: req.userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            (i) => i.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        // safe update
        item.quantity = Number(quantity);

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        res.json({
            success: true,
            cart: updatedCart
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/*
=====================================================
Remove Product From Cart
=====================================================
*/
const removeCartItem = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({
            customer: req.userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Product removed from cart"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/*
=====================================================
Clear Entire Cart
=====================================================
*/
const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndUpdate(
            { customer: req.userId },
            { items: [] },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
};