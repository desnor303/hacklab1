const express = require("express");
const mongoose = require("mongoose");
const Article = require("../models/Article");
const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");

const router = express.Router();
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const SUMMARY_FIELDS =
  "title slug description difficulty tags readTime views featured publishedAt category author";

const SORT_OPTIONS = {
  newest: { publishedAt: -1 },
  oldest: { publishedAt: 1 },
  popular: { views: -1, publishedAt: -1 },
  shortest: { readTime: 1 },
  longest: { readTime: -1 },
  title: { title: 1 },
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      search = "",
      category = "",
      difficulty = "",
      sort = "newest",
      featured,
    } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(60, Math.max(1, parseInt(req.query.limit, 10) || 9));

    const query = { isPublished: true };

    if (category) {
      const cat = mongoose.isValidObjectId(category)
        ? await Category.findById(category)
        : await Category.findOne({ slug: category.toLowerCase() });
      if (!cat) {
        return res.json({
          success: true,
          data: { items: [], total: 0, page, pages: 0 },
        });
      }
      query.category = cat._id;
    }

    if (difficulty && DIFFICULTIES.includes(difficulty)) {
      query.difficulty = difficulty;
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), "i");
      query.$or = [{ title: rx }, { description: rx }, { tags: rx }];
    }

    const [items, total] = await Promise.all([
      Article.find(query)
        .select(SUMMARY_FIELDS)
        .populate("category", "name slug icon color")
        .populate("author", "name")
        .sort(SORT_OPTIONS[sort] || SORT_OPTIONS.newest)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Article.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("category", "name slug icon color description")
      .populate("author", "name")
      .lean();

    if (!article) {
      throw new ApiError(404, "Bài viết không tồn tại");
    }

    const categoryId = article.category?._id || article.category;
    const related = await Article.find({
      _id: { $ne: article._id },
      category: categoryId,
      isPublished: true,
    })
      .select("title slug description difficulty tags readTime views category")
      .populate("category", "name slug icon color")
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    res.json({ success: true, data: { ...article, related } });
  })
);

module.exports = router;
