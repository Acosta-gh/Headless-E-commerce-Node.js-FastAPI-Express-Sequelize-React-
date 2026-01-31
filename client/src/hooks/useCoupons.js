import { useState, useEffect, useCallback } from "react";
import {
  getAllCoupons,
  getCouponById,
  getCouponStats,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  validateCouponCode,
} from "@/services/coupon.services";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [individualCoupon, setIndividualCoupon] = useState(null);
  const [couponStats, setCouponStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token, isAdmin } = useAuth();

  /**
   * Fetch all coupons with optional filters
   */
  const fetchCoupons = useCallback(
    async (filters = {}) => {
      if (!token || !isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getAllCoupons(token, filters);
        setCoupons(data || []);
      } catch (err) {
        const msg = err.response?.data?.error || "Error fetching coupons";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin]
  );

  /**
   * Fetch single coupon by ID (includes usages)
   */
  const fetchCouponById = useCallback(
    async (id) => {
      if (!token || !isAdmin) return null;

      setLoading(true);
      setError(null);

      try {
        const data = await getCouponById(id, token);
        setIndividualCoupon(data);
        return data;
      } catch (err) {
        const msg = err.response?.data?.error || "Error fetching coupon";
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin]
  );

  /**
   * Fetch coupon usage stats
   */
  const fetchCouponStats = useCallback(
    async (id) => {
      if (!token || !isAdmin) return null;

      setLoading(true);
      setError(null);

      try {
        const data = await getCouponStats(id, token);
        setCouponStats(data);
        return data;
      } catch (err) {
        const msg = err.response?.data?.error || "Error fetching stats";
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin]
  );

  /**
   * Validate coupon code (public - no token needed)
   */
  const validateCode = useCallback(async (code) => {
    setLoading(true);
    setError(null);

    try {
      const data = await validateCouponCode(code);
      return { valid: true, coupon: data };
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid coupon code";
      return { valid: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new coupon
   */
  const handleCreateCoupon = useCallback(
    async (couponData) => {
      if (!token || !isAdmin) return null;

      setLoading(true);
      setError(null);

      try {
        const data = await createCoupon(couponData, token);
        toast.success(`Coupon "${data.code}" created`);
        await fetchCoupons();
        return data;
      } catch (err) {
        const msg = err.response?.data?.error || "Error creating coupon";
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchCoupons]
  );

  /**
   * Update existing coupon
   */
  const handleUpdateCoupon = useCallback(
    async (id, couponData) => {
      if (!token || !isAdmin) return null;

      setLoading(true);
      setError(null);

      try {
        const data = await updateCoupon(id, couponData, token);
        toast.success("Coupon updated");
        await fetchCoupons();
        return data;
      } catch (err) {
        const msg = err.response?.data?.error || "Error updating coupon";
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchCoupons]
  );

  /**
   * Toggle coupon active/inactive
   */
  const handleToggleStatus = useCallback(
    async (id) => {
      if (!token || !isAdmin) return null;

      setLoading(true);
      setError(null);

      try {
        const data = await toggleCouponStatus(id, token);
        toast.success(`Coupon ${data.isActive ? "activated" : "deactivated"}`);
        await fetchCoupons();
        return data;
      } catch (err) {
        const msg = err.response?.data?.error || "Error toggling coupon";
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchCoupons]
  );

  /**
   * Delete coupon (backend rejects if coupon has been used)
   */
  const handleDeleteCoupon = useCallback(
    async (id) => {
      if (!token || !isAdmin) return false;

      setLoading(true);
      setError(null);

      try {
        await deleteCoupon(id, token);
        toast.success("Coupon deleted");
        await fetchCoupons();
        return true;
      } catch (err) {
        const msg = err.response?.data?.error || "Error deleting coupon";
        setError(msg);
        toast.error(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchCoupons]
  );

  // Auto-fetch on mount (admin only)
  useEffect(() => {
    if (isAdmin) {
      fetchCoupons();
    }
  }, [fetchCoupons, isAdmin]);

  return {
    // Data
    coupons,
    individualCoupon,
    couponStats,
    loading,
    error,

    // Actions
    fetchCoupons,
    fetchCouponById,
    fetchCouponStats,
    validateCode,
    handleCreateCoupon,
    handleUpdateCoupon,
    handleToggleStatus,
    handleDeleteCoupon,
  };
};