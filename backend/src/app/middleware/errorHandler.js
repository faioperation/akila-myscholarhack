import DevBuildError from "../lib/DevBuildError.js";

const errorHandler = (err, req, res, next) => {
  console.error("🔥 Error caught by middleware:", err.message);
  // Custom application errors
  if (err instanceof DevBuildError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // JWT fallback safety (extra layer)
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Prisma errors (Known request errors)
  if (err.code && err.code.startsWith("P")) {
    return res.status(400).json({
      success: false,
      message: `Database error: ${err.message.split('\n').at(-1) || "Something went wrong"}`,
    });
  }

  // Prisma Validation / Initialization errors
  if (err.name?.includes("PrismaClient")) {
    return res.status(400).json({
      success: false,
      message: err.message.split('\n').at(-1) || "Database validation error",
    });
  }

  // Axios / External API errors
  if (err.response) {
    const externalError = err.response.data?.error || err.response.data?.message || err.response.data;
    return res.status(err.response.status).json({
      success: false,
      message: typeof externalError === 'object' ? JSON.stringify(externalError) : externalError || "External Service Error",
    });
  }

  // Unknown errors
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
