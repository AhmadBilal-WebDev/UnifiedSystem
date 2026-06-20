import jwt from "jsonwebtoken";

/**
 * Verifies the Bearer JWT for admin/staff routes.
 * Attaches decoded token to req.user.
 */
const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token.", error: err.message });
  }
};

export default verifyAdminToken;
