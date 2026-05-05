const Shop = require("../models/shop");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
/*
=====================================================
Create Shop
=====================================================
*/
const createShop = async (req, res) => {
    try {
        const { name, description, address } = req.body;

        const existingShop = await Shop.findOne({ name });

        if (existingShop) {
            return res.status(400).json({
                success: false,
                message: "Shop already exists"
            });
        }

        const shop = await Shop.create({
            name,
            description,
            address,
            logo: req.file ? req.file.path : "",
            createdBy: req.userId
        });

        res.status(201).json({
            success: true,
            message: "Shop created successfully",
            shop
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
Get All Shops
=====================================================
*/
const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: shops.length,
            shops
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
Get Shop By ID
=====================================================
*/
const getShopById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id)
            .populate("createdBy", "name email");

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found"
            });
        }

        res.status(200).json({
            success: true,
            shop
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
Update Shop
=====================================================
*/
/*
=====================================================
Update Shop
=====================================================
*/



const updateShop = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, address } = req.body;

        const shop = await Shop.findById(id);

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found"
            });
        }

        // Update basic fields
        shop.name = name;
        shop.description = description;
        shop.address = address;

        // Update image only when a new file is uploaded
        if (req.file && req.file.path) {
            shop.logo = req.file.path.replace(/\\/g, "/");
        }

        // Never allow req.body.logo to overwrite existing string
        delete req.body.logo;

        await shop.save();

        res.status(200).json({
            success: true,
            message: "Shop updated successfully",
            shop
        });
    } catch (error) {
        console.error("Update Shop Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



/*
=====================================================
Delete Shop
=====================================================
*/
const deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found"
            });
        }

        await shop.deleteOne();

        res.status(200).json({
            success: true,
            message: "Shop deleted successfully"
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
Create Vendor
=====================================================
*/
const createVendor = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            shopId
        } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Vendor already exists"
            });
        }

        const shop = await Shop.findById(shopId);

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const vendor = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: "vendor",
            assignedShop: shopId
        });

        res.status(201).json({
            success: true,
            message: "Vendor created successfully",
            vendor
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
Get All Vendors
=====================================================
*/
const getAllVendors = async (req, res) => {
    try {
        const vendors = await User.find({
            role: "vendor"
        })
            .populate("assignedShop", "name logo")
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: vendors.length,
            vendors
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
Update Vendor
=====================================================
*/
const updateVendor = async (req, res) => {
    try {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(
                req.body.password,
                10
            );
        }

        const vendor = await User.findOneAndUpdate(
            {
                _id: req.params.id,
                role: "vendor"
            },
            req.body,
            {
                returnDocument: "after",
                runValidators: true
            }
        )
            .populate("assignedShop", "name")
            .select("-password");

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Vendor updated successfully",
            vendor
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
Delete Vendor
=====================================================
*/
const deleteVendor = async (req, res) => {
    try {
        const vendor = await User.findOneAndDelete({
            _id: req.params.id,
            role: "vendor"
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Vendor deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createShop,
    getAllShops,
    getShopById,
    updateShop,
    deleteShop,
    createVendor,
    getAllVendors,
    updateVendor,
    deleteVendor
};