import { useEffect, useState, useCallback } from "react";
import {
  getUserById,
  getAllUsers,
  deleteUser,
  updateUser as updateUserService,
} from "@/services/user.services";

import { useAuth } from "@/hooks/useAuth";

export const useUser = () => {
  const { token } = useAuth();

  const [individualUser, setIndividualUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /*
   * Update user data
   * @param {string} userId - ID of the user to update
   * @param {Object} userData - Data to update
   */
  const updateUser = useCallback(async (userId, userData) => {
    setLoading(true);
    try {
      const updatedUser = await updateUserService(userId, userData, token);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? updatedUser : user))
      );

      return updatedUser;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Fetch a user by ID from the server
   *  @param {string} userId - ID of the user to fetch
   */
  const getUser = useCallback(async (userId) => {
    setLoading(true);
    try {
      const user = await getUserById(userId, token);
      setIndividualUser(user);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Fetch all users from the server
   */
  const fetchUsers = useCallback(async () => {
    console.log("Fetching users hook");
    setLoading(true);
    try {
      const data = await getAllUsers(token);
      setUsers(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    individualUser,
    users,
    loading,
    error,
    getUser,
    updateUser,
  };
};
