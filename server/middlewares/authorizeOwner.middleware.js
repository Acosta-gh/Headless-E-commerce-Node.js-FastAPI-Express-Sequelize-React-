/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

const authorizeOwner = (getResource, allowAdmin = false) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const isAdmin = req.user.admin;

      console.log("Authorizing user:", req.user);
      console.log("Resource fetch function:", getResource);

      console.log("Allow admin override:", allowAdmin);
      if (allowAdmin && isAdmin) return next();

      const resource = await getResource(req);
      if (!resource)
        return res.status(404).json({ error: "Resource not found" });

      const ownerId = resource.userId || resource.id;
      console.log("Resource owner ID:", ownerId);
      console.log("Requesting user ID:", userId);

      if (String(ownerId) !== String(userId)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  };
};

module.exports = { authorizeOwner };
