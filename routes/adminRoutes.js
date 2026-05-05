const express = require("express");
const router = express.Router();

const {
    createShop,
    getAllShops,
    getShopById,
    updateShop,
    deleteShop,
    createVendor,
    getAllVendors,
    updateVendor,
    deleteVendor
} = require("../controllers/adminController");

const {
    isAuthenticated,
    allowRoles
} = require("../middlewares/auth");

const upload = require("../middlewares/upload");

/*
=====================================================
Admin Authentication Middleware
=====================================================
*/
router.use(
    isAuthenticated,
    allowRoles("admin")
);

/*
=====================================================
Shop Management Routes
=====================================================
*/

// Create Shop
router.post(
    "/shops",
    upload.single("logo"),
    createShop
);

// Get All Shops
router.get("/shops", getAllShops);

// Get Single Shop
router.get("/shops/:id", getShopById);

// Update Shop
router.put(
    "/shops/:id",
    upload.single("logo"),
    updateShop
);

// Delete Shop
router.delete("/shops/:id", deleteShop);

/*
=====================================================
Vendor Management Routes
=====================================================
*/

// Create Vendor
router.post("/vendors", createVendor);

// Get All Vendors
router.get("/vendors", getAllVendors);

// Update Vendor
router.put("/vendors/:id", updateVendor);

// Delete Vendor
router.delete("/vendors/:id", deleteVendor);

module.exports = router;