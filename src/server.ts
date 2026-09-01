import app from "./app.js";
import prisma from "./lib/prisma.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Database connection check
    await prisma.$connect();

    console.log(" Database connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(` Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(" Database connection failed:", error);
    process.exit(1);
  }
};

startServer();