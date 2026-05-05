const express = require("express");

const {
    createProduct,
    getVendorProducts,
    getAllProducts,
    getLatestProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleLatestProduct
} = require("../controllers/productController");

const {
    isAuthenticated,
    allowRoles
} = require("../middlewares/auth");

const upload = require("../middlewares/upload");

const productRouter = express.Router();

/*
==================================================
Public Routes
==================================================
*/
productRouter.get("/", getAllProducts);
productRouter.get("/latest", getLatestProducts);
productRouter.get("/:id", getProductById);

/*
==================================================
Vendor Routes
==================================================
*/
productRouter.post(
    "/create",
    isAuthenticated,
    allowRoles(["vendor"]),
    upload.single("productImage"), // ✅ FIXED
    createProduct
);

productRouter.get(
    "/vendor/my-products",
    isAuthenticated,
    allowRoles(["vendor"]),
    getVendorProducts
);

productRouter.put(
    "/update/:id",
    isAuthenticated,
    allowRoles(["vendor"]),
    upload.single("productImage"), // ✅ FIXED
    updateProduct
);

productRouter.delete(
    "/delete/:id",
    isAuthenticated,
    allowRoles(["vendor"]),
    deleteProduct
);

/*
==================================================
Admin Routes
==================================================
*/
productRouter.patch(
    "/toggle-latest/:id",
    isAuthenticated,
    allowRoles(["admin"]),
    toggleLatestProduct
);

module.exports = productRouter;