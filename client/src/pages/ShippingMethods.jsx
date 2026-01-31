import React, { useState } from "react";
import { useShipping } from "@/hooks/useShipping";
import { Fade } from "react-awesome-reveal";

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
    DialogTrigger,
} from "@/components/ui/dialog";

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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/Loading";

import {
    Truck,
    Plus,
    Edit,
    Power,
    Trash2,
    DollarSign,
    Clock,
    Package,
    MapPin,
    AlertCircle,
} from "lucide-react";

function ShippingMethods() {
    // -------------------
    //      🪝 Hooks
    // -------------------
    const {
        shippingMethods,
        loading,
        handleCreateShippingMethod,
        handleUpdateShippingMethod,
        handleToggleStatus,
        handleDeleteShippingMethod,
    } = useShipping();

    // -------------------
    //      📦 State
    // -------------------
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);

    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        carrierName: "",
        baseCost: "",
        estimatedDaysMin: "",
        estimatedDaysMax: "",
        enabled: true,
        requiresAddress: true,
        allowCashOnDelivery: false,
        freeShippingThreshold: "",
        availableCountries: ["AR"],
        displayOrder: 1,
    });

    // -------------------
    //     🖐️ Handlers
    // -------------------
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSwitchChange = (name, checked) => {
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const resetForm = () => {
        setFormData({
            code: "",
            name: "",
            description: "",
            carrierName: "",
            baseCost: "",
            estimatedDaysMin: "",
            estimatedDaysMax: "",
            enabled: true,
            requiresAddress: true,
            allowCashOnDelivery: false,
            freeShippingThreshold: "",
            availableCountries: ["AR"],
            displayOrder: 1,
        });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        const methodData = {
            ...formData,
            baseCost: parseFloat(formData.baseCost),
            estimatedDaysMin: parseInt(formData.estimatedDaysMin),
            estimatedDaysMax: parseInt(formData.estimatedDaysMax),
            freeShippingThreshold: formData.freeShippingThreshold
                ? parseFloat(formData.freeShippingThreshold)
                : null,
            displayOrder: parseInt(formData.displayOrder),
        };

        const result = await handleCreateShippingMethod(methodData);

        if (result) {
            setIsCreateDialogOpen(false);
            resetForm();
        }
    };

    const handleEditClick = (method) => {
        setEditingMethod(method);
        setFormData({
            code: method.code,
            name: method.name,
            description: method.description || "",
            carrierName: method.carrierName || "",
            baseCost: method.baseCost.toString(),
            estimatedDaysMin: method.estimatedDaysMin.toString(),
            estimatedDaysMax: method.estimatedDaysMax.toString(),
            enabled: method.enabled,
            requiresAddress: method.requiresAddress,
            allowCashOnDelivery: method.allowCashOnDelivery,
            freeShippingThreshold: method.freeShippingThreshold?.toString() || "",
            availableCountries: method.availableCountries || ["AR"],
            displayOrder: method.displayOrder || 1,
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        const methodData = {
            ...formData,
            baseCost: parseFloat(formData.baseCost),
            estimatedDaysMin: parseInt(formData.estimatedDaysMin),
            estimatedDaysMax: parseInt(formData.estimatedDaysMax),
            freeShippingThreshold: formData.freeShippingThreshold
                ? parseFloat(formData.freeShippingThreshold)
                : null,
            displayOrder: parseInt(formData.displayOrder),
        };

        const result = await handleUpdateShippingMethod(editingMethod.id, methodData);

        if (result) {
            setIsEditDialogOpen(false);
            setEditingMethod(null);
            resetForm();
        }
    };

    const handleToggle = async (id) => {
        await handleToggleStatus(id);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            await handleDeleteShippingMethod(id);
        }
    };

    // -------------------
    //  🔄 Early Returns
    // -------------------
    if (loading && shippingMethods.length === 0) return <Loading />;

    // -------------------
    //     🖥️ Render
    // -------------------
    return (
        <div className="mx-auto p-8 min-h-screen max-w-7xl">
            <Fade triggerOnce duration={500}>
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Shipping Methods</h1>
                        <p className="text-muted-foreground">
                            Configure and manage shipping options for your store
                        </p>
                    </div>

                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Shipping Method
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create Shipping Method</DialogTitle>
                                <DialogDescription>
                                    Add a new shipping option for your customers
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="code">Code *</Label>
                                        <Input
                                            id="code"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            placeholder="standard-shipping"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Standard Shipping"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Delivery in 3-7 business days"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="carrierName">Carrier Name</Label>
                                    <Input
                                        id="carrierName"
                                        name="carrierName"
                                        value={formData.carrierName}
                                        onChange={handleInputChange}
                                        placeholder="Correo Argentino"
                                    />
                                </div>

                                <Separator />

                                {/* Pricing */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="baseCost">Base Cost * ($)</Label>
                                        <Input
                                            id="baseCost"
                                            name="baseCost"
                                            type="number"
                                            step="0.01"
                                            value={formData.baseCost}
                                            onChange={handleInputChange}
                                            placeholder="500.00"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="freeShippingThreshold">
                                            Free Shipping Threshold ($)
                                        </Label>
                                        <Input
                                            id="freeShippingThreshold"
                                            name="freeShippingThreshold"
                                            type="number"
                                            step="0.01"
                                            value={formData.freeShippingThreshold}
                                            onChange={handleInputChange}
                                            placeholder="50000.00"
                                        />
                                    </div>
                                </div>

                                {/* Delivery Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="estimatedDaysMin">Min Delivery Days *</Label>
                                        <Input
                                            id="estimatedDaysMin"
                                            name="estimatedDaysMin"
                                            type="number"
                                            value={formData.estimatedDaysMin}
                                            onChange={handleInputChange}
                                            placeholder="3"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="estimatedDaysMax">Max Delivery Days *</Label>
                                        <Input
                                            id="estimatedDaysMax"
                                            name="estimatedDaysMax"
                                            type="number"
                                            value={formData.estimatedDaysMax}
                                            onChange={handleInputChange}
                                            placeholder="7"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="displayOrder">Display Order</Label>
                                    <Input
                                        id="displayOrder"
                                        name="displayOrder"
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={handleInputChange}
                                        placeholder="1"
                                    />
                                </div>

                                <Separator />

                                {/* Switches */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="enabled">Enabled</Label>
                                        <Switch
                                            id="enabled"
                                            checked={formData.enabled}
                                            onCheckedChange={(checked) => handleSwitchChange("enabled", checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="requiresAddress">Requires Address</Label>
                                        <Switch
                                            id="requiresAddress"
                                            checked={formData.requiresAddress}
                                            onCheckedChange={(checked) =>
                                                handleSwitchChange("requiresAddress", checked)
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="allowCashOnDelivery">Allow Cash on Delivery</Label>
                                        <Switch
                                            id="allowCashOnDelivery"
                                            checked={formData.allowCashOnDelivery}
                                            onCheckedChange={(checked) =>
                                                handleSwitchChange("allowCashOnDelivery", checked)
                                            }
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreateDialogOpen(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        Create Shipping Method
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Shipping Methods List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shippingMethods.length === 0 ? (
                        <Card className="col-span-full">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No shipping methods</h3>
                                <p className="text-sm text-muted-foreground text-center max-w-md">
                                    Create your first shipping method to start offering delivery options
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Fade cascade damping={0.05} triggerOnce duration={500}>
                            {shippingMethods.map((method) => (
                                <Card
                                    key={method.id}
                                    className={`${method.enabled ? "" : "opacity-60 bg-muted/50"
                                        } hover:shadow-lg transition-shadow`}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Truck className="h-5 w-5 text-primary" />
                                                    {method.name}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {method.code}
                                                </CardDescription>
                                            </div>
                                            <Badge variant={method.enabled ? "default" : "secondary"}>
                                                {method.enabled ? "Active" : "Disabled"}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {method.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {method.description}
                                            </p>
                                        )}

                                        <Separator />

                                        {/* Info Grid */}
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-muted-foreground">
                                                    <DollarSign className="h-4 w-4" />
                                                    Base Cost
                                                </span>
                                                <span className="font-medium">
                                                    ${parseFloat(method.baseCost).toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    Delivery Time
                                                </span>
                                                <span className="font-medium">
                                                    {method.estimatedDaysMin}-{method.estimatedDaysMax} days
                                                </span>
                                            </div>

                                            {method.carrierName && (
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                        <Package className="h-4 w-4" />
                                                        Carrier
                                                    </span>
                                                    <span className="font-medium">{method.carrierName}</span>
                                                </div>
                                            )}

                                            {method.freeShippingThreshold && (
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                        <AlertCircle className="h-4 w-4" />
                                                        Free Shipping
                                                    </span>
                                                    <span className="font-medium text-green-600">
                                                        ${parseFloat(method.freeShippingThreshold).toFixed(2)}
                                                    </span>
                                                </div>
                                            )}

                                            {method.availableCountries && (
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                        <MapPin className="h-4 w-4" />
                                                        Countries
                                                    </span>
                                                    <span className="font-medium">
                                                        {method.availableCountries.join(", ")}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Features */}
                                        <div className="flex flex-wrap gap-2">
                                            {method.requiresAddress && (
                                                <Badge variant="outline" className="text-xs">
                                                    Requires Address
                                                </Badge>
                                            )}
                                            {method.allowCashOnDelivery && (
                                                <Badge variant="outline" className="text-xs">
                                                    Cash on Delivery
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditClick(method)}
                                            className="flex-1"
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggle(method.id)}
                                        >
                                            <Power
                                                className={`h-4 w-4 ${method.enabled ? "text-green-600" : "text-gray-400"
                                                    }`}
                                            />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(method.id, method.name)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </Fade>
                    )}
                </div>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Shipping Method</DialogTitle>
                            <DialogDescription>
                                Update shipping method configuration
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            {/* Same form fields as create dialog */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-code">Code *</Label>
                                    <Input
                                        id="edit-code"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="edit-name">Name *</Label>
                                    <Input
                                        id="edit-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-carrierName">Carrier Name</Label>
                                <Input
                                    id="edit-carrierName"
                                    name="carrierName"
                                    value={formData.carrierName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-baseCost">Base Cost * ($)</Label>
                                    <Input
                                        id="edit-baseCost"
                                        name="baseCost"
                                        type="number"
                                        step="0.01"
                                        value={formData.baseCost}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="edit-freeShippingThreshold">
                                        Free Shipping Threshold ($)
                                    </Label>
                                    <Input
                                        id="edit-freeShippingThreshold"
                                        name="freeShippingThreshold"
                                        type="number"
                                        step="0.01"
                                        value={formData.freeShippingThreshold}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-estimatedDaysMin">Min Delivery Days *</Label>
                                    <Input
                                        id="edit-estimatedDaysMin"
                                        name="estimatedDaysMin"
                                        type="number"
                                        value={formData.estimatedDaysMin}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="edit-estimatedDaysMax">Max Delivery Days *</Label>
                                    <Input
                                        id="edit-estimatedDaysMax"
                                        name="estimatedDaysMax"
                                        type="number"
                                        value={formData.estimatedDaysMax}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-displayOrder">Display Order</Label>
                                <Input
                                    id="edit-displayOrder"
                                    name="displayOrder"
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="edit-enabled">Enabled</Label>
                                    <Switch
                                        id="edit-enabled"
                                        checked={formData.enabled}
                                        onCheckedChange={(checked) => handleSwitchChange("enabled", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="edit-requiresAddress">Requires Address</Label>
                                    <Switch
                                        id="edit-requiresAddress"
                                        checked={formData.requiresAddress}
                                        onCheckedChange={(checked) =>
                                            handleSwitchChange("requiresAddress", checked)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="edit-allowCashOnDelivery">
                                        Allow Cash on Delivery
                                    </Label>
                                    <Switch
                                        id="edit-allowCashOnDelivery"
                                        checked={formData.allowCashOnDelivery}
                                        onCheckedChange={(checked) =>
                                            handleSwitchChange("allowCashOnDelivery", checked)
                                        }
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setEditingMethod(null);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    Update Shipping Method
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </Fade>
        </div>
    );
}

export default ShippingMethods;