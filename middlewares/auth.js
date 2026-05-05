const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");

const isAuthenticated = async (req, res, next) => {
    try {
        let token;

        // Check Authorization header first
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        // Fallback to cookie
        if (!token && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

const allowRoles = (roles) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.userId).select("-password");

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            if (!roles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: Access denied",
                });
            }

            req.user = user;
            req.userId = user._id;

            next();
        } catch (error) {
            console.error("Role Authorization Error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    };
};

module.exports = {
    isAuthenticated,
    allowRoles,
};