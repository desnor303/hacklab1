const mongoose = require("mongoose");

async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error("Thiếu biến môi trường MONGODB_URI");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log(
    `[db] Đã kết nối MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`
  );
  return mongoose.connection;
}

module.exports = connectDB;
