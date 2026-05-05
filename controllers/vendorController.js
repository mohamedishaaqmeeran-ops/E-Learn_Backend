const Order = require("../models/order");

/*
=====================================================
Get Vendor Orders
=====================================================
*/
const getVendorOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            vendor: req.userId
        })
            .populate("customer", "name email phone")
            .populate("shop", "name logo")
            .populate("items.product", "name image price")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
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
Get Single Vendor Order
=====================================================
*/
const getVendorOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            vendor: req.userId
        })
            .populate("customer", "name email phone")
            .populate("shop", "name logo address")
            .populate("items.product", "name image price description");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order
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
Update Order Status
=====================================================
*/
const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;

        const allowedStatuses = [
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            vendor: req.userId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus === "Delivered") {
            return res.status(400).json({
                success: false,
                message: "Delivered order cannot be modified"
            });
        }

        if (order.orderStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled order cannot be modified"
            });
        }

        order.orderStatus = orderStatus;
        await order.save();

        const updatedOrder = await Order.findById(order._id)
            .populate("customer", "name email")
            .populate("shop", "name")
            .populate("items.product", "name price image");

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getVendorOrders,
    getVendorOrderById,
    updateOrderStatus
};