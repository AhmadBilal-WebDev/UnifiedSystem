import jwt from "jsonwebtoken";

/**
 * Verifies customer JWT (from cookie or Authorization header).
 */
const verifyCustomerToken = (req, res, next) => {
  try {
    // Try cookie first, then Authorization header
    const token = req.cookies?.customerToken || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.customer = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token." });
  }
};

export default verifyCustomerToken;
