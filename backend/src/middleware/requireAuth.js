const { verifyToken } = require("@clerk/backend");

async function requireAuth(req, res, next) {
  const authorization = req.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required. Please sign in.",
    });
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({
      message: "Authentication token is missing.",
    });
  }

  if (!process.env.CLERK_SECRET_KEY) {
    console.error("CLERK_SECRET_KEY is missing from backend environment.");

    return res.status(500).json({
      message: "Authentication is not configured on the server.",
    });
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!payload || typeof payload.sub !== "string" || !payload.sub) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // Use the user ID from the verified Clerk token.
    req.auth = {
      userId: payload.sub,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token.",
    });
  }
}

module.exports = requireAuth;