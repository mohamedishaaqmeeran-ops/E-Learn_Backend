
const Cart = require("../models/cart");

// @desc    Get wishlist + cart count
// @route   GET /api/v1/user/summary
// @access  Private
const getUserSummary = async (req, res) => {
  try {
    const userId = req.userId;

    // Wishlist count
  
    // Cart count
    const cart = await Cart.findOne({ user: userId });

    const cartCount = cart ? cart.products.length : 0;

    res.status(200).json({
      success: true,
      
      cartCount,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserSummary };