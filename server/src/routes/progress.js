const express = require("express");
const Progress = require("../models/Progress");
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
    const entries = await Progress.find({ user: req.user._id })
      .sort({ completedAt: -1 })
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

    const completed = req.body?.completed !== false;

    if (completed) {
      await Progress.findOneAndUpdate(
        { user: req.user._id, article: article._id },
        { $set: { completedAt: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      await Progress.deleteOne({ user: req.user._id, article: article._id });
    }

    res.json({ success: true, data: { completed } });
  })
);

module.exports = router;
