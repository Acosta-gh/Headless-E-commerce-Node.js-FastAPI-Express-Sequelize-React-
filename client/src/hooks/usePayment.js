import { useState, useEffect, useCallback } from "react";
import {
    getAllPaymentMethodsAdmin,
    togglePaymentMethodStatus,
    updatePaymentMethod,
    createPaymentMethod,
    deletePaymentMethod,
} from "@/services/payment.services";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const usePayment = () => {
    const [paymentMethods, setPaymentsMethods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, isAdmin } = useAuth();

    console.log("[usePayment] hook mounted");

    const fetchPaymentMethods = useCallback(async () => {
        if (!token || !isAdmin) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getAllPaymentMethodsAdmin(token);
            console.log("[usePayment] API response", data);
            setPaymentsMethods(Array.isArray(data.methods) ? data.methods : []);
        } catch (err) {
            const msg = err.response?.data?.error || "Error fetching payment methods";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [token, isAdmin]);

    const togglePayment = async (id) => {
        try {
            await togglePaymentMethodStatus(id, token);
            toast.success("Payment method status updated");
            await fetchPaymentMethods();
            return true;
        } catch (err) {
            const msg = err.response?.data?.error || "Error toggling payment method";
            toast.error(msg);
            return false;
        }
    };

    const updatePayment = async (id, data) => {
        try {
            await updatePaymentMethod(id, data, token);
            toast.success("Payment method updated successfully");
            await fetchPaymentMethods();
            return true;
        } catch (err) {
            const msg = err.response?.data?.error || "Error updating payment method";
            toast.error(msg);
            return false;
        }
    };

    const createPayment = async (data) => {
        try {
            await createPaymentMethod(data, token);
            toast.success("Payment method created successfully");
            await fetchPaymentMethods();
            return true;
        } catch (err) {
            const msg = err.response?.data?.error || "Error creating payment method";
            toast.error(msg);
            return false;
        }
    };

    const deletePayment = async (id) => {
        try {
            await deletePaymentMethod(id, token);
            toast.success("Payment method deleted successfully");
            await fetchPaymentMethods();
            return true;
        } catch (err) {
            const msg = err.response?.data?.error || "Error deleting payment method";
            toast.error(msg);
            return false;
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, [fetchPaymentMethods]);

    return {
        paymentMethods,
        loading,
        error,
        fetchPaymentMethods,
        togglePayment,
        updatePayment,
        createPayment,
        deletePayment,
    };
};