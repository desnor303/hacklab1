const express = require("express");
const mongoose = require("mongoose");
const Article = require("../models/Article");
const Category = require("../models/Category");
const User = require("../models/User");
const Progress = require("../models/Progress");
const Bookmark = require("../models/Bookmark");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");
const slugify = require("../utils/slugify");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const ARTICLE_FIELDS =
  "title slug description difficulty tags readTime views featured isPublished publishedAt category author createdAt";

router.use(protect, adminOnly);

async function resolveCategory(value) {
  if (!value) {
    throw new ApiError(400, "Danh mục là bắt buộc");
  }

  const category = mongoose.isValidObjectId(value)
    ? await Category.findById(value)
    : await Category.findOne({ slug: String(value).toLowerCase() });

  if (!category) {
    throw new ApiError(400, "Danh mục không tồn tại");
  }
  return category._id;
}

function normalizeTags(tags) {
  const list = Array.isArray(tags)
    ? tags
    : String(tags || "")
        .split(",")
        .map((tag) => tag.trim());

  return [...new Set(list.map((tag) => String(tag).trim().toLowerCase()))]
    .filter(Boolean)
    .slice(0, 8);
}

function calcReadTime(content) {
  const words = String(content || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function parseDate(value) {
  if (!value) return new Date();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "Ngày xuất bản không hợp lệ");
  }
  return date;
}

router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const [users, articles, published, completions, bookmarks] =
      await Promise.all([
        User.countDocuments(),
        Article.countDocuments(),
        Article.countDocuments({ isPublished: true }),
        Progress.countDocuments(),
        Bookmark.countDocuments(),
      ]);

    res.json({
      success: true,
      data: { users, articles, published, completions, bookmarks },
    });
  })
);

router.get(
  "/articles",
  asyncHandler(async (req, res) => {
    const { search = "", category = "", difficulty = "" } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));

    const query = {};
    if (search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), "i");
      query.$or = [{ title: rx }, { slug: rx }, { tags: rx }];
    }
    if (category) {
      const cat = await Category.findOne({ slug: category.toLowerCase() });
      query.category = cat ? cat._id : null;
    }
    if (difficulty && DIFFICULTIES.includes(difficulty)) {
      query.difficulty = difficulty;
    }

    const [items, total] = await Promise.all([
      Article.find(query)
        .select(ARTICLE_FIELDS)
        .populate("category", "name slug icon color")
        .populate("author", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Article.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { items, total, page, pages: Math.ceil(total / limit) },
    });
  })
);

router.get(
  "/articles/:id",
  asyncHandler(async (req, res) => {
    const article = await Article.findById(req.params.id)
      .populate("category", "name slug icon color")
      .populate("author", "name")
      .lean();

    if (!article) {
      throw new ApiError(404, "Bài viết không tồn tại");
    }

    res.json({ success: true, data: article });
  })
);

router.post(
  "/articles",
  asyncHandler(async (req, res) => {
    const {
      title,
      slug,
      description = "",
      content,
      category,
      difficulty = "beginner",
      tags,
      readTime,
      featured = false,
      isPublished = true,
      publishedAt,
    } = req.body || {};

    if (!title || !title.trim()) {
      throw new ApiError(400, "Tiêu đề là bắt buộc");
    }
    if (!content || !content.trim()) {
      throw new ApiError(400, "Nội dung Markdown là bắt buộc");
    }
    if (!DIFFICULTIES.includes(difficulty)) {
      throw new ApiError(400, "Độ khó không hợp lệ");
    }

    const normalizedSlug = slugify(slug || title);
    if (!normalizedSlug) {
      throw new ApiError(400, "Slug không hợp lệ");
    }

    const duplicate = await Article.findOne({ slug: normalizedSlug });
    if (duplicate) {
      throw new ApiError(409, "Slug đã tồn tại, vui lòng chọn slug khác");
    }

    const article = await Article.create({
      title: title.trim(),
      slug: normalizedSlug,
      description: String(description).trim(),
      content,
      category: await resolveCategory(category),
      difficulty,
      tags: normalizeTags(tags),
      readTime:
        Number(readTime) > 0 ? Math.round(Number(readTime)) : calcReadTime(content),
      featured: Boolean(featured),
      isPublished: isPublished !== false,
      publishedAt: parseDate(publishedAt),
      author: req.user._id,
    });

    const populated = await Article.findById(article._id)
      .populate("category", "name slug icon color")
      .populate("author", "name")
      .lean();

    res.status(201).json({ success: true, data: populated });
  })
);

router.put(
  "/articles/:id",
  asyncHandler(async (req, res) => {
    const article = await Article.findById(req.params.id);
    if (!article) {
      throw new ApiError(404, "Bài viết không tồn tại");
    }

    const body = req.body || {};

    if (body.title !== undefined) {
      if (!String(body.title).trim()) {
        throw new ApiError(400, "Tiêu đề là bắt buộc");
      }
      article.title = String(body.title).trim();
    }

    if (body.slug !== undefined || body.title !== undefined) {
      const normalizedSlug = slugify(body.slug || article.title);
      if (!normalizedSlug) {
        throw new ApiError(400, "Slug không hợp lệ");
      }
      article.slug = normalizedSlug;
    }

    if (body.description !== undefined) {
      article.description = String(body.description).trim();
    }

    if (body.content !== undefined) {
      if (!String(body.content).trim()) {
        throw new ApiError(400, "Nội dung Markdown là bắt buộc");
      }
      article.content = body.content;
    }

    if (body.category !== undefined) {
      article.category = await resolveCategory(body.category);
    }

    if (body.difficulty !== undefined) {
      if (!DIFFICULTIES.includes(body.difficulty)) {
        throw new ApiError(400, "Độ khó không hợp lệ");
      }
      article.difficulty = body.difficulty;
    }

    if (body.tags !== undefined) {
      article.tags = normalizeTags(body.tags);
    }

    if (Number(body.readTime) > 0) {
      article.readTime = Math.round(Number(body.readTime));
    } else if (body.content !== undefined) {
      article.readTime = calcReadTime(article.content);
    }

    if (body.featured !== undefined) {
      article.featured = Boolean(body.featured);
    }

    if (body.isPublished !== undefined) {
      article.isPublished = Boolean(body.isPublished);
    }

    if (body.publishedAt !== undefined) {
      article.publishedAt = parseDate(body.publishedAt);
    }

    await article.save();

    const populated = await Article.findById(article._id)
      .populate("category", "name slug icon color")
      .populate("author", "name")
      .lean();

    res.json({ success: true, data: populated });
  })
);

router.delete(
  "/articles/:id",
  asyncHandler(async (req, res) => {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      throw new ApiError(404, "Bài viết không tồn tại");
    }

    await Promise.all([
      Progress.deleteMany({ article: article._id }),
      Bookmark.deleteMany({ article: article._id }),
    ]);

    res.json({ success: true, data: { id: article._id.toString() } });
  })
);

module.exports = router;
