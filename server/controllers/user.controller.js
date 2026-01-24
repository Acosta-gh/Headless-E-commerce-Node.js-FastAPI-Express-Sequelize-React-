const userService = require("@/services/user.service");

async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function getUserById(req, res) {
  console.log("Get user by ID request for ID:", req.params.id);
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function updateUser(req, res) {
  console.log(
    "Update user request for ID:",
    req.params.id,
    "with data:",
    req.body
  );
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    console.error("Update user error:", error);
    // Specific error handling
    if (
      error.message.includes("Username already in use") ||
      error.message.includes("Email already in use")
    ) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes("Cannot ban an admin user")) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes("User not found")) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteUser(req, res) {
  try {
    const deleted = await userService.deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    return res.status(204).send();
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};