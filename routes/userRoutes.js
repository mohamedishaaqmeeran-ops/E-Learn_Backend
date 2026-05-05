const express = require("express");
const router = express.Router();

const { getUserSummary } = require("../controllers/userController");
const { isAuthenticated } = require("../middlewares/auth");

router.get("/summary", isAuthenticated, getUserSummary);

module.exports = router;