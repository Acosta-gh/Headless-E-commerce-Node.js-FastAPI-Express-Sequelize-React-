import React, { useState } from "react";
import { Fade } from "react-awesome-reveal";
import { useStats } from "@/hooks/useStats";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loading from "@/components/Loading";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Users,
  Calendar,
  Download,
  FileText,
  CreditCard,
  Truck,
  Tag,
  Award,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

function Stats() {
  // -------------------
  //      🪝 Hooks
  // -------------------
  const {
    stats,
    loading,
    error,
    period,
    changePeriod,
    exportToCSV,
    exportToPDF,
    refresh
  } = useStats();

  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // -------------------
  //  🔄 Early Returns
  // -------------------
  if (loading) return <Loading />;

  // -------------------
  //   🎨 Helper Functions
  // -------------------

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0);
  };

  /**
   * Format number with commas
   */
  const formatNumber = (num) => {
    return new Intl.NumberFormat("es-AR").format(num || 0);
  };

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    const colors = {
      created: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
      confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      unpaid: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
      processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      shipped: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
      delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
      cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
      failed: "bg-red-500/10 text-red-700 dark:text-red-400",
      refunded: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    };
    return colors[status] || "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status) => {
    const icons = {
      created: Clock,
      confirmed: CheckCircle,
      pending: Clock,
      paid: CheckCircle,
      unpaid: XCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
      failed: XCircle,
      refunded: ArrowDownRight,
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  /**
   * Handle CSV export
   */
  const handleExportCSV = async () => {
    setExportingCSV(true);
    await exportToCSV();
    setExportingCSV(false);
  };

  /**
   * Handle PDF export
   */
  const handleExportPDF = async () => {
    setExportingPDF(true);
    await exportToPDF();
    setExportingPDF(false);
  };

  // -------------------
  //     📊 Data
  // -------------------
  const overviewMetrics = [
    {
      label: "Total Orders",
      value: formatNumber(stats?.overview?.totalOrders),
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats?.overview?.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Average Order Value",
      value: formatCurrency(stats?.overview?.averageOrderValue),
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Total Customers",
      value: formatNumber(stats?.overview?.totalCustomers),
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
    },
  ];

  const todayMetrics = [
    {
      label: "Orders Today",
      value: formatNumber(stats?.overview?.ordersToday),
      icon: ShoppingCart,
    },
    {
      label: "Revenue Today",
      value: formatCurrency(stats?.overview?.revenueToday),
      icon: DollarSign,
    },
  ];

  // -------------------
  //     🖥️ Render
  // -------------------
  return (
    <div className="mx-auto p-8 min-h-screen max-w-7xl">
      <Fade triggerOnce duration={500}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Order Statistics
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Real-time insights into your store performance
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Period Selector */}
            <Select value={period} onValueChange={changePeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Buttons */}
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={exportingCSV}
              className="gap-2"
            >
              {exportingCSV ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export CSV
            </Button>

            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={exportingPDF}
              className="gap-2"
            >
              {exportingPDF ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Export PDF
            </Button>

            <Button variant="outline" onClick={refresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
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

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Fade cascade damping={0.1} triggerOnce duration={500}>
            {overviewMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card
                  key={index}
                  className="overflow-hidden border-l-4 border-l-transparent hover:border-l-primary transition-all hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {metric.label}
                        </p>
                        <p className="text-2xl font-bold tracking-tight">
                          {metric.value}
                        </p>
                      </div>
                      <div className={`rounded-lg p-3 ${metric.bgColor}`}>
                        <Icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </Fade>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Order Status & Payment Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Status */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Order Status Breakdown
                  </CardTitle>
                  <CardDescription>
                    Distribution of orders by current status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats?.ordersByStatus &&
                  Object.keys(stats.ordersByStatus).length > 0 ? (
                    Object.entries(stats.ordersByStatus).map(
                      ([status, data]) => (
                        <div key={status} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(status)}>
                                {getStatusIcon(status)}
                                <span className="ml-1 capitalize">
                                  {status}
                                </span>
                              </Badge>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-semibold">
                                {data.count}
                              </span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {formatCurrency(data.total)}
                              </span>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  (data.count / stats.overview.totalOrders) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mb-2 opacity-50" />
                      <p>No order status data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Status */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Payment Status
                  </CardTitle>
                  <CardDescription>Payment completion metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats?.ordersByPaymentStatus &&
                  Object.keys(stats.ordersByPaymentStatus).length > 0 ? (
                    Object.entries(stats.ordersByPaymentStatus).map(
                      ([status, data]) => (
                        <div key={status} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(status)}>
                                {getStatusIcon(status)}
                                <span className="ml-1 capitalize">
                                  {status}
                                </span>
                              </Badge>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-semibold">
                                {data.count}
                              </span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {formatCurrency(data.total)}
                              </span>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                status === "paid"
                                  ? "bg-emerald-500"
                                  : status === "pending"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${
                                  (data.count / stats.overview.totalOrders) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mb-2 opacity-50" />
                      <p>No payment status data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Conversion Funnel */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Order Conversion Funnel
                </CardTitle>
                <CardDescription>
                  Track how orders progress through each stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.conversionFunnel ? (
                  <div className="space-y-4">
                    {Object.entries(stats.conversionFunnel).map(
                      ([stage, count], index, array) => {
                        const percentage =
                          (count / stats.overview.totalOrders) * 100;
                        const prevCount = index > 0 ? array[index - 1][1] : count;
                        const dropoff =
                          index > 0
                            ? ((prevCount - count) / prevCount) * 100
                            : 0;

                        return (
                          <div key={stage} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(stage)}
                                >
                                  <span className="capitalize">{stage}</span>
                                </Badge>
                                {dropoff > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    -{dropoff.toFixed(1)}% drop
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-semibold">
                                  {count}
                                </span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
                    <p>No funnel data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Revenue Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Daily Revenue (Last 30 Days)
                </CardTitle>
                <CardDescription>
                  Track revenue trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.dailyRevenue && stats.dailyRevenue.length > 0 ? (
                  <div className="space-y-2">
                    {stats.dailyRevenue.slice(-10).map((day) => (
                      <div key={day.date} className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground w-24">
                          {new Date(day.date).toLocaleDateString("es-AR")}
                        </span>
                        <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500 flex items-center justify-end px-3"
                            style={{
                              width: `${
                                (day.revenue /
                                  Math.max(
                                    ...stats.dailyRevenue.map((d) => d.revenue)
                                  )) *
                                100
                              }%`,
                            }}
                          >
                            <span className="text-xs text-white font-medium">
                              {formatCurrency(day.revenue)}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-medium w-16 text-right">
                          {day.orderCount} orders
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mb-2 opacity-50" />
                    <p>No daily revenue data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Top Selling Products
                </CardTitle>
                <CardDescription>
                  Best performing products by quantity sold
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.topProducts && stats.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topProducts.map((product, index) => (
                      <div
                        key={product.productId}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{product.title}</h4>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span>Qty: {formatNumber(product.quantity)}</span>
                            <span>•</span>
                            <span>
                              Revenue: {formatCurrency(product.revenue)}
                            </span>
                            <span>•</span>
                            <span>{product.orderCount} orders</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-600">
                            {formatCurrency(product.revenue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Package className="h-16 w-16 mb-4 opacity-50" />
                    <p>No product data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Top Customers
                </CardTitle>
                <CardDescription>
                  Customers with highest total spending
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.topCustomers && stats.topCustomers.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topCustomers.map((customer, index) => (
                      <div
                        key={customer.userId}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {customer.username}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {customer.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-600">
                            {formatCurrency(customer.totalSpent)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {customer.orderCount} orders
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="h-16 w-16 mb-4 opacity-50" />
                    <p>No customer data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>
                    Distribution by payment method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats?.paymentMethods && stats.paymentMethods.length > 0 ? (
                    stats.paymentMethods.map((method) => (
                      <div key={method.code} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{method.name}</span>
                          <div className="text-right">
                            <span className="text-lg font-semibold">
                              {method.count}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {formatCurrency(method.total)}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                (method.count / stats.overview.totalOrders) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mb-2 opacity-50" />
                      <p>No payment method data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Methods */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Shipping Methods
                  </CardTitle>
                  <CardDescription>
                    Distribution by shipping method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats?.shippingMethods &&
                  stats.shippingMethods.length > 0 ? (
                    stats.shippingMethods.map((method) => (
                      <div key={method.code} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{method.name}</span>
                          <div className="text-right">
                            <span className="text-lg font-semibold">
                              {method.count}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              Cost: {formatCurrency(method.totalCost)}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                (method.count / stats.overview.totalOrders) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Truck className="h-12 w-12 mb-2 opacity-50" />
                      <p>No shipping method data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Coupon Usage Statistics
                </CardTitle>
                <CardDescription>
                  Most used coupons and total discounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.couponUsage && stats.couponUsage.length > 0 ? (
                  <div className="space-y-4">
                    {stats.couponUsage.map((coupon) => (
                      <div
                        key={coupon.code}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <h4 className="font-semibold text-lg">
                            {coupon.code}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Used {coupon.usageCount} times
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">
                            -{formatCurrency(coupon.totalDiscount)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Total discount
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Tag className="h-16 w-16 mb-4 opacity-50" />
                    <p>No coupon usage data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Today's Activity */}
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Activity
            </CardTitle>
            <CardDescription>Current day performance snapshot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {todayMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={index}
                    className="text-center p-6 border rounded-lg bg-gradient-to-br from-primary/5 to-transparent"
                  >
                    <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {metric.label}
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {metric.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {stats && stats.overview?.totalOrders === 0 && (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Your store hasn't received any orders yet. Statistics will
                appear here once customers start placing orders.
              </p>
            </CardContent>
          </Card>
        )}
      </Fade>
    </div>
  );
}

export default Stats;