const mongoose = require("mongoose");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");

/*
=====================================================
Place Order (FIXED SAFE VERSION)
=====================================================
*/
const placeOrder = async (req, res) => {
    const mongoose = require("mongoose");
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // ✅ FIX: safe fallback
        const {
            shippingAddress = "Not Provided",
            paymentMethod = "ONLINE"
        } = req.body || {};

        const cart = await Cart.findOne({ customer: req.userId })
            .populate("items.product")
            .session(session);

        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }

        let totalAmount = 0;

        const firstProduct = cart.items[0].product;

        for (let item of cart.items) {
            totalAmount += item.product.price * item.quantity;
        }

        const order = await Order.create(
            [{
                customer: req.userId,
                shop: firstProduct.shop,
                vendor: firstProduct.vendor,
                items: cart.items.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
                totalAmount,
                shippingAddress,
                paymentMethod,
                paymentStatus: "Pending",
                orderStatus: "Pending",
            }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            order: order[0],
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("ORDER ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/*
=====================================================
Other Functions (UNCHANGED)
=====================================================
*/

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.userId })
            .populate("shop", "name logo")
            .populate("vendor", "name")
            .populate("items.product", "name image price")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            customer: req.userId,
        })
            .populate("customer", "name email phone")
            .populate("shop", "name logo address")
            .populate("vendor", "name email")
            .populate("items.product", "name image price description");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            customer: req.userId,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order in ${order.orderStatus} status`,
            });
        }

        order.orderStatus = "Cancelled";
        await order.save();

        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity },
            });
        }

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    placeOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
};