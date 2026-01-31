import { useState, useEffect, useCallback } from "react";
import {
  getAllShippingMethodsAdmin,
  getShippingMethodById,
  createShippingMethod,
  updateShippingMethod,
  toggleShippingMethodStatus,
  deleteShippingMethod,
  getAvailableShippingMethods,
  calculateShippingCost,
  validateShippingMethod,
} from "@/services/shipping.services";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useShipping = () => {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [individualMethod, setIndividualMethod] = useState(null);
  const [availableMethods, setAvailableMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token, isAdmin } = useAuth();

  /**
   * Fetch all shipping methods (admin only)
   */
  const fetchShippingMethods = useCallback(async () => {
    if (!token || !isAdmin) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getAllShippingMethodsAdmin(token);
      setShippingMethods(data.methods || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error fetching shipping methods";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  /**
   * Fetch shipping method by ID
   */
  const fetchShippingMethodById = useCallback(
    async (id) => {
      if (!token || !isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getShippingMethodById(id, token);
        setIndividualMethod(data.method);
        return data.method;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error fetching shipping method";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin]
  );

  /**
   * Get available shipping methods for checkout (public)
   */
  const fetchAvailableShippingMethods = useCallback(
    async (shippingAddress, cartSubtotal, cartWeight = 0) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAvailableShippingMethods(
          shippingAddress,
          cartSubtotal,
          cartWeight
        );
        setAvailableMethods(data.methods || []);
        return data.methods || [];
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error fetching available shipping";
        setError(errorMessage);
        toast.error(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Calculate shipping cost for specific method
   */
  const calculateCost = useCallback(
    async (methodId, shippingAddress, orderSubtotal, orderWeight = 0) => {
      setLoading(true);
      setError(null);

      try {
        const data = await calculateShippingCost(
          methodId,
          shippingAddress,
          orderSubtotal,
          orderWeight
        );
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error calculating shipping cost";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Validate shipping method
   */
  const validateMethod = useCallback(
    async (methodId, shippingAddress, orderSubtotal, orderWeight = 0) => {
      setLoading(true);
      setError(null);

      try {
        const data = await validateShippingMethod(
          methodId,
          shippingAddress,
          orderSubtotal,
          orderWeight
        );
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error validating shipping method";
        setError(errorMessage);
        toast.error(errorMessage);
        return { valid: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Create new shipping method (admin)
   */
  const handleCreateShippingMethod = useCallback(
    async (methodData) => {
      if (!token || !isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        const data = await createShippingMethod(methodData, token);
        toast.success("Shipping method created successfully");

        // Refresh list
        await fetchShippingMethods();

        return data.method;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error creating shipping method";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchShippingMethods]
  );

  /**
   * Update shipping method (admin)
   */
  const handleUpdateShippingMethod = useCallback(
    async (id, methodData) => {
      if (!token || !isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        const data = await updateShippingMethod(id, methodData, token);
        toast.success("Shipping method updated successfully");

        // Refresh list
        await fetchShippingMethods();

        return data.method;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error updating shipping method";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchShippingMethods]
  );

  /**
   * Toggle shipping method status (admin)
   */
  const handleToggleStatus = useCallback(
    async (id) => {
      if (!token || !isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        const data = await toggleShippingMethodStatus(id, token);
        const status = data.method.enabled ? "enabled" : "disabled";
        toast.success(`Shipping method ${status}`);

        // Refresh list
        await fetchShippingMethods();

        return data.method;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error toggling shipping method";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchShippingMethods]
  );

  /**
   * Delete shipping method (admin)
   */
  const handleDeleteShippingMethod = useCallback(
    async (id) => {
      if (!token || !isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        await deleteShippingMethod(id, token);
        toast.success("Shipping method disabled");

        // Refresh list
        await fetchShippingMethods();

        return true;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error deleting shipping method";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchShippingMethods]
  );

  // Auto-fetch shipping methods on mount (admin only)
  useEffect(() => {
    if (isAdmin) {
      fetchShippingMethods();
    }
  }, [fetchShippingMethods, isAdmin]);

  return {
    // Data
    shippingMethods,
    individualMethod,
    availableMethods,
    loading,
    error,

    // Admin actions
    fetchShippingMethods,
    fetchShippingMethodById,
    handleCreateShippingMethod,
    handleUpdateShippingMethod,
    handleToggleStatus,
    handleDeleteShippingMethod,

    // Public actions
    fetchAvailableShippingMethods,
    calculateCost,
    validateMethod,
  };
};