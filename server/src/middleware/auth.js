const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

function getJwtSecret() {
  return process.env.JWT_SECRET || "hacklab-dev-secret";
}

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      throw new ApiError(401, "Bạn cần đăng nhập để tiếp tục");
    }

    const token = header.slice(7);
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, "Tài khoản không tồn tại");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    next(new ApiError(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"));
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new ApiError(403, "Bạn không có quyền truy cập trang này"));
  }
  next();
}

module.exports = { protect, adminOnly, getJwtSecret };
