const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, article: 1 }, { unique: true });

module.exports =
  mongoose.models.Bookmark || mongoose.model("Bookmark", bookmarkSchema);
