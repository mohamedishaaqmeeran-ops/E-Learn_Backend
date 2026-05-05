// controllers/productController.js

const Product = require("../models/product");
const User = require("../models/user");
/*
=====================================================
Vendor - Create Product
=====================================================
*/
const createProduct = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        const vendor = await User.findById(req.userId);

        if (!vendor || !vendor.assignedShop) {
            return res.status(400).json({
                success: false,
                message: "Vendor has no shop assigned"
            });
        }

        const product = await Product.create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category,

            shop: vendor.assignedShop, // 🔥 FIX
            vendor: req.userId,

            image: req.file
                ? `/uploads/products/${req.file.filename}`
                : ""
        });

        res.status(201).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("CREATE ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/*
=====================================================
Vendor - Get Own Products
=====================================================
*/
const getVendorProducts = async (req, res) => {
    try {
        const products = await Product.find({
            vendor: req.userId
        })
            .populate("shop", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            products
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
Customer - Get All Products
=====================================================
*/
const getAllProducts = async (req, res) => {
    try {
        const query = {};

        if (req.query.shop) {
            query.shop = req.query.shop;
        }

        if (req.query.category) {
            query.category = req.query.category;
        }

        const products = await Product.find(query)
            .populate("shop", "name logo")
            .populate("vendor", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            products
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
Customer - Get Latest Products
=====================================================
*/
const getLatestProducts = async (req, res) => {
    try {
        const products = await Product.find({
            isLatest: true
        })
            .populate("shop", "name logo")
            .populate("vendor", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            products
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
Get Single Product
=====================================================
*/
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("shop", "name logo")
            .populate("vendor", "name email");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
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
Vendor - Update Product
=====================================================
*/
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            vendor: req.userId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // ✅ Build update object safely
        const updateData = {
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            stock: Number(req.body.stock),
            category: req.body.category,

            // ✅ FIX: boolean conversion
            isLatest: req.body.isLatest === "true"
        };

        // ✅ Image update
        if (req.file) {
            updateData.image = `/uploads/products/${req.file.filename}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error("UPDATE ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/*
=====================================================
Vendor - Delete Product
=====================================================
*/
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            vendor: req.userId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
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
Admin - Toggle Latest Product
=====================================================
*/
const toggleLatestProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        product.isLatest = !product.isLatest;
        await product.save();

        res.status(200).json({
            success: true,
            message: `Product ${
                product.isLatest ? "marked as latest" : "removed from latest"
            }`,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createProduct,
    getVendorProducts,
    getAllProducts,
    getLatestProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleLatestProduct
};