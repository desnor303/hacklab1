const express = require("express");
const Category = require("../models/Category");
const Article = require("../models/Article");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ order: 1 }).lean();

    const counts = await Article.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      counts.map((item) => [String(item._id), item.count])
    );

    res.json({
      success: true,
      data: categories.map((cat) => ({
        ...cat,
        articleCount: countMap.get(String(cat._id)) || 0,
      })),
    });
  })
);

module.exports = router;
