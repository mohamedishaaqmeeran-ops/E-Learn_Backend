const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");
const { isAuthenticated } = require("../middlewares/auth");

/*
=====================================================
Cart Routes
=====================================================
*/

// Get User Cart
router.get("/", isAuthenticated, cartController.getCart);

// Add Item To Cart
router.post("/add", isAuthenticated, cartController.addToCart);

// Update Cart Item Quantity
router.put(
    "/update/:productId",
    isAuthenticated,
    cartController.updateCartItem
);

// Remove Item From Cart
router.delete(
    "/remove/:productId",
    isAuthenticated,
    cartController.removeCartItem
);

// Clear Entire Cart
router.delete(
    "/clear",
    isAuthenticated,
    cartController.clearCart
);

module.exports = router;