import React, { useState, useMemo } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { Fade } from "react-awesome-reveal";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/Loading";
import PaginationControls from "@/components/common/PaginationControls";

import {
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    DollarSign,
    Eye,
    Calendar,
    User,
    MapPin,
    Edit,
    Ban,
    FileText,
} from "lucide-react";

function OrdersPage() {
    // -------------------
    //      🪝 Hooks
    // -------------------
    const { isAdmin } = useAuth();
    const {
        orders,
        loading,
        fetchOrders,
        handleUpdatePaymentStatus,
        handleUpdateOrderStatus,
        handleAddTracking,
        handleAddNotes,
        handleCancelOrder,
    } = useOrders();

    // -------------------
    //      📦 State
    // -------------------
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [paymentDialog, setPaymentDialog] = useState(false);
    const [statusDialog, setStatusDialog] = useState(false);
    const [trackingDialog, setTrackingDialog] = useState(false);
    const [notesDialog, setNotesDialog] = useState(false);
    const [cancelDialog, setCancelDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Form states
    const [paymentStatusForm, setPaymentStatusForm] = useState("");
    const [paymentNote, setPaymentNote] = useState("");
    const [orderStatusForm, setOrderStatusForm] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [carrierName, setCarrierName] = useState("");
    const [adminNotes, setAdminNotes] = useState("");
    const [cancelReason, setCancelReason] = useState("");

    // -------------------
    //   🎨 Order Status
    // -------------------
    const getOrderStatusConfig = (status) => {
        const configs = {
            created: {
                label: "Created",
                variant: "secondary",
                icon: Clock,
                color: "text-gray-500",
            },
            confirmed: {
                label: "Confirmed",
                variant: "default",
                icon: CheckCircle,
                color: "text-blue-500",
            },
            processing: {
                label: "Processing",
                variant: "default",
                icon: Package,
                color: "text-yellow-500",
            },
            shipped: {
                label: "Shipped",
                variant: "default",
                icon: Truck,
                color: "text-purple-500",
            },
            delivered: {
                label: "Delivered",
                variant: "default",
                icon: CheckCircle,
                color: "text-green-500",
            },
            cancelled: {
                label: "Cancelled",
                variant: "destructive",
                icon: XCircle,
                color: "text-red-500",
            },
        };
        return configs[status] || configs.created;
    };

    const getPaymentStatusConfig = (status) => {
        const configs = {
            unpaid: {
                label: "Unpaid",
                variant: "destructive",
                color: "text-red-500",
            },
            pending: {
                label: "Pending",
                variant: "secondary",
                color: "text-yellow-500",
            },
            paid: {
                label: "Paid",
                variant: "default",
                color: "text-green-500",
            },
            failed: {
                label: "Failed",
                variant: "destructive",
                color: "text-red-500",
            },
            refunded: {
                label: "Refunded",
                variant: "secondary",
                color: "text-gray-500",
            },
        };
        return configs[status] || configs.pending;
    };

    // -------------------
    //   🔍 Filtering
    // -------------------
    const filteredOrders = useMemo(() => {
        let filtered = [...orders];

        if (statusFilter !== "all") {
            filtered = filtered.filter((order) => order.orderStatus === statusFilter);
        }

        if (paymentFilter !== "all") {
            filtered = filtered.filter((order) => order.paymentStatus === paymentFilter);
        }

        return filtered;
    }, [orders, statusFilter, paymentFilter]);

    // -------------------
    //   📄 Pagination
    // -------------------
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredOrders.slice(start, end);
    }, [filteredOrders, currentPage, itemsPerPage]);

    // -------------------
    //     🖐️ Handlers
    // -------------------
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handlePaymentFilterChange = (value) => {
        setPaymentFilter(value);
        setCurrentPage(1);
    };

    // -------------------
    //   📝 Modal Handlers
    // -------------------
    const openPaymentDialog = (order) => {
        setSelectedOrder(order);
        setPaymentStatusForm(order.paymentStatus);
        setPaymentNote("");
        setPaymentDialog(true);
    };

    const openStatusDialog = (order) => {
        setSelectedOrder(order);
        setOrderStatusForm(order.orderStatus);
        setStatusDialog(true);
    };

    const openTrackingDialog = (order) => {
        setSelectedOrder(order);
        setTrackingNumber(order.trackingNumber || "");
        setCarrierName(order.carrierName || "");
        setTrackingDialog(true);
    };

    const openNotesDialog = (order) => {
        setSelectedOrder(order);
        setAdminNotes(order.adminNotes || "");
        setNotesDialog(true);
    };

    const openCancelDialog = (order) => {
        setSelectedOrder(order);
        setCancelReason("");
        setCancelDialog(true);
    };

    // -------------------
    //   💾 Submit Handlers
    // -------------------
    const submitPaymentUpdate = async () => {
        if (!selectedOrder) return;

        const success = await handleUpdatePaymentStatus(
            selectedOrder.id,
            paymentStatusForm,
            paymentNote
        );

        if (success) {
            setPaymentDialog(false);
            setSelectedOrder(null);
        }
    };

    const submitStatusUpdate = async () => {
        if (!selectedOrder) return;

        const success = await handleUpdateOrderStatus(
            selectedOrder.id,
            orderStatusForm
        );

        if (success) {
            setStatusDialog(false);
            setSelectedOrder(null);
        }
    };

    const submitTracking = async () => {
        if (!selectedOrder || !trackingNumber.trim()) {
            toast.error("Tracking number is required");
            return;
        }

        const success = await handleAddTracking(
            selectedOrder.id,
            trackingNumber,
            carrierName
        );

        if (success) {
            setTrackingDialog(false);
            setSelectedOrder(null);
        }
    };

    const submitNotes = async () => {
        if (!selectedOrder) return;

        const success = await handleAddNotes(selectedOrder.id, adminNotes);

        if (success) {
            setNotesDialog(false);
            setSelectedOrder(null);
        }
    };

    const submitCancel = async () => {
        if (!selectedOrder) return;

        const success = await handleCancelOrder(selectedOrder.id, cancelReason);

        if (success) {
            setCancelDialog(false);
            setSelectedOrder(null);
        }
    };

    // -------------------
    //  🔄 Early Returns
    // -------------------
    if (loading && orders.length === 0) return <Loading />;

    // -------------------
    //     🖥️ Render
    // -------------------
    return (
        <div className="mx-auto p-8 min-h-screen max-w-7xl">
            <Fade triggerOnce duration={500}>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {isAdmin ? "All Orders" : "My Orders"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isAdmin
                            ? "Manage and track all customer orders"
                            : "Track your order history and current orders"}
                    </p>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Order Status Filter */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Order Status
                                </label>
                                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="created">Created</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Payment Status Filter */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Payment Status
                                </label>
                                <Select value={paymentFilter} onValueChange={handlePaymentFilterChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by payment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Payments</SelectItem>
                                        <SelectItem value="unpaid">Unpaid</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-end">
                                <div className="text-sm text-muted-foreground">
                                    Showing <span className="font-medium">{filteredOrders.length}</span>{" "}
                                    {filteredOrders.length === 1 ? "order" : "orders"}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders List */}
                <div className="space-y-4">
                    {paginatedOrders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                                <p className="text-sm text-muted-foreground text-center max-w-md">
                                    {statusFilter !== "all" || paymentFilter !== "all"
                                        ? "Try adjusting your filters to see more results."
                                        : isAdmin
                                            ? "No orders have been placed yet."
                                            : "You haven't placed any orders yet. Start shopping!"}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Fade cascade damping={0.05} triggerOnce duration={500}>
                            {paginatedOrders.map((order) => {
                                const statusConfig = getOrderStatusConfig(order.orderStatus);
                                const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <Card key={order.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-semibold text-lg">
                                                            Order #{order.orderNumber}
                                                        </h3>
                                                        <Badge variant={statusConfig.variant}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {statusConfig.label}
                                                        </Badge>
                                                        <Badge variant={paymentConfig.variant}>
                                                            <DollarSign className="h-3 w-3 mr-1" />
                                                            {paymentConfig.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(order.createdAt).toLocaleDateString("es-ES", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}
                                                        </div>
                                                        {isAdmin && order.customerName && (
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-4 w-4" />
                                                                {order.customerName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-2xl font-bold">
                                                        ${parseFloat(order.totalAmount).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {order.items?.length || 0}{" "}
                                                        {order.items?.length === 1 ? "item" : "items"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="space-y-4">
                                                {/* Order Items Preview */}
                                                {order.items && order.items.length > 0 && (
                                                    <div>
                                                        <p className="text-sm font-medium mb-2">Items:</p>
                                                        <div className="space-y-2">
                                                            {order.items.slice(0, 2).map((item) => (
                                                                <div
                                                                    key={item.id}
                                                                    className="flex justify-between text-sm bg-muted/50 rounded p-2"
                                                                >
                                                                    <span className="truncate">
                                                                        {item.quantity}x {item.title}
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        ${parseFloat(item.subtotal).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            {order.items.length > 2 && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    + {order.items.length - 2} more items
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <Separator />

                                                {/* Shipping Info */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="font-medium mb-1">Shipping Address</p>
                                                        <div className="flex items-start gap-2 text-muted-foreground">
                                                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p>{order.shippingAddress}</p>
                                                                <p>
                                                                    {order.shippingCity}, {order.shippingState}{" "}
                                                                    {order.shippingPostalCode}
                                                                </p>
                                                                <p>{order.shippingCountry}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="font-medium mb-1">Shipping Method</p>
                                                        <div className="flex items-start gap-2 text-muted-foreground">
                                                            <Truck className="h-4 w-4 mt-0.5" />
                                                            <div>
                                                                <p>{order.shippingMethod?.name || "N/A"}</p>
                                                                {order.trackingNumber && (
                                                                    <p className="text-xs">
                                                                        Tracking: {order.trackingNumber}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Notes */}
                                                {order.orderNotes && (
                                                    <div>
                                                        <p className="text-sm font-medium mb-1">Customer Notes:</p>
                                                        <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                                                            {order.orderNotes}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Admin Notes (admin only) */}
                                                {isAdmin && order.adminNotes && (
                                                    <div>
                                                        <p className="text-sm font-medium mb-1">Admin Notes:</p>
                                                        <p className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 rounded p-2">
                                                            {order.adminNotes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div className="text-sm text-muted-foreground">
                                                Payment: {order.paymentMethod?.name || "N/A"}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {/* Admin Actions */}
                                                {isAdmin && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openPaymentDialog(order)}
                                                        >
                                                            <DollarSign className="h-4 w-4 mr-1" />
                                                            Payment
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openStatusDialog(order)}
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Status
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openTrackingDialog(order)}
                                                        >
                                                            <Truck className="h-4 w-4 mr-1" />
                                                            Tracking
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openNotesDialog(order)}
                                                        >
                                                            <FileText className="h-4 w-4 mr-1" />
                                                            Notes
                                                        </Button>
                                                        {order.orderStatus !== "cancelled" && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openCancelDialog(order)}
                                                            >
                                                                <Ban className="h-4 w-4 mr-1" />
                                                                Cancel
                                                            </Button>
                                                        )}
                                                    </>
                                                )}

                                                {/* View Details (all users) */}
                                                <Link
                                                    to={
                                                        isAdmin
                                                            ? `/admin/orders/${order.id}`
                                                            : `/my-orders/${order.id}`
                                                    }
                                                >
                                                    <Button variant="default" size="sm">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </Fade>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="mt-8">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </Fade>

            {/* ==================== */}
            {/*    ADMIN MODALS      */}
            {/* ==================== */}

            {/* Payment Status Dialog */}
            <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Payment Status</DialogTitle>
                        <DialogDescription>
                            Order #{selectedOrder?.orderNumber}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Payment Status</Label>
                            <Select value={paymentStatusForm} onValueChange={setPaymentStatusForm}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Note (Optional)</Label>
                            <Textarea
                                value={paymentNote}
                                onChange={(e) => setPaymentNote(e.target.value)}
                                placeholder="Add a note about this payment update..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={submitPaymentUpdate}>Update Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Order Status Dialog */}
            <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Order Status</DialogTitle>
                        <DialogDescription>
                            Order #{selectedOrder?.orderNumber}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Order Status</Label>
                            <Select value={orderStatusForm} onValueChange={setOrderStatusForm}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created">Created</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedOrder?.paymentStatus !== "paid" &&
                            (orderStatusForm === "shipped" || orderStatusForm === "delivered") && (
                                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        ⚠️ Warning: Order must be paid before marking as shipped or delivered.
                                    </p>
                                </div>
                            )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={submitStatusUpdate}>Update Status</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Tracking Number Dialog */}
            <Dialog open={trackingDialog} onOpenChange={setTrackingDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Tracking Information</DialogTitle>
                        <DialogDescription>
                            Order #{selectedOrder?.orderNumber}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tracking Number *</Label>
                            <Input
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="e.g., 1Z999AA10123456784"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Carrier Name</Label>
                            <Input
                                value={carrierName}
                                onChange={(e) => setCarrierName(e.target.value)}
                                placeholder="e.g., UPS, FedEx, Correo Argentino"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTrackingDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={submitTracking}>Add Tracking</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Admin Notes Dialog */}
            <Dialog open={notesDialog} onOpenChange={setNotesDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Admin Notes</DialogTitle>
                        <DialogDescription>
                            Order #{selectedOrder?.orderNumber}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Internal Notes</Label>
                            <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add internal notes about this order..."
                                rows={5}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNotesDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={submitNotes}>Save Notes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Order Dialog */}
            <AlertDialog open={cancelDialog} onOpenChange={setCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel order #{selectedOrder?.orderNumber}?
                            This action will restore the stock for all items in this order.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2 py-4">
                        <Label>Cancellation Reason</Label>
                        <Textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter reason for cancellation..."
                            rows={3}
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Don't Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={submitCancel}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Cancel Order
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default OrdersPage;