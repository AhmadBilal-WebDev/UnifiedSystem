/**
 * authorizeRole(...roles)
 * Usage: router.get('/x', verifyAdminToken, authorizeRole('superadmin','client_admin'), handler)
 */
export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized." });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient role." });
    }
    next();
  };
};

/**
 * authorizePermission(permission)
 * Usage: router.get('/x', verifyAdminToken, authorizePermission('orders.view'), handler)
 * Superadmin and client_admin always pass. Staff need explicit permission.
 */
export const authorizePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized." });

    // Superadmin and client_admin have all permissions
    if (["superadmin","client_admin"].includes(req.user.role)) return next();

    const perms = req.user.permissions || [];
    if (!perms.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: '${permission}' permission required.`,
      });
    }
    next();
  };
};

/**
 * requireSuperAdmin — only the SaaS superadmin can proceed
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ success: false, message: "Super admin access required." });
  }
  next();
};
