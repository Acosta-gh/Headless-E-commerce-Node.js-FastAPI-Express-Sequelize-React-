import { useState, useEffect, useCallback } from "react";
import {
  getUserOrders,
  getAllOrdersAdmin,
  getOrderById,
  getOrderByIdAdmin,
  cancelOrder,
  cancelOrderAdmin,
  updatePaymentStatus,
  updateOrderStatus,
  addTrackingNumber,
  addAdminNotes,
  getOrderStats,
} from "@/services/order.services";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [individualOrder, setIndividualOrder] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token, isAdmin } = useAuth();

  /**
   * Fetch orders (admin or user depending on role)
   */
  const fetchOrders = useCallback(
    async (filters = {}) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        let data;

        if (isAdmin) {
          // Admin: fetch all orders with filters
          data = await getAllOrdersAdmin(token, filters);
          setOrders(data.orders || []);
          setPagination(data.pagination || {});
        } else {
          // User: fetch only their orders
          data = await getUserOrders(token);
          setOrders(data || []);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error fetching orders";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin]
  );

  /**
   * Fetch single order by ID
   */
  const fetchOrderById = useCallback(
    async (orderId) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        let data;

        if (isAdmin) {
          data = await getOrderByIdAdmin(orderId, token);
        } else {
          data = await getOrderById(orderId, token);
        }

        setIndividualOrder(data.order);
        return data.order;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error fetching order";
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
   * Fetch order statistics (admin only)
   */
  const fetchOrderStats = useCallback(async () => {
    if (!token || !isAdmin) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getOrderStats(token);
      setStats(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error fetching stats";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  /**
   * Cancel order
   */
  const handleCancelOrder = useCallback(
    async (orderId, reason) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        let data;

        if (isAdmin) {
          data = await cancelOrderAdmin(orderId, reason, token);
        } else {
          data = await cancelOrder(orderId, reason, token);
        }

        toast.success("Order cancelled successfully");
        
        // Refresh orders list
        await fetchOrders();
        
        return data.order;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error cancelling order";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchOrders]
  );

  /**
   * Update payment status (admin only)
   */
  const handleUpdatePaymentStatus = useCallback(
    async (orderId, paymentStatus, note = "") => {
      if (!token || !isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        const data = await updatePaymentStatus(orderId, paymentStatus, note, token);
        toast.success("Payment status updated");
        
        // Refresh orders list
        await fetchOrders();
        
        return data.order;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error updating payment";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchOrders]
  );

  /**
   * Update order status (admin only)
   */
  const handleUpdateOrderStatus = useCallback(
    async (orderId, orderStatus) => {
      if (!token || !isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        const data = await updateOrderStatus(orderId, orderStatus, token);
        toast.success("Order status updated");
        
        // Refresh orders list
        await fetchOrders();
        
        return data.order;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error updating status";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchOrders]
  );

  /**
   * Add tracking number (admin only)
   */
  const handleAddTracking = useCallback(
    async (orderId, trackingNumber, carrierName) => {
      if (!token || !isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        const data = await addTrackingNumber(orderId, trackingNumber, carrierName, token);
        toast.success("Tracking number added");
        
        // Refresh orders list
        await fetchOrders();
        
        return data.order;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error adding tracking";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchOrders]
  );

  /**
   * Add admin notes (admin only)
   */
  const handleAddNotes = useCallback(
    async (orderId, adminNotes) => {
      if (!token || !isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        const data = await addAdminNotes(orderId, adminNotes, token);
        toast.success("Notes added");
        
        // Refresh orders list
        await fetchOrders();
        
        return data.order;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error adding notes";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, fetchOrders]
  );

  // Auto-fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    // Data
    orders,
    individualOrder,
    stats,
    pagination,
    loading,
    error,

    // Actions
    fetchOrders,
    fetchOrderById,
    fetchOrderStats,
    handleCancelOrder,
    handleUpdatePaymentStatus,
    handleUpdateOrderStatus,
    handleAddTracking,
    handleAddNotes,
  };
};