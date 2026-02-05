import React, { useState, useCallback } from "react";
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

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
    AlertCircle,
    X,
    Map,
    MapPin,
} from "lucide-react";

// Provincias de Argentina
const PROVINCES = [
    "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
    "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
    "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
    "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
    "Tierra del Fuego", "Tucumán"
];

// Componente del formulario
const ShippingMethodForm = React.memo(({ 
    formData, 
    setFormData,
    activeTab,
    setActiveTab,
    postalCodeEntry,
    setPostalCodeEntry,
    provinceEntry,
    setProvinceEntry,
    onSubmit, 
    onCancel,
    isEdit,
    loading 
}) => {
    const prefix = isEdit ? 'edit' : 'create';

    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;
        
        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    }, [setFormData]);

    const handleSwitchChange = useCallback((name, checked) => {
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    }, [setFormData]);

    // Postal Code Rules
    const addPostalCode = useCallback(() => {
        if (postalCodeEntry.code && postalCodeEntry.cost !== "") {
            setFormData(prev => ({
                ...prev,
                rules: {
                    ...prev.rules,
                    postalCodes: {
                        ...prev.rules.postalCodes,
                        [postalCodeEntry.code]: {
                            cost: parseFloat(postalCodeEntry.cost),
                            available: postalCodeEntry.available
                        }
                    }
                }
            }));
            setPostalCodeEntry({ code: "", cost: "", available: true });
        }
    }, [postalCodeEntry, setFormData, setPostalCodeEntry]);

    const removePostalCode = useCallback((code) => {
        setFormData(prev => {
            const newPostalCodes = { ...prev.rules.postalCodes };
            delete newPostalCodes[code];
            return {
                ...prev,
                rules: {
                    ...prev.rules,
                    postalCodes: newPostalCodes
                }
            };
        });
    }, [setFormData]);

    // Province Rules
    const addProvince = useCallback(() => {
        if (provinceEntry.name && provinceEntry.cost !== "") {
            setFormData(prev => ({
                ...prev,
                rules: {
                    ...prev.rules,
                    provinces: {
                        ...prev.rules.provinces,
                        [provinceEntry.name]: {
                            cost: parseFloat(provinceEntry.cost),
                            available: provinceEntry.available
                        }
                    }
                }
            }));
            setProvinceEntry({ name: "", cost: "", available: true });
        }
    }, [provinceEntry, setFormData, setProvinceEntry]);

    const removeProvince = useCallback((province) => {
        setFormData(prev => {
            const newProvinces = { ...prev.rules.provinces };
            delete newProvinces[province];
            return {
                ...prev,
                rules: {
                    ...prev.rules,
                    provinces: newProvinces
                }
            };
        });
    }, [setFormData]);

    // Handle rules changes
    const handleRulesChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            rules: {
                ...prev.rules,
                [field]: value
            }
        }));
    }, [setFormData]);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="pricing">Precios</TabsTrigger>
                    <TabsTrigger value="regions">Regiones</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`${prefix}-code`}>Código *</Label>
                            <Input
                                id={`${prefix}-code`}
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                placeholder="standard"
                                required
                                disabled={isEdit}
                            />
                        </div>

                        <div>
                            <Label htmlFor={`${prefix}-name`}>Nombre *</Label>
                            <Input
                                id={`${prefix}-name`}
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Envío Standard"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor={`${prefix}-description`}>Descripción</Label>
                        <Textarea
                            id={`${prefix}-description`}
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Entrega en 3-7 días hábiles"
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`${prefix}-carrierName`}>Transportista</Label>
                            <Input
                                id={`${prefix}-carrierName`}
                                name="carrierName"
                                value={formData.carrierName}
                                onChange={handleInputChange}
                                placeholder="Correo Argentino"
                            />
                        </div>

                        <div>
                            <Label htmlFor={`${prefix}-icon`}>Ícono URL</Label>
                            <Input
                                id={`${prefix}-icon`}
                                name="icon"
                                value={formData.icon}
                                onChange={handleInputChange}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor={`${prefix}-estimatedDaysMin`}>Días Mín</Label>
                            <Input
                                id={`${prefix}-estimatedDaysMin`}
                                name="estimatedDaysMin"
                                type="number"
                                value={formData.estimatedDaysMin}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <Label htmlFor={`${prefix}-estimatedDaysMax`}>Días Máx</Label>
                            <Input
                                id={`${prefix}-estimatedDaysMax`}
                                name="estimatedDaysMax"
                                type="number"
                                value={formData.estimatedDaysMax}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <Label htmlFor={`${prefix}-displayOrder`}>Orden</Label>
                            <Input
                                id={`${prefix}-displayOrder`}
                                name="displayOrder"
                                type="number"
                                value={formData.displayOrder}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <Label htmlFor={`${prefix}-enabled`}>Habilitado</Label>
                        <Switch
                            id={`${prefix}-enabled`}
                            checked={formData.enabled}
                            onCheckedChange={(checked) => handleSwitchChange("enabled", checked)}
                        />
                    </div>
                </TabsContent>

                {/* Pricing Tab */}
                <TabsContent value="pricing" className="space-y-4">
                    <div>
                        <Label htmlFor={`${prefix}-baseCost`}>Costo Base Nacional * ($)</Label>
                        <Input
                            id={`${prefix}-baseCost`}
                            name="baseCost"
                            type="number"
                            step="0.01"
                            value={formData.baseCost}
                            onChange={handleInputChange}
                            placeholder="15000.00"
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Precio aplicado cuando no hay coincidencia de CP o provincia
                        </p>
                    </div>

                    <Separator />

                    <div>
                        <Label htmlFor={`${prefix}-freeShippingThreshold`}>
                            Envío Gratis desde ($)
                        </Label>
                        <Input
                            id={`${prefix}-freeShippingThreshold`}
                            name="freeShippingThreshold"
                            type="number"
                            step="0.01"
                            value={formData.rules.freeShippingThreshold || ""}
                            onChange={(e) => handleRulesChange("freeShippingThreshold", 
                                e.target.value ? parseFloat(e.target.value) : null
                            )}
                            placeholder="50000.00"
                        />
                    </div>

                    <div>
                        <Label htmlFor={`${prefix}-bulkyExtra`}>Cargo Extra por Bulto ($)</Label>
                        <Input
                            id={`${prefix}-bulkyExtra`}
                            name="bulkyExtra"
                            type="number"
                            step="0.01"
                            value={formData.rules.bulkyExtra || ""}
                            onChange={(e) => handleRulesChange("bulkyExtra", 
                                e.target.value ? parseFloat(e.target.value) : null
                            )}
                            placeholder="800.00"
                        />
                    </div>
                </TabsContent>

                {/* Regional Pricing Tab */}
                <TabsContent value="regions" className="space-y-4">
                    {/* Postal Codes */}
                    <div>
                        <Label className="text-base font-semibold">Códigos Postales</Label>
                        <p className="text-xs text-muted-foreground mb-3">
                            Nivel 1 (prioridad más alta): Define costos por código postal específico
                        </p>

                        <div className="space-y-2 mb-3">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Código Postal"
                                    value={postalCodeEntry.code}
                                    onChange={(e) => setPostalCodeEntry(prev => ({
                                        ...prev,
                                        code: e.target.value
                                    }))}
                                />
                                <Input
                                    placeholder="Costo ($)"
                                    type="number"
                                    step="0.01"
                                    value={postalCodeEntry.cost}
                                    onChange={(e) => setPostalCodeEntry(prev => ({
                                        ...prev,
                                        cost: e.target.value
                                    }))}
                                />
                                <div className="flex items-center gap-2 min-w-fit">
                                    <Switch
                                        id={`${prefix}-postalAvailable`}
                                        checked={postalCodeEntry.available}
                                        onCheckedChange={(checked) => setPostalCodeEntry(prev => ({
                                            ...prev,
                                            available: checked
                                        }))}
                                    />
                                    <Label className="text-xs whitespace-nowrap">Disponible</Label>
                                </div>
                                <Button type="button" onClick={addPostalCode} size="sm">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(formData.rules.postalCodes || {}).map(([code, rule]) => (
                                <div key={code} className="flex items-center justify-between p-2 bg-muted rounded">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">{code}</span>
                                        <span className="text-sm">
                                            {rule.available !== false 
                                                ? `→ $${rule.cost}` 
                                                : '→ No disponible'
                                            }
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removePostalCode(code)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Provinces */}
                    <div>
                        <Label className="text-base font-semibold">Provincias</Label>
                        <p className="text-xs text-muted-foreground mb-3">
                            Nivel 2 (prioridad media): Define costos por provincia completa
                        </p>

                        <div className="flex gap-2 mb-3">
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={provinceEntry.name}
                                onChange={(e) => setProvinceEntry(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                            >
                                <option value="">Seleccionar provincia...</option>
                                {PROVINCES.filter(p => !formData.rules.provinces?.[p]).map(province => (
                                    <option key={province} value={province}>{province}</option>
                                ))}
                            </select>
                            <Input
                                placeholder="Costo ($)"
                                type="number"
                                step="0.01"
                                value={provinceEntry.cost}
                                onChange={(e) => setProvinceEntry(prev => ({
                                    ...prev,
                                    cost: e.target.value
                                }))}
                            />
                            <div className="flex items-center gap-2 min-w-fit">
                                <Switch
                                    id={`${prefix}-provinceAvailable`}
                                    checked={provinceEntry.available}
                                    onCheckedChange={(checked) => setProvinceEntry(prev => ({
                                        ...prev,
                                        available: checked
                                    }))}
                                />
                                <Label className="text-xs whitespace-nowrap">Disponible</Label>
                            </div>
                            <Button type="button" onClick={addProvince} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(formData.rules.provinces || {}).map(([province, rule]) => (
                                <div key={province} className="flex items-center justify-between p-2 bg-muted rounded">
                                    <div className="flex items-center gap-2">
                                        <Map className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">{province}</span>
                                        <span className="text-sm">
                                            {rule.available !== false 
                                                ? `→ $${rule.cost}` 
                                                : '→ No disponible'
                                            }
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeProvince(province)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Sistema de Cascada de Precios
                        </h4>
                        <ol className="text-xs space-y-1 text-muted-foreground">
                            <li><strong>1. Código Postal:</strong> Si existe → usar ese costo</li>
                            <li><strong>2. Provincia:</strong> Si no hay CP → usar costo provincial</li>
                            <li><strong>3. Costo Base:</strong> Si no hay CP ni provincia → usar costo nacional</li>
                        </ol>
                    </div>
                </TabsContent>
            </Tabs>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {isEdit ? "Actualizar" : "Crear"} Método de Envío
                </Button>
            </DialogFooter>
        </form>
    );
});

ShippingMethodForm.displayName = 'ShippingMethodForm';

function ShippingMethods() {
    const {
        shippingMethods,
        loading,
        handleCreateShippingMethod,
        handleUpdateShippingMethod,
        handleToggleStatus,
        handleDeleteShippingMethod,
    } = useShipping();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    const [activeTab, setActiveTab] = useState("basic");

    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        carrierName: "",
        baseCost: "",
        estimatedDaysMin: "",
        estimatedDaysMax: "",
        enabled: true,
        displayOrder: 0,
        icon: "",
        rules: {
            postalCodes: {},
            provinces: {},
            bulkyExtra: null,
            freeShippingThreshold: null,
        },
    });

    const [postalCodeEntry, setPostalCodeEntry] = useState({
        code: "",
        cost: "",
        available: true,
    });

    const [provinceEntry, setProvinceEntry] = useState({
        name: "",
        cost: "",
        available: true,
    });

    const resetForm = useCallback(() => {
        setFormData({
            code: "",
            name: "",
            description: "",
            carrierName: "",
            baseCost: "",
            estimatedDaysMin: "",
            estimatedDaysMax: "",
            enabled: true,
            displayOrder: 0,
            icon: "",
            rules: {
                postalCodes: {},
                provinces: {},
                bulkyExtra: null,
                freeShippingThreshold: null,
            },
        });
        setPostalCodeEntry({ code: "", cost: "", available: true });
        setProvinceEntry({ name: "", cost: "", available: true });
        setActiveTab("basic");
    }, []);

    const handleCreateSubmit = useCallback(async (e) => {
        e.preventDefault();

        const methodData = {
            code: formData.code,
            name: formData.name,
            description: formData.description || null,
            carrierName: formData.carrierName || null,
            baseCost: parseFloat(formData.baseCost),
            estimatedDaysMin: formData.estimatedDaysMin ? parseInt(formData.estimatedDaysMin) : null,
            estimatedDaysMax: formData.estimatedDaysMax ? parseInt(formData.estimatedDaysMax) : null,
            enabled: formData.enabled,
            displayOrder: parseInt(formData.displayOrder) || 0,
            icon: formData.icon || null,
            rules: formData.rules,
        };

        const result = await handleCreateShippingMethod(methodData);

        if (result) {
            setIsCreateDialogOpen(false);
            resetForm();
        }
    }, [formData, handleCreateShippingMethod, resetForm]);

    const handleEditClick = useCallback((method) => {
        setEditingMethod(method);
        setFormData({
            code: method.code,
            name: method.name,
            description: method.description || "",
            carrierName: method.carrierName || "",
            baseCost: method.baseCost.toString(),
            estimatedDaysMin: method.estimatedDaysMin?.toString() || "",
            estimatedDaysMax: method.estimatedDaysMax?.toString() || "",
            enabled: method.enabled,
            displayOrder: method.displayOrder || 0,
            icon: method.icon || "",
            rules: method.rules || {
                postalCodes: {},
                provinces: {},
                bulkyExtra: null,
                freeShippingThreshold: null,
            },
        });
        setActiveTab("basic");
        setIsEditDialogOpen(true);
    }, []);

    const handleEditSubmit = useCallback(async (e) => {
        e.preventDefault();

        const methodData = {
            name: formData.name,
            description: formData.description || null,
            carrierName: formData.carrierName || null,
            baseCost: parseFloat(formData.baseCost),
            estimatedDaysMin: formData.estimatedDaysMin ? parseInt(formData.estimatedDaysMin) : null,
            estimatedDaysMax: formData.estimatedDaysMax ? parseInt(formData.estimatedDaysMax) : null,
            enabled: formData.enabled,
            displayOrder: parseInt(formData.displayOrder) || 0,
            icon: formData.icon || null,
            rules: formData.rules,
        };

        const result = await handleUpdateShippingMethod(editingMethod.id, methodData);

        if (result) {
            setIsEditDialogOpen(false);
            setEditingMethod(null);
            resetForm();
        }
    }, [formData, editingMethod, handleUpdateShippingMethod, resetForm]);

    const handleToggle = useCallback(async (id) => {
        await handleToggleStatus(id);
    }, [handleToggleStatus]);

    const handleDelete = useCallback(async (id, name) => {
        if (window.confirm(`¿Estás seguro de eliminar "${name}"?`)) {
            await handleDeleteShippingMethod(id);
        }
    }, [handleDeleteShippingMethod]);

    const handleCreateCancel = useCallback(() => {
        setIsCreateDialogOpen(false);
        resetForm();
    }, [resetForm]);

    const handleEditCancel = useCallback(() => {
        setIsEditDialogOpen(false);
        setEditingMethod(null);
        resetForm();
    }, [resetForm]);

    if (loading && shippingMethods.length === 0) return <Loading />;

    return (
        <div className="mx-auto p-8 min-h-screen max-w-7xl">
            <Fade triggerOnce duration={500}>
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Métodos de Envío</h1>
                        <p className="text-muted-foreground">
                            Sistema de cascada: Código Postal → Provincia → Nacional
                        </p>
                    </div>

                    <Dialog 
                        open={isCreateDialogOpen} 
                        onOpenChange={setIsCreateDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Método
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Crear Método de Envío</DialogTitle>
                                <DialogDescription>
                                    Configura costos por código postal, provincia y nivel nacional
                                </DialogDescription>
                            </DialogHeader>
                            <ShippingMethodForm 
                                formData={formData}
                                setFormData={setFormData}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                postalCodeEntry={postalCodeEntry}
                                setPostalCodeEntry={setPostalCodeEntry}
                                provinceEntry={provinceEntry}
                                setProvinceEntry={setProvinceEntry}
                                onSubmit={handleCreateSubmit} 
                                onCancel={handleCreateCancel}
                                isEdit={false}
                                loading={loading}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Shipping Methods List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shippingMethods.length === 0 ? (
                        <Card className="col-span-full">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No hay métodos de envío</h3>
                                <p className="text-sm text-muted-foreground text-center max-w-md">
                                    Crea tu primer método de envío para comenzar
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
                                                {method.enabled ? "Activo" : "Deshabilitado"}
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
                                                    Costo Base
                                                </span>
                                                <span className="font-medium">
                                                    ${parseFloat(method.baseCost).toFixed(2)}
                                                </span>
                                            </div>

                                            {method.estimatedDaysMin && method.estimatedDaysMax && (
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        Tiempo
                                                    </span>
                                                    <span className="font-medium">
                                                        {method.estimatedDaysMin}-{method.estimatedDaysMax} días
                                                    </span>
                                                </div>
                                            )}

                                            {method.carrierName && (
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                        <Package className="h-4 w-4" />
                                                        Transportista
                                                    </span>
                                                    <span className="font-medium">{method.carrierName}</span>
                                                </div>
                                            )}

                                            {method.rules?.freeShippingThreshold && (
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                        <AlertCircle className="h-4 w-4" />
                                                        Envío Gratis
                                                    </span>
                                                    <span className="font-medium text-green-600">
                                                        ${parseFloat(method.rules.freeShippingThreshold).toFixed(2)}
                                                    </span>
                                                </div>
                                            )}

                                            {method.rules?.postalCodes && Object.keys(method.rules.postalCodes).length > 0 && (
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                        <MapPin className="h-4 w-4" />
                                                        Códigos Postales
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {Object.keys(method.rules.postalCodes).length} CPs
                                                    </Badge>
                                                </div>
                                            )}

                                            {method.rules?.provinces && Object.keys(method.rules.provinces).length > 0 && (
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                        <Map className="h-4 w-4" />
                                                        Provincias
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {Object.keys(method.rules.provinces).length} provincias
                                                    </Badge>
                                                </div>
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
                                            Editar
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
                <Dialog 
                    open={isEditDialogOpen} 
                    onOpenChange={setIsEditDialogOpen}
                >
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Editar Método de Envío</DialogTitle>
                            <DialogDescription>
                                Actualiza la configuración del método de envío
                            </DialogDescription>
                        </DialogHeader>
                        <ShippingMethodForm 
                            formData={formData}
                            setFormData={setFormData}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            postalCodeEntry={postalCodeEntry}
                            setPostalCodeEntry={setPostalCodeEntry}
                            provinceEntry={provinceEntry}
                            setProvinceEntry={setProvinceEntry}
                            onSubmit={handleEditSubmit} 
                            onCancel={handleEditCancel}
                            isEdit={true}
                            loading={loading}
                        />
                    </DialogContent>
                </Dialog>
            </Fade>
        </div>
    );
}

export default ShippingMethods;