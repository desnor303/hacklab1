require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[api] HackLab API đang chạy tại http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("[api] Không thể khởi động server:", error.message);
    process.exit(1);
  }
}

start();
