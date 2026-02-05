import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  getOrderStats,
  exportStatsToCSV,
  exportStatsToPDF,
} from "@/services/order.services";

export const useStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30d");
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  
  const { token } = useAuth();

  /**
   * Fetch order statistics
   */
  const fetchStats = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        period,
        ...dateRange,
        ...customParams
      };

      // Remove null values
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await getOrderStats(token, params);
      
      if (response.success) {
        setStats(response);
        return response;
      } else {
        throw new Error(response.message || "Failed to fetch statistics");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error loading statistics";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, period, dateRange]);

  /**
   * Change period filter
   */
  const changePeriod = useCallback((newPeriod) => {
    setPeriod(newPeriod);
    setDateRange({ startDate: null, endDate: null });
  }, []);

  /**
   * Set custom date range
   */
  const setCustomDateRange = useCallback((startDate, endDate) => {
    setDateRange({ startDate, endDate });
    setPeriod(null);
  }, []);

  /**
   * Export stats to CSV
   */
  const exportToCSV = useCallback(async (customParams = {}) => {
    try {
      const params = {
        ...dateRange,
        ...customParams
      };

      // Remove null values
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const blob = await exportStatsToCSV(token, params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-export-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("CSV exported successfully");
      return true;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error exporting to CSV";
      toast.error(message);
      return false;
    }
  }, [token, dateRange]);

  /**
   * Export stats to PDF
   */
  const exportToPDF = useCallback(async (customParams = {}) => {
    try {
      const params = {
        period,
        ...customParams
      };

      // Remove null values
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const blob = await exportStatsToPDF(token, params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stats-report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF exported successfully");
      return true;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error exporting to PDF";
      toast.error(message);
      return false;
    }
  }, [token, period]);

  /**
   * Refresh stats
   */
  const refresh = useCallback(() => {
    return fetchStats();
  }, [fetchStats]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [fetchStats, token]);

  return {
    // State
    stats,
    loading,
    error,
    period,
    dateRange,
    
    // Actions
    fetchStats,
    changePeriod,
    setCustomDateRange,
    exportToCSV,
    exportToPDF,
    refresh,
  };
};