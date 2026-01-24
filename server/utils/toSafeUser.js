const toSafeUser = (user) => {
  const safeUser = user.toJSON();
  delete safeUser.password; // Remove password before returning
  return safeUser;
};

module.exports = { toSafeUser };