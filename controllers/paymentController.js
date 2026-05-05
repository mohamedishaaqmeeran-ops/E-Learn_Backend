const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order");
const Payment = require("../models/payment");
const Cart = require("../models/cart");
const Product = require("../models/product");
// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/*
=====================================================
Create Razorpay Order
=====================================================
*/
const createOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // 🔥 Get order from DB (IMPORTANT - secure amount)
    const orderData = await Order.findById(orderId);

    if (!orderData) {
      return res.status(404).json({ message: "Order not found" });
    }

    const amount = orderData.totalAmount;

    const options = {
      amount: amount * 100, // INR → paise
      currency: "INR",
      receipt: `receipt_${orderData._id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 🔥 Save Razorpay order ID in DB
    orderData.razorpayOrderId = razorpayOrder.id;
    await orderData.save();

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("Create Order Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/*
=====================================================
Verify Payment
=====================================================
*/
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // ❌ Invalid signature
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // 🔥 Find order
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ⚠️ Prevent duplicate processing
    if (order.paymentStatus === "Paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        order,
      });
    }

    /*
    =====================================================
    🔥 STOCK VALIDATION + REDUCTION
    =====================================================
    */
    for (let item of order.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock`,
        });
      }

      product.stock -= item.quantity;
      await product.save();
    }

    /*
    =====================================================
    🔥 UPDATE ORDER
    =====================================================
    */
    order.paymentStatus = "Paid";
    order.orderStatus = "Confirmed";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    /*
    =====================================================
    🔥 CLEAR CART
    =====================================================
    */
    await Cart.findOneAndUpdate(
      { customer: order.customer },
      { items: [] }
    );

    /*
    =====================================================
    🔥 SAVE PAYMENT
    =====================================================
    */
    const payment = await Payment.create({
      user: order.customer,
      order: order._id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: order.totalAmount,
      status: "paid",
    });

    res.status(200).json({
      success: true,
      message: "Payment verified & order completed ✅",
      order,
      payment,
    });

  } catch (error) {
    console.error("Verify Payment Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};