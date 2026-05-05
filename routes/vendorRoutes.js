const express = require("express");
const router = express.Router();

const {
    getVendorOrders,
    getVendorOrderById,
    updateOrderStatus
} = require("../controllers/vendorController");

const {
    isAuthenticated,
    authorizeRoles,
    allowRoles
} = require("../middlewares/auth");

/*
=====================================================
Vendor Routes
=====================================================
*/

// All routes require vendor authentication
router.use(
    isAuthenticated,
    allowRoles("vendor")
);

/*
=====================================================
Order Management
=====================================================
*/

// Get all orders belonging to vendor
router.get("/orders", getVendorOrders);

// Get single vendor order
router.get("/orders/:id", getVendorOrderById);

// Update order status
router.put("/orders/:id/status", updateOrderStatus);

module.exports = router;