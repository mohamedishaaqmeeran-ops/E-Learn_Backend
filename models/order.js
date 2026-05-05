const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },

    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: Number,
            price: Number
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    shippingAddress: {
        type: String,
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ["COD", "ONLINE"],
        default: "COD"
    },

    orderStatus: {
        type: String,
        enum: [
            "Pending",
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ],
        default: "Pending"
    },
   razorpayOrderId: String,
razorpayPaymentId: String,
paymentStatus: {
  type: String,
  enum: ["Pending", "Paid", "Failed"],
  default: "Pending"
}
}, {
    timestamps: true
});
orderSchema.index({ customer: 1, createdAt: -1 });
module.exports = mongoose.model("Order", orderSchema);