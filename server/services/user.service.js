const { User } = require("@/models/index");
const { toSafeUser } = require("@/utils/toSafeUser");
const bcrypt = require("bcrypt");
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;

const getAllUsers = async () => {
  try {
    const users = await User.findAll();
    const safeUsers = users.map((user) => toSafeUser(user));
    return safeUsers;
  } catch (error) {
    throw new Error("Error fetching users: " + error.message);
  }
};

const getUserById = async (id) => {
  console.log("Fetching user with ID:", id);
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }
    return toSafeUser(user);
  } catch (error) {
    throw new Error("Error fetching user: " + error.message);
  }
};

const updateUser = async (id, data) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }

    if (data.email) {
      const existingEmail = await User.findOne({
        where: { email: data.email },
      });
      if (existingEmail && existingEmail.id !== id) {
        throw new Error("Email already in use");
      }
    }

    if (data.username) {
      const existingUsername = await User.findOne({
        where: { username: data.username },
      });
      if (existingUsername && existingUsername.id !== id) {
        throw new Error("Username already in use");
      }
    }

    if (user.admin && data.banned) {
      throw new Error("Cannot ban an admin user");
    }

    // Si se actualiza la contraseña, hashearla
    if (data.password) {
      data.password = await bcrypt.hash(data.password, saltRounds);
    }

    await user.update(data);

    return toSafeUser(user);
  } catch (error) {
    throw new Error("Error updating user: " + error.message);
  }
};

const deleteUser = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }
    await user.destroy();
    return true;
  } catch (error) {
    throw new Error("Error deleting user: " + error.message);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};