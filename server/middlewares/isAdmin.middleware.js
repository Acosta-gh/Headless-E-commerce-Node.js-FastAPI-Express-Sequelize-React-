function isAdmin(req, res, next) {
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ error: "Admin privileges required." });
  }
  next();
}

module.exports = { isAdmin };