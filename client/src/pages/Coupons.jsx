import React, { useState, useMemo } from "react";
import { useCoupons } from "@/hooks/useCoupons";
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/Loading";

import {
  Tag,
  Plus,
  Edit,
  Power,
  Trash2,
  BarChart3,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Users,
  X,
  Package,
  Layers,
} from "lucide-react";

// =====================
// Multi-Select Dropdown Component
// =====================
const MultiSelect = ({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Select items...",
  label,
  icon: Icon
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleItem = (id) => {
    const newValue = value.includes(id)
      ? value.filter(v => v !== id)
      : [...value, id];
    onChange(newValue);
  };

  const selectedLabels = options
    .filter(opt => value.includes(opt.id))
    .map(opt => opt.label || opt.name || opt.title)
    .join(", ");

  return (
    <div className="relative">
      <div
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer hover:bg-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`flex items-center gap-2 ${!selectedLabels ? "text-muted-foreground" : ""}`}>
          {Icon && <Icon className="h-4 w-4" />}
          {selectedLabels || placeholder}
        </span>
        <span className="text-xs text-muted-foreground">
          {value.length > 0 && `(${value.length})`}
        </span>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="p-2">
              {options.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No options available
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItem(option.id);
                    }}
                  >
                    <div className={`h-4 w-4 border rounded flex items-center justify-center ${
                      value.includes(option.id) ? "bg-primary border-primary" : "border-input"
                    }`}>
                      {value.includes(option.id) && (
                        <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">
                      {option.label || option.name || option.title}
                      {option.sku && <span className="text-xs text-muted-foreground ml-1">({option.sku})</span>}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function Coupons() {
  // -------------------
  //      🪝 Hooks
  // -------------------
  const {
    coupons,
    loading: couponsLoading,
    fetchCouponStats,
    handleCreateCoupon,
    handleUpdateCoupon,
    handleToggleStatus,
    handleDeleteCoupon,
  } = useCoupons();

  const { articles, loading: articlesLoading } = useArticles();
  const { categories, loading: categoriesLoading } = useCategories();

  // -------------------
  //      📦 State
  // -------------------
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [statsData, setStatsData] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // =====================
  // Form state — usando arrays para los selects
  // =====================
  const initialForm = {
    code: "",
    description: "",
    // Discount
    discountType: "percentage",
    discountValue: "",
    maxDiscountAmount: "",
    // Order requirement
    minOrderAmount: "",
    // Usage limits
    usageLimit: "",
    usagePerUser: "1",
    // Product / category restrictions (ahora arrays de IDs)
    appliesToProducts: [],
    appliesToCategories: [],
    excludedProducts: [],
    excludedCategories: [],
    // User restrictions
    specificUsers: "",
    newUsersOnly: false,
    // Combination rules
    combinable: false,
    combineWithPaymentDiscount: true,
    // Validity
    startsAt: "",
    expiresAt: "",
    // Status
    isActive: true,
    // Meta
    campaignName: "",
    internalNotes: "",
  };

  const [form, setForm] = useState(initialForm);

  // -------------------
  //   🔍 Filtering
  // -------------------
  const filtered = useMemo(() => {
    let list = [...coupons];
    if (typeFilter !== "all") list = list.filter((c) => c.discountType === typeFilter);
    if (statusFilter !== "all") {
      const active = statusFilter === "active";
      list = list.filter((c) => c.isActive === active);
    }
    return list;
  }, [coupons, typeFilter, statusFilter]);

  // -------------------
  //   🎨 Display helpers
  // -------------------
  const typeConfig = {
    percentage: { label: "Percentage", icon: Percent, color: "text-blue-500" },
    fixed: { label: "Fixed", icon: DollarSign, color: "text-green-500" },
    free_shipping: { label: "Free Shipping", icon: Truck, color: "text-purple-500" },
  };

  const formatDiscount = (c) => {
    if (c.discountType === "percentage") return `${c.discountValue}%`;
    if (c.discountType === "fixed") return `$${parseFloat(c.discountValue).toFixed(2)}`;
    return "Free Shipping";
  };

  const isExpired = (c) => c.expiresAt && new Date(c.expiresAt) < new Date();

  // Helper para mostrar nombres de productos/categorías
  const getProductNames = (ids) => {
    if (!ids || ids.length === 0) return null;
    return articles
      .filter(a => ids.includes(a.id))
      .map(a => a.title)
      .join(", ");
  };

  const getCategoryNames = (ids) => {
    if (!ids || ids.length === 0) return null;
    return categories
      .filter(c => ids.includes(c.id))
      .map(c => c.name)
      .join(", ");
  };

  // -------------------
  //     🖐️ Handlers
  // -------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (name, checked) => {
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleArrayChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm(initialForm);

  /** Build the payload that matches the backend model */
  const buildPayload = () => ({
    code: form.code,
    description: form.description || null,
    discountType: form.discountType,
    discountValue: ["percentage", "fixed"].includes(form.discountType)
      ? parseFloat(form.discountValue)
      : null,
    maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
    minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
    usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
    usagePerUser: form.usagePerUser ? parseInt(form.usagePerUser) : 1,
    // JSON array fields (ya son arrays)
    appliesToProducts: form.appliesToProducts.length > 0 ? form.appliesToProducts : null,
    appliesToCategories: form.appliesToCategories.length > 0 ? form.appliesToCategories : null,
    excludedProducts: form.excludedProducts.length > 0 ? form.excludedProducts : null,
    excludedCategories: form.excludedCategories.length > 0 ? form.excludedCategories : null,
    specificUsers: form.specificUsers ? form.specificUsers.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : null,
    // Booleans
    newUsersOnly: form.newUsersOnly,
    combinable: form.combinable,
    combineWithPaymentDiscount: form.combineWithPaymentDiscount,
    // Dates
    startsAt: form.startsAt || null,
    expiresAt: form.expiresAt || null,
    isActive: form.isActive,
    // Meta
    campaignName: form.campaignName || null,
    internalNotes: form.internalNotes || null,
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const result = await handleCreateCoupon(buildPayload());
    if (result) { setIsCreateOpen(false); resetForm(); }
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue?.toString() || "",
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
      minOrderAmount: coupon.minOrderAmount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      usagePerUser: coupon.usagePerUser?.toString() || "1",
      appliesToProducts: coupon.appliesToProducts || [],
      appliesToCategories: coupon.appliesToCategories || [],
      excludedProducts: coupon.excludedProducts || [],
      excludedCategories: coupon.excludedCategories || [],
      specificUsers: coupon.specificUsers ? coupon.specificUsers.join(", ") : "",
      newUsersOnly: coupon.newUsersOnly || false,
      combinable: coupon.combinable || false,
      combineWithPaymentDiscount: coupon.combineWithPaymentDiscount ?? true,
      startsAt: coupon.startsAt ? coupon.startsAt.split("T")[0] : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
      isActive: coupon.isActive,
      campaignName: coupon.campaignName || "",
      internalNotes: coupon.internalNotes || "",
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const result = await handleUpdateCoupon(editingCoupon.id, buildPayload());
    if (result) { setIsEditOpen(false); setEditingCoupon(null); resetForm(); }
  };

  const openStats = async (coupon) => {
    const stats = await fetchCouponStats(coupon.id);
    if (stats) {
      setStatsData({ coupon, stats });
      setIsStatsOpen(true);
    }
  };

  const confirmDelete = async (coupon) => {
    if (window.confirm(`Delete "${coupon.code}"? This cannot be undone.`)) {
      await handleDeleteCoupon(coupon.id);
    }
  };

  // Preparar opciones para los dropdowns
  const productOptions = useMemo(() => {
    return (articles || []).map(a => ({
      id: a.id,
      title: a.title,
      sku: a.sku,
      label: a.title, // Para compatibilidad con MultiSelect
    }));
  }, [articles]);

  const categoryOptions = useMemo(() => {
    return (categories || []).map(c => ({
      id: c.id,
      name: c.name,
      label: c.name, // Para compatibilidad con MultiSelect
    }));
  }, [categories]);

  // -------------------
  //  🔄 Early Returns
  // -------------------
  const loading = couponsLoading || articlesLoading || categoriesLoading;
  if (loading && coupons.length === 0) return <Loading />;

  // -------------------
  //     🖥️ Shared Form
  // -------------------
  const renderForm = (onSubmit, submitLabel) => (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* ── Basic ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Code *</Label>
          <Input id="code" name="code" value={form.code} onChange={handleChange} placeholder="SUMMER20" required />
        </div>
        <div>
          <Label htmlFor="discountType">Type *</Label>
          <Select value={form.discountType} onValueChange={(v) => handleSwitch("discountType", v)}>
            <SelectTrigger id="discountType"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
              <SelectItem value="free_shipping">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" value={form.description} onChange={handleChange} placeholder="Summer promo — 20% off" />
      </div>

      {/* ── Discount value ── */}
      {form.discountType !== "free_shipping" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="discountValue">
              {form.discountType === "percentage" ? "Percentage (%)" : "Amount ($)"} *
            </Label>
            <Input
              id="discountValue" name="discountValue" type="number"
              step={form.discountType === "percentage" ? "1" : "0.01"}
              value={form.discountValue} onChange={handleChange}
              placeholder={form.discountType === "percentage" ? "20" : "500.00"} required
            />
          </div>
          <div>
            <Label htmlFor="maxDiscountAmount">
              {form.discountType === "percentage" ? "Max Cap ($)" : "—"}
            </Label>
            <Input
              id="maxDiscountAmount" name="maxDiscountAmount" type="number" step="0.01"
              value={form.maxDiscountAmount} onChange={handleChange} placeholder="5000.00"
              disabled={form.discountType !== "percentage"}
            />
          </div>
        </div>
      )}

      <Separator />

      {/* ── Usage limits ── */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="minOrderAmount">Min Order ($)</Label>
          <Input id="minOrderAmount" name="minOrderAmount" type="number" step="0.01" value={form.minOrderAmount} onChange={handleChange} placeholder="1000" />
        </div>
        <div>
          <Label htmlFor="usageLimit">Total Uses</Label>
          <Input id="usageLimit" name="usageLimit" type="number" value={form.usageLimit} onChange={handleChange} placeholder="Unlimited" />
        </div>
        <div>
          <Label htmlFor="usagePerUser">Per User</Label>
          <Input id="usagePerUser" name="usagePerUser" type="number" value={form.usagePerUser} onChange={handleChange} placeholder="1" />
        </div>
      </div>

      {/* ── Dates ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startsAt">Valid From</Label>
          <Input id="startsAt" name="startsAt" type="date" value={form.startsAt} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="expiresAt">Expires At</Label>
          <Input id="expiresAt" name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} />
        </div>
      </div>

      <Separator />

      {/* ── Product & Category Restrictions ── */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product & Category Restrictions</p>
      <p className="text-xs text-muted-foreground -mt-3">Select products and categories. Leave empty to apply to all.</p>

      <div className="space-y-4">
        <div>
          <Label>Applies To Products</Label>
          <MultiSelect
            options={productOptions}
            value={form.appliesToProducts}
            onChange={(val) => handleArrayChange("appliesToProducts", val)}
            placeholder="All products"
            icon={Package}
          />
        </div>

        <div>
          <Label>Applies To Categories</Label>
          <MultiSelect
            options={categoryOptions}
            value={form.appliesToCategories}
            onChange={(val) => handleArrayChange("appliesToCategories", val)}
            placeholder="All categories"
            icon={Layers}
          />
        </div>

        <div>
          <Label>Excluded Products</Label>
          <MultiSelect
            options={productOptions}
            value={form.excludedProducts}
            onChange={(val) => handleArrayChange("excludedProducts", val)}
            placeholder="No exclusions"
            icon={Package}
          />
        </div>

        <div>
          <Label>Excluded Categories</Label>
          <MultiSelect
            options={categoryOptions}
            value={form.excludedCategories}
            onChange={(val) => handleArrayChange("excludedCategories", val)}
            placeholder="No exclusions"
            icon={Layers}
          />
        </div>
      </div>

      <Separator />

      {/* ── User restrictions ── */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">User Restrictions</p>

      <div>
        <Label htmlFor="specificUsers">Specific Users (IDs, comma-separated)</Label>
        <Input id="specificUsers" name="specificUsers" value={form.specificUsers} onChange={handleChange} placeholder="Leave empty for all users" />
      </div>

      <Separator />

      {/* ── Switches ── */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
        <div className="flex items-center justify-between">
          <Label>Active</Label>
          <Switch checked={form.isActive} onCheckedChange={(v) => handleSwitch("isActive", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>New Users Only</Label>
          <Switch checked={form.newUsersOnly} onCheckedChange={(v) => handleSwitch("newUsersOnly", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Combinable</Label>
          <Switch checked={form.combinable} onCheckedChange={(v) => handleSwitch("combinable", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Combine w/ Payment Discount</Label>
          <Switch checked={form.combineWithPaymentDiscount} onCheckedChange={(v) => handleSwitch("combineWithPaymentDiscount", v)} />
        </div>
      </div>

      <Separator />

      {/* ── Meta ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="campaignName">Campaign</Label>
          <Input id="campaignName" name="campaignName" value={form.campaignName} onChange={handleChange} placeholder="Summer 2026" />
        </div>
        <div>
          <Label htmlFor="internalNotes">Internal Notes</Label>
          <Input id="internalNotes" name="internalNotes" value={form.internalNotes} onChange={handleChange} placeholder="Admin notes..." />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); resetForm(); }}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>{submitLabel}</Button>
      </DialogFooter>
    </form>
  );

  // -------------------
  //     🖥️ Render
  // -------------------
  return (
    <div className="mx-auto p-8 min-h-screen max-w-7xl">
      <Fade triggerOnce duration={500}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Coupons</h1>
            <p className="text-muted-foreground">Manage discount coupons and promotions</p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Coupon</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Coupon</DialogTitle>
                <DialogDescription>Set up a new discount coupon</DialogDescription>
              </DialogHeader>
              {renderForm(handleCreateSubmit, "Create Coupon")}
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label className="text-sm mb-2 block">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{filtered.length}</span> of <span className="font-medium">{coupons.length}</span> coupons
              </div>

              <div className="flex justify-end">
                {(typeFilter !== "all" || statusFilter !== "all") && (
                  <Button variant="outline" size="sm" onClick={() => { setTypeFilter("all"); setStatusFilter("all"); }}>
                    <X className="h-3 w-3 mr-1" />Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">No coupons found</h3>
                <p className="text-sm text-muted-foreground">
                  {typeFilter !== "all" || statusFilter !== "all" ? "Try adjusting your filters." : "Create your first coupon."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Fade cascade damping={0.05} triggerOnce duration={500}>
              {filtered.map((coupon) => {
                const cfg = typeConfig[coupon.discountType] || typeConfig.percentage;
                const Icon = cfg.icon;
                const expired = isExpired(coupon);
                const inactive = !coupon.isActive || expired;

                return (
                  <Card key={coupon.id} className={`${inactive ? "opacity-60 bg-muted/50" : ""} hover:shadow-lg transition-shadow`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Icon className={`h-5 w-5 ${cfg.color}`} />
                            {coupon.code}
                          </CardTitle>
                          {coupon.description && (
                            <CardDescription className="mt-0.5">{coupon.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          <Badge variant={!inactive ? "default" : "secondary"}>
                            {expired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{cfg.label}</Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Discount display */}
                      <div className="text-center py-2 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{formatDiscount(coupon)}</p>
                        {coupon.maxDiscountAmount && (
                          <p className="text-xs text-muted-foreground">Cap: ${parseFloat(coupon.maxDiscountAmount).toFixed(2)}</p>
                        )}
                      </div>

                      <Separator />

                      {/* Info rows */}
                      <div className="space-y-1.5 text-sm">
                        {coupon.minOrderAmount && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Min Order</span>
                            <span className="font-medium">${parseFloat(coupon.minOrderAmount).toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Usage</span>
                          <span className="font-medium">{coupon.usedCount || 0}/{coupon.usageLimit || "∞"}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Per User</span>
                          <span className="font-medium">{coupon.usagePerUser || 1}x</span>
                        </div>

                        {coupon.expiresAt && (
                          <div className="flex justify-between">
                            <span className={`flex items-center gap-1 ${expired ? "text-destructive" : "text-muted-foreground"}`}>
                              <Calendar className="h-3.5 w-3.5" /> Expires
                            </span>
                            <span className={`font-medium ${expired ? "text-destructive" : ""}`}>
                              {new Date(coupon.expiresAt).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                        )}

                        {coupon.campaignName && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Campaign</span>
                            <span className="font-medium">{coupon.campaignName}</span>
                          </div>
                        )}
                      </div>

                      {/* Feature badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {coupon.newUsersOnly && <Badge variant="outline" className="text-xs">New Users Only</Badge>}
                        {coupon.combinable && <Badge variant="outline" className="text-xs">Combinable</Badge>}
                        {coupon.appliesToProducts?.length > 0 && (
                          <Badge variant="outline" className="text-xs" title={getProductNames(coupon.appliesToProducts)}>
                            <Package className="h-3 w-3 mr-1" />
                            {coupon.appliesToProducts.length} Product{coupon.appliesToProducts.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {coupon.appliesToCategories?.length > 0 && (
                          <Badge variant="outline" className="text-xs" title={getCategoryNames(coupon.appliesToCategories)}>
                            <Layers className="h-3 w-3 mr-1" />
                            {coupon.appliesToCategories.length} Categor{coupon.appliesToCategories.length > 1 ? 'ies' : 'y'}
                          </Badge>
                        )}
                        {coupon.excludedProducts?.length > 0 && (
                          <Badge variant="outline" className="text-xs text-destructive" title={getProductNames(coupon.excludedProducts)}>
                            Excl. {coupon.excludedProducts.length} Product{coupon.excludedProducts.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {coupon.specificUsers?.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {coupon.specificUsers.length} User{coupon.specificUsers.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(coupon)}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openStats(coupon)}>
                        <BarChart3 className="h-4 w-4 mr-1" />Stats
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleToggleStatus(coupon.id)}>
                        <Power className={`h-4 w-4 ${coupon.isActive ? "text-green-600" : "text-gray-400"}`} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => confirmDelete(coupon)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </Fade>
          )}
        </div>

        {/* ── Edit Dialog ── */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Coupon</DialogTitle>
              <DialogDescription>Update "{editingCoupon?.code}"</DialogDescription>
            </DialogHeader>
            {renderForm(handleEditSubmit, "Update Coupon")}
          </DialogContent>
        </Dialog>

        {/* ── Stats Dialog ── */}
        <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Stats — {statsData?.coupon?.code}</DialogTitle>
              <DialogDescription>Usage and performance</DialogDescription>
            </DialogHeader>

            {statsData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-3xl font-bold">{statsData.stats.totalUses}</p>
                      <p className="text-xs text-muted-foreground">Total Uses</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-3xl font-bold text-green-600">
                        ${parseFloat(statsData.stats.totalDiscountGiven).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Discount</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Remaining Uses</span>
                    <span className="font-medium">{statsData.stats.remainingUses}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={statsData.stats.isActive ? "default" : "secondary"}>
                      {statsData.stats.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-medium">
                      {statsData.stats.expiresAt
                        ? new Date(statsData.stats.expiresAt).toLocaleDateString("es-ES")
                        : "Never"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fade>
    </div>
  );
}

export default Coupons;