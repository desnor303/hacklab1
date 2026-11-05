const express = require("express");
const Bookmark = require("../models/Bookmark");
const Article = require("../models/Article");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { protect } = require("../middleware/auth");

const router = express.Router();

const ARTICLE_POPULATE = {
  path: "article",
  select:
    "title slug description difficulty tags readTime views featured publishedAt category",
  populate: { path: "category", select: "name slug icon color" },
};

router.use(protect);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const entries = await Bookmark.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate(ARTICLE_POPULATE)
      .lean();

    res.json({
      success: true,
      data: entries.filter((entry) => entry.article),
    });
  })
);

router.post(
  "/:articleId",
  asyncHandler(async (req, res) => {
    const article = await Article.findOne({
      _id: req.params.articleId,
      isPublished: true,
    }).select("_id");

    if (!article) {
      throw new ApiError(404, "Bài viết không tồn tại");
    }

    const existing = await Bookmark.findOne({
      user: req.user._id,
      article: article._id,
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, data: { bookmarked: false } });
    }

    await Bookmark.create({ user: req.user._id, article: article._id });
    res.status(201).json({ success: true, data: { bookmarked: true } });
  })
);

module.exports = router;
