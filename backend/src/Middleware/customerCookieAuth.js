import jwt from "jsonwebtoken";
import Customer from "../Models/Customer.js";

/**
 * Cookie-based auth for the customer website (old frontend expects cookies, not headers).
 * Looks up the SAME Customer collection the owner dashboard reads from.
 */
const customerCookieAuth = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id || decoded.userId).select("-passwordHash");
    if (!customer) return res.status(401).json({ message: "User not found" });
    req.customer = customer;
    req.user = customer; // compatibility with old controllers expecting req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default customerCookieAuth;
