const express = require("express");
const router = express.Router();

const {
    createShop,
    getAllShops,
    getShopById,
    updateShop,
    deleteShop
} = require("../controllers/adminController");

const {
    isAuthenticated,
    allowRoles
} = require("../middlewares/auth");

const upload = require("../middlewares/upload");

/*
=====================================================
Shop Routes
=====================================================
*/

// Create Shop (Admin Only)
router.post(
    "/",
    isAuthenticated,
    allowRoles("admin"),
    upload.single("logo"),
    createShop
);

// Get All Shops (Public)
router.get("/", getAllShops);

// Get Single Shop (Public)
router.get("/:id", getShopById);

// Update Shop (Admin Only)
router.put(
    "/:id",
    isAuthenticated,
    allowRoles("admin"),
    upload.single("logo"),
    updateShop
);

// Delete Shop (Admin Only)
router.delete(
    "/:id",
    isAuthenticated,
    allowRoles("admin"),
    deleteShop
);

module.exports = router;