const express = require("express");
const {
    register,
    login,
    getMe,
    logout,
} = require("../controllers/authController");

const { isAuthenticated } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const User = require("../models/user");

const authRouter = express.Router();

/*
========================================
AUTH ROUTES
========================================
*/
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/getMe", isAuthenticated, getMe);
authRouter.post("/logout", isAuthenticated, logout);

/*
========================================
UPLOAD PROFILE PICTURE (FIXED)
========================================
*/
authRouter.post(
    "/upload/profile-picture",
    isAuthenticated,
    upload.single("profilePicture"),
    async (req, res) => {
        try {
            console.log("USER ID:", req.userId);
            console.log("FILE:", req.file);

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
            }

            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized user",
                });
            }

            // ✅ store relative path (recommended)
            const imagePath = `uploads/profiles/${req.file.filename}`;

            const user = await User.findByIdAndUpdate(
                req.userId,
                {
                    profilePicture: imagePath,
                },
                {
                    new: true,
                    runValidators: true,
                }
            ).select("-password");

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Profile picture updated successfully",
                user,
            });

        } catch (error) {
            console.error("Profile Upload Error:", error);

            return res.status(500).json({
                success: false,
                message: error.message || "Error uploading profile picture",
            });
        }
    }
);

module.exports = authRouter;