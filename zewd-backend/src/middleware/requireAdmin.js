/**
 * Protects admin-only routes (e.g. viewing all leads) with a shared secret key.
 * The frontend admin panel (if you build one) sends this in a header:
 *   x-admin-key: <ADMIN_API_KEY>
 */
function requireAdmin(req, res, next) {
  const key = req.headers["x-admin-key"];

  if (!process.env.ADMIN_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "Server misconfiguration: ADMIN_API_KEY is not set",
    });
  }

  if (!key || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized: invalid or missing admin key" });
  }

  next();
}

module.exports = requireAdmin;
