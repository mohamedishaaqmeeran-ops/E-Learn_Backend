const express = require("express");
const router = express.Router();

const {
    
    getMyOrders,
    getOrderById,
    cancelOrder,
    placeOrder
} = require("../controllers/orderController");

const { isAuthenticated } = require("../middlewares/auth");

/*
=====================================================
Customer Order Routes
=====================================================
*/

// Place a new order
router.post("/", isAuthenticated, placeOrder);

// Get logged-in user's orders
router.get("/my-orders", isAuthenticated, getMyOrders);

// Get single order details
router.get("/:id", isAuthenticated, getOrderById);

// Cancel an order
router.put("/:id/cancel", isAuthenticated, cancelOrder);

module.exports = router;