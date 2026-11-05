require("dotenv").config();

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const Category = require("../models/Category");
const Article = require("../models/Article");
const User = require("../models/User");
const Progress = require("../models/Progress");
const Bookmark = require("../models/Bookmark");
const categorySeed = require("./categories");

const CONTENT_DIR = path.join(__dirname, "..", "..", "content");

async function seed() {
  await connectDB();

  if (process.argv.includes("--fresh")) {
    await Promise.all([
      Article.deleteMany({}),
      Progress.deleteMany({}),
      Bookmark.deleteMany({}),
    ]);
    console.log("[seed] Đã xoá bài viết và dữ liệu tiến độ cũ");
  }

  const categoryMap = new Map();
  for (const cat of categorySeed) {
    const category = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: cat },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
    categoryMap.set(cat.slug, category);
  }
  console.log(`[seed] Danh mục: ${categoryMap.size}`);

  let admin = await User.findOne({ email: "admin@hacklab.dev" });
  if (!admin) {
    admin = await User.create({
      name: "HackLab Admin",
      email: "admin@hacklab.dev",
      password: "Admin123!",
      role: "admin",
    });
  } else if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();
  }

  const student = await User.findOne({ email: "student@hacklab.dev" });
  if (!student) {
    await User.create({
      name: "Học viên Demo",
      email: "student@hacklab.dev",
      password: "Student123!",
      role: "user",
    });
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort();

  let seeded = 0;
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);

    if (!data.title || !data.slug || !data.category) {
      console.warn(`[seed] Bỏ qua ${file}: thiếu title/slug/category`);
      continue;
    }

    const category = categoryMap.get(data.category);
    if (!category) {
      console.warn(`[seed] Bỏ qua ${file}: không tìm thấy danh mục ${data.category}`);
      continue;
    }

    const words = content.trim().split(/\s+/).filter(Boolean).length;

    await Article.findOneAndUpdate(
      { slug: data.slug },
      {
        $set: {
          title: data.title,
          slug: data.slug,
          description: data.description || "",
          content,
          category: category._id,
          difficulty: data.difficulty || "beginner",
          tags: data.tags || [],
          readTime: Number(data.readTime) || Math.max(1, Math.round(words / 200)),
          featured: Boolean(data.featured),
          isPublished: data.isPublished !== false,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
          author: admin._id,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );
    seeded += 1;
  }

  console.log(`[seed] Bài viết: ${seeded}`);
  console.log("[seed] Tài khoản demo:");
  console.log("       admin@hacklab.dev / Admin123!");
  console.log("       student@hacklab.dev / Student123!");

  await mongoose.disconnect();
  console.log("[seed] Hoàn tất");
}

seed().catch(async (error) => {
  console.error("[seed] Thất bại:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
