const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const shopRoutes = require("./routes/shopRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const userRoutes = require("./routes/userRoutes");

const app = express();

/*
==================================================
Middlewares
==================================================
*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
   cors({
        origin:  "http://ancshops.netlify.app",
       credentials: true
    })
);

/*
==================================================
Static Files
==================================================
*/
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
==================================================
API Routes
==================================================
*/
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/vendor", vendorRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/shops", shopRoutes);
app.use("/api/v1/payment", paymentRoutes);

/*
==================================================
Health Check
==================================================
*/
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Multi-Vendor E-Commerce API Running Successfully 🚀"
    });
});

/*
==================================================
404 Handler
==================================================
*/
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

/*
==================================================
Global Error Handler
==================================================
*/
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

module.exports = app;