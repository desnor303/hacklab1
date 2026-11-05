const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { protect, getJwtSecret } = require("../middleware/auth");

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};

    if (!name || !name.trim() || name.trim().length < 2) {
      throw new ApiError(400, "Tên phải có ít nhất 2 ký tự");
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      throw new ApiError(400, "Email không hợp lệ");
    }
    if (!password || password.length < 8) {
      throw new ApiError(400, "Mật khẩu phải có ít nhất 8 ký tự");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, "Email này đã được sử dụng");
    }

    const user = await User.create({
      name: name.trim(),
      email,
      password,
    });

    res.status(201).json({
      success: true,
      data: { token: signToken(user), user: user.toSafeJSON() },
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      throw new ApiError(400, "Vui lòng nhập email và mật khẩu");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Email hoặc mật khẩu không đúng");
    }

    res.json({
      success: true,
      data: { token: signToken(user), user: user.toSafeJSON() },
    });
  })
);

router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: req.user.toSafeJSON() });
  })
);

module.exports = router;
