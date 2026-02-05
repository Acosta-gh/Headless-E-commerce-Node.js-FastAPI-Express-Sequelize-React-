import React, { useState } from "react";
import { Fade } from "react-awesome-reveal";
import { usePayment } from "@/hooks/usePayment";
import { toast } from "sonner";

import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
    CardDescription,
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/Loading";

import {
    CreditCard,
    DollarSign,
    Power,
    AlertCircle,
    Plus,
    Trash2,
} from "lucide-react";

function Payments() {
    // -------------------
    //      🪝 Hooks
    // -------------------
    const {
        paymentMethods,
        loading,
        error,
        fetchPaymentMethods,
        togglePayment,
        updatePayment,
        createPayment,
        deletePayment,
    } = usePayment();

    // -------------------
    //      📊 State
    // -------------------
    const [editDialog, setEditDialog] = useState(false);
    const [createDialog, setCreateDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        provider: "",
        surchargePercentage: "",
        discountPercentage: "",
    });

    // -------------------
    //   🎬 Handlers
    // -------------------
    const handleOpenEdit = (payment) => {
        setSelectedPayment(payment);
        setFormData({
            name: payment.name || "",
            code: payment.code || "",
            description: payment.description || "",
            provider: payment.provider || "",
            surchargePercentage: payment.surchargePercentage ?? "",
            discountPercentage: payment.discountPercentage ?? "",
        });
        setEditDialog(true);
    };

    const handleOpenCreate = () => {
        setFormData({
            name: "",
            code: "",
            description: "",
            provider: "",
            surchargePercentage: "",
            discountPercentage: "",
        });
        setCreateDialog(true);
    };

    const handleOpenDelete = (payment) => {
        setSelectedPayment(payment);
        setDeleteDialog(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdate = async () => {
        if (!selectedPayment) return;

        const updateData = {
            ...formData,
            //surchargePercentage: formData.surchargePercentage === "" ? 0 : parseFloat(formData.surchargePercentage),
            discountPercentage: formData.discountPercentage === "" ? 0 : parseFloat(formData.discountPercentage),
            surchargePercentage: 0,
        };

        const success = await updatePayment(selectedPayment.id, updateData);
        if (success) {
            setEditDialog(false);
            setSelectedPayment(null);
        }
    };

    const handleCreate = async () => {
        const createData = {
            ...formData,
            //surchargePercentage: formData.surchargePercentage === "" ? 0 : parseFloat(formData.surchargePercentage),
            discountPercentage: formData.discountPercentage === "" ? 0 : parseFloat(formData.discountPercentage),
            surchargePercentage: 0,
        };

        const success = await createPayment(createData);
        if (success) {
            setCreateDialog(false);
            setFormData({
                name: "",
                code: "",
                description: "",
                provider: "",
                surchargePercentage: "",
            });
        }
    };

    const handleToggle = async (payment) => {
        await togglePayment(payment.id);
    };

    const handleDelete = async () => {
        if (!selectedPayment) return;

        const success = await deletePayment(selectedPayment.id);
        if (success) {
            setDeleteDialog(false);
            setSelectedPayment(null);
        }
    };

    // -------------------
    //  🔄 Early Returns
    // -------------------
    if (loading && paymentMethods.length === 0) return <Loading />;

    // -------------------
    //     🖥️ Render
    // -------------------
    return (
        <div className="mx-auto p-8 min-h-screen max-w-7xl">
            <Fade triggerOnce duration={500}>
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Payment Methods</h1>
                        <p className="text-muted-foreground">
                            Manage available payment options for your store
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchPaymentMethods}>
                            Refresh
                        </Button>
                        {/*
                        <Button onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Method
                        </Button>
                          */}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <Card className="mb-6 border-destructive">
                        <CardContent className="flex items-center gap-2 text-destructive py-4">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </CardContent>
                    </Card>
                )}

                {/* Payments List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paymentMethods.length === 0 ? (
                        <Card className="col-span-full">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    No payment methods
                                </h3>
                                <p className="text-sm text-muted-foreground text-center max-w-md">
                                    No payment methods are currently available. Click "Add Method" to create one.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Fade cascade damping={0.05} triggerOnce duration={500}>
                            {paymentMethods.map((payment) => (
                                <Card
                                    key={payment.id}
                                    className={`${payment.enabled ? "" : "opacity-60 bg-muted/50"
                                        } hover:shadow-lg transition-shadow`}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    <CreditCard className="h-5 w-5 text-primary" />
                                                    {payment.name}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {payment.code}
                                                </CardDescription>
                                            </div>

                                            <Badge
                                                variant={payment.enabled ? "default" : "secondary"}
                                            >
                                                {payment.enabled ? "Active" : "Disabled"}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {payment.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {payment.description}
                                            </p>
                                        )}

                                        <Separator />

                                        {/* Info */}
                                        <div className="space-y-3 text-sm">
                                            {payment.surchargePercentage != null && (
                                                <div className="flex items-center justify-between hidden">
                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                        <DollarSign className="h-4 w-4" />
                                                        Fee
                                                    </span>
                                                    <span className="font-medium">
                                                        {payment.surchargePercentage}%
                                                    </span>
                                                </div>
                                            )}

                                            {payment.surchargePercentage != null && (
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                        <DollarSign className="h-4 w-4" />
                                                        Discount
                                                    </span>
                                                    <span className="font-medium">
                                                        {payment.discountPercentage}%
                                                    </span>
                                                </div>
                                            )}

                                            {payment.provider && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">
                                                        Provider
                                                    </span>
                                                    <span className="font-medium">
                                                        {payment.provider}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleOpenEdit(payment)}
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggle(payment)}
                                        >
                                            <Power
                                                className={`h-4 w-4 ${payment.enabled
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                                    }`}
                                            />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenDelete(payment)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </Fade>
                    )}
                </div>
            </Fade>

            {/* Edit Dialog */}
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Payment Method</DialogTitle>
                        <DialogDescription>
                            Update the payment method details
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Credit Card"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Code *</Label>
                            <Input
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="e.g., CREDIT_CARD"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Payment method description"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="provider">Provider</Label>
                            <Input
                                id="provider"
                                name="provider"
                                value={formData.provider}
                                onChange={handleChange}
                                placeholder="e.g., Stripe, PayPal"
                            />
                        </div>

                        <div className="space-y-2 hidden">
                            <Label htmlFor="surchargePercentage">Fee Percentage</Label>
                            <Input
                                id="surchargePercentage"
                                name="surchargePercentage"
                                type="number"
                                step="0.01"
                                value={formData.surchargePercentage}
                                onChange={handleChange}
                                placeholder="e.g., 10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discountPercentage">Discount Percentage</Label>
                            <Input
                                id="discountPercentage"
                                name="discountPercentage"
                                type="number"
                                step="0.01"
                                value={formData.discountPercentage}
                                onChange={handleChange}
                                placeholder="e.g., 10"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Dialog
            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create Payment Method</DialogTitle>
                        <DialogDescription>
                            Add a new payment method to your store
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-name">Name *</Label>
                            <Input
                                id="create-name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Credit Card"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-code">Code *</Label>
                            <Input
                                id="create-code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="e.g., CREDIT_CARD"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-description">Description</Label>
                            <Textarea
                                id="create-description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Payment method description"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-provider">Provider</Label>
                            <Input
                                id="create-provider"
                                name="provider"
                                value={formData.provider}
                                onChange={handleChange}
                                placeholder="e.g., Stripe, PayPal"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-surchargePercentage">Fee Percentage</Label>
                            <Input
                                id="create-surchargePercentage"
                                name="surchargePercentage"
                                type="number"
                                step="0.01"
                                value={formData.surchargePercentage}
                                onChange={handleChange}
                                placeholder="e.g., 2.9"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>Create Method</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            */}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will disable the payment method "{selectedPayment?.name}".
                            You can re-enable it later if needed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default Payments;