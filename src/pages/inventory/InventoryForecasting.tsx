import { useState } from "react";
import {
  TrendingUp, TrendingDown, Package, DollarSign, AlertTriangle, BarChart3,
  Calendar, ArrowUpRight, ArrowDownRight, Target, Layers, Clock, ShoppingCart,
  Filter, Download, RefreshCw, ChevronDown, ChevronRight, Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, ComposedChart,
  ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie,
} from "recharts";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const historicalSales = [
  { month: "Mar 25", actual: 1250, forecast: null },
  { month: "Apr 25", actual: 1380, forecast: null },
  { month: "May 25", actual: 1520, forecast: null },
  { month: "Jun 25", actual: 1410, forecast: null },
  { month: "Jul 25", actual: 1680, forecast: null },
  { month: "Aug 25", actual: 1590, forecast: null },
  { month: "Sep 25", actual: 1750, forecast: null },
  { month: "Oct 25", actual: 1820, forecast: null },
  { month: "Nov 25", actual: 1960, forecast: null },
  { month: "Dec 25", actual: 2150, forecast: null },
  { month: "Jan 26", actual: 1880, forecast: 1900 },
  { month: "Feb 26", actual: 2050, forecast: 2020 },
  { month: "Mar 26", actual: null, forecast: 2180 },
  { month: "Apr 26", actual: null, forecast: 2320 },
  { month: "May 26", actual: null, forecast: 2410 },
  { month: "Jun 26", actual: null, forecast: 2280 },
  { month: "Jul 26", actual: null, forecast: 2560 },
  { month: "Aug 26", actual: null, forecast: 2480 },
];

const stockRequirements = [
  { product: "Engine Oil 5W-30", sku: "EO-5W30-001", currentStock: 450, avgDailySales: 12, daysOfStock: 38, reorderPoint: 180, forecastDemand: 360, suggestedOrder: 250, holdingCost: 1240, status: "adequate" },
  { product: "Brake Pad Set", sku: "BP-SET-042", currentStock: 85, avgDailySales: 8, daysOfStock: 11, reorderPoint: 120, forecastDemand: 240, suggestedOrder: 275, holdingCost: 890, status: "critical" },
  { product: "Air Filter Premium", sku: "AF-PRM-018", currentStock: 320, avgDailySales: 6, daysOfStock: 53, reorderPoint: 90, forecastDemand: 180, suggestedOrder: 0, holdingCost: 560, status: "overstock" },
  { product: "Transmission Fluid", sku: "TF-ATF-005", currentStock: 180, avgDailySales: 5, daysOfStock: 36, reorderPoint: 75, forecastDemand: 150, suggestedOrder: 45, holdingCost: 720, status: "adequate" },
  { product: "Spark Plug Iridium", sku: "SP-IRD-033", currentStock: 60, avgDailySales: 10, daysOfStock: 6, reorderPoint: 150, forecastDemand: 300, suggestedOrder: 390, holdingCost: 340, status: "critical" },
  { product: "Coolant 50/50 Mix", sku: "CL-5050-012", currentStock: 540, avgDailySales: 4, daysOfStock: 135, reorderPoint: 60, forecastDemand: 120, suggestedOrder: 0, holdingCost: 1680, status: "overstock" },
  { product: "Wiper Blade Set", sku: "WB-SET-027", currentStock: 150, avgDailySales: 7, daysOfStock: 21, reorderPoint: 105, forecastDemand: 210, suggestedOrder: 165, holdingCost: 420, status: "warning" },
  { product: "Battery 12V 60Ah", sku: "BT-12V-060", currentStock: 42, avgDailySales: 3, daysOfStock: 14, reorderPoint: 45, forecastDemand: 90, suggestedOrder: 93, holdingCost: 2100, status: "warning" },
];

const holdingCostBreakdown = [
  { category: "Storage Costs", value: 28500, percentage: 35 },
  { category: "Capital Costs", value: 24300, percentage: 30 },
  { category: "Insurance", value: 8100, percentage: 10 },
  { category: "Obsolescence Risk", value: 12150, percentage: 15 },
  { category: "Handling & Labor", value: 8100, percentage: 10 },
];

const holdingCostTrend = [
  { month: "Sep 25", storage: 26000, capital: 22000, insurance: 7500, total: 55500 },
  { month: "Oct 25", storage: 27000, capital: 23000, insurance: 7800, total: 57800 },
  { month: "Nov 25", storage: 28500, capital: 24000, insurance: 8000, total: 60500 },
  { month: "Dec 25", storage: 30000, capital: 25500, insurance: 8200, total: 63700 },
  { month: "Jan 26", storage: 29000, capital: 24500, insurance: 8100, total: 61600 },
  { month: "Feb 26", storage: 28500, capital: 24300, insurance: 8100, total: 60900 },
  { month: "Mar 26", storage: 27500, capital: 23800, insurance: 7900, total: 59200 },
  { month: "Apr 26", storage: 26800, capital: 23200, insurance: 7700, total: 57700 },
];

const seasonalityData = [
  { month: "Jan", index: 0.85, avgSales: 1650 },
  { month: "Feb", index: 0.92, avgSales: 1790 },
  { month: "Mar", index: 1.05, avgSales: 2040 },
  { month: "Apr", index: 1.12, avgSales: 2180 },
  { month: "May", index: 1.18, avgSales: 2290 },
  { month: "Jun", index: 1.08, avgSales: 2100 },
  { month: "Jul", index: 1.22, avgSales: 2370 },
  { month: "Aug", index: 1.15, avgSales: 2240 },
  { month: "Sep", index: 0.98, avgSales: 1900 },
  { month: "Oct", index: 0.95, avgSales: 1850 },
  { month: "Nov", index: 0.78, avgSales: 1520 },
  { month: "Dec", index: 0.72, avgSales: 1400 },
];

const accuracyData = [
  { month: "Jul 25", mape: 4.2, bias: -1.8 },
  { month: "Aug 25", mape: 5.1, bias: 2.3 },
  { month: "Sep 25", mape: 3.8, bias: -0.5 },
  { month: "Oct 25", mape: 6.2, bias: 3.1 },
  { month: "Nov 25", mape: 4.5, bias: -2.1 },
  { month: "Dec 25", mape: 7.8, bias: 4.5 },
  { month: "Jan 26", mape: 3.2, bias: -1.1 },
  { month: "Feb 26", mape: 2.9, bias: 0.8 },
];

const PIE_COLORS = [
  "hsl(213, 94%, 58%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 67%, 60%)",
  "hsl(350, 80%, 60%)",
];

const tooltipStyle = {
  backgroundColor: "hsl(217, 33%, 17%)",
  border: "1px solid hsl(217, 33%, 22%)",
  borderRadius: "8px",
  color: "hsl(210, 40%, 98%)",
  fontSize: "12px",
};

// ─── Components ──────────────────────────────────────────────────────────────

const KPI = ({ icon: Icon, label, value, change, changeType, accent }: {
  icon: any; label: string; value: string; change: string;
  changeType: "up" | "down"; accent: string;
}) => (
  <div className={`kpi-card kpi-card-${accent}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="p-2 rounded-lg bg-secondary/50">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <span className={`text-xs font-medium flex items-center gap-1 ${changeType === "up" ? "text-success" : "text-destructive"}`}>
        {changeType === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </span>
    </div>
    <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; className: string }> = {
    critical: { label: "Critical", className: "bg-destructive/20 text-destructive border-destructive/30" },
    warning: { label: "Low Stock", className: "bg-warning/20 text-warning border-warning/30" },
    adequate: { label: "Adequate", className: "bg-success/20 text-success border-success/30" },
    overstock: { label: "Overstock", className: "bg-primary/20 text-primary border-primary/30" },
  };
  const c = config[status] || config.adequate;
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
};

// ─── Main Component ──────────────────────────────────────────────────────────

const InventoryForecasting = () => {
  const [forecastMethod, setForecastMethod] = useState("weighted-moving-avg");
  const [forecastPeriod, setForecastPeriod] = useState("6-months");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (sku: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(sku) ? next.delete(sku) : next.add(sku);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Forecasting</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered demand projections &amp; holding cost analysis — linked to Stock Valuation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={forecastMethod} onValueChange={setForecastMethod}>
            <SelectTrigger className="w-[200px] bg-secondary/50 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weighted-moving-avg">Weighted Moving Avg</SelectItem>
              <SelectItem value="exponential-smoothing">Exponential Smoothing</SelectItem>
              <SelectItem value="linear-regression">Linear Regression</SelectItem>
              <SelectItem value="seasonal-decomposition">Seasonal Decomposition</SelectItem>
            </SelectContent>
          </Select>
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3-months">3 Months</SelectItem>
              <SelectItem value="6-months">6 Months</SelectItem>
              <SelectItem value="12-months">12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon"><RefreshCw className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon"><Download className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={TrendingUp} label="Projected Monthly Demand" value="2,410" change="+12.4%" changeType="up" accent="primary" />
        <KPI icon={DollarSign} label="Total Holding Cost / Month" value="$81,150" change="-3.2%" changeType="down" accent="warning" />
        <KPI icon={AlertTriangle} label="Items Below Reorder" value="4" change="+2" changeType="up" accent="destructive" />
        <KPI icon={Target} label="Forecast Accuracy (MAPE)" value="96.8%" change="+1.4%" changeType="up" accent="success" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="demand" className="space-y-4">
        <TabsList className="bg-secondary/50 border border-border">
          <TabsTrigger value="demand" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <TrendingUp className="w-4 h-4 mr-2" />Demand Forecast
          </TabsTrigger>
          <TabsTrigger value="requirements" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Package className="w-4 h-4 mr-2" />Stock Requirements
          </TabsTrigger>
          <TabsTrigger value="holding-costs" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <DollarSign className="w-4 h-4 mr-2" />Holding Costs
          </TabsTrigger>
          <TabsTrigger value="accuracy" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <BarChart3 className="w-4 h-4 mr-2" />Accuracy & Seasonality
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Demand Forecast ─────────────────────────────────────── */}
        <TabsContent value="demand" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main forecast chart */}
            <div className="lg:col-span-2 glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Sales Forecast vs Actual</h3>
                  <p className="text-xs text-muted-foreground">12-month history + 6-month projection</p>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                  {forecastMethod.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={historicalSales}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(213, 94%, 58%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(213, 94%, 58%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="actual" stroke="hsl(213, 94%, 58%)" fill="url(#actualGrad)" strokeWidth={2} name="Actual Sales" connectNulls={false} />
                  <Area type="monotone" dataKey="forecast" stroke="hsl(160, 84%, 39%)" fill="url(#forecastGrad)" strokeWidth={2} strokeDasharray="6 3" name="Forecast" connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Forecast summary */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Projection Summary</h3>
              <div className="space-y-3">
                {[
                  { label: "Next Month Demand", value: "2,180 units", icon: ShoppingCart },
                  { label: "Peak Month", value: "Jul 26 — 2,560", icon: TrendingUp },
                  { label: "Avg Growth Rate", value: "+8.6% / month", icon: ArrowUpRight },
                  { label: "Confidence Level", value: "92.4%", icon: Target },
                  { label: "Safety Stock Buffer", value: "15% applied", icon: Layers },
                  { label: "Lead Time Factor", value: "14 days avg", icon: Clock },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Forecast integrates with <span className="text-primary font-medium">Stock Valuation</span> module 
                    to calculate projected holding costs using your selected costing method.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: Stock Requirements ──────────────────────────────────── */}
        <TabsContent value="requirements" className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Replenishment Recommendations</h3>
                <p className="text-xs text-muted-foreground">Based on forecast demand, lead times, and safety stock levels</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs"><Filter className="w-3 h-3 mr-1" />Filter</Button>
                <Button size="sm" className="text-xs bg-primary text-primary-foreground"><ShoppingCart className="w-3 h-3 mr-1" />Generate PO</Button>
              </div>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs text-right">Current Stock</TableHead>
                    <TableHead className="text-xs text-right">Avg Daily Sales</TableHead>
                    <TableHead className="text-xs text-right">Days of Stock</TableHead>
                    <TableHead className="text-xs text-right">Reorder Point</TableHead>
                    <TableHead className="text-xs text-right">Forecast Demand</TableHead>
                    <TableHead className="text-xs text-right">Suggested Order</TableHead>
                    <TableHead className="text-xs text-right">Holding Cost</TableHead>
                    <TableHead className="text-xs text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockRequirements.map((item) => (
                    <>
                      <TableRow
                        key={item.sku}
                        className="cursor-pointer hover:bg-secondary/20"
                        onClick={() => toggleRow(item.sku)}
                      >
                        <TableCell className="p-2">
                          {expandedRows.has(item.sku)
                            ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.product}</p>
                            <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{item.currentStock}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{item.avgDailySales}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-mono text-sm ${item.daysOfStock < 14 ? "text-destructive" : item.daysOfStock < 30 ? "text-warning" : "text-foreground"}`}>
                            {item.daysOfStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{item.reorderPoint}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{item.forecastDemand}</TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">
                          {item.suggestedOrder > 0 ? item.suggestedOrder : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">${item.holdingCost.toLocaleString()}</TableCell>
                        <TableCell className="text-center"><StatusBadge status={item.status} /></TableCell>
                      </TableRow>
                      {expandedRows.has(item.sku) && (
                        <TableRow key={`${item.sku}-detail`} className="bg-secondary/10">
                          <TableCell colSpan={10} className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                                <p className="text-muted-foreground mb-1">Safety Stock</p>
                                <p className="font-mono font-semibold text-foreground">{Math.round(item.reorderPoint * 0.5)} units</p>
                              </div>
                              <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                                <p className="text-muted-foreground mb-1">Lead Time</p>
                                <p className="font-mono font-semibold text-foreground">{Math.round(7 + Math.random() * 14)} days</p>
                              </div>
                              <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                                <p className="text-muted-foreground mb-1">EOQ (Economic Order Qty)</p>
                                <p className="font-mono font-semibold text-foreground">{Math.round(item.suggestedOrder * 1.1 || item.forecastDemand * 0.6)} units</p>
                              </div>
                              <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                                <p className="text-muted-foreground mb-1">Projected Stockout</p>
                                <p className={`font-mono font-semibold ${item.daysOfStock < 14 ? "text-destructive" : "text-foreground"}`}>
                                  {item.daysOfStock < 14 ? `In ${item.daysOfStock} days` : "None (30d)"}
                                </p>
                              </div>
                              <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                                <p className="text-muted-foreground mb-1">Valuation (FIFO)</p>
                                <p className="font-mono font-semibold text-foreground">${(item.holdingCost * 3.2).toLocaleString()}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                                <p className="text-muted-foreground mb-1">Valuation (Wt. Avg)</p>
                                <p className="font-mono font-semibold text-foreground">${(item.holdingCost * 3.05).toLocaleString()}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                                <p className="text-muted-foreground mb-1">Monthly Holding %</p>
                                <p className="font-mono font-semibold text-foreground">{(2.5 + Math.random() * 1.5).toFixed(1)}%</p>
                              </div>
                              <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                                <p className="text-muted-foreground mb-1">Demand Trend</p>
                                <p className="font-mono font-semibold text-success flex items-center gap-1">
                                  <ArrowUpRight className="w-3 h-3" />+{(3 + Math.random() * 8).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 3: Holding Costs ───────────────────────────────────────── */}
        <TabsContent value="holding-costs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Cost trend chart */}
            <div className="lg:col-span-2 glass-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Holding Cost Trend</h3>
                <p className="text-xs text-muted-foreground">Monthly breakdown by cost category — linked to Stock Valuation costing methods</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={holdingCostTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215, 20%, 55%)" }} />
                  <Bar dataKey="storage" stackId="a" fill="hsl(213, 94%, 58%)" radius={[0, 0, 0, 0]} name="Storage" />
                  <Bar dataKey="capital" stackId="a" fill="hsl(160, 84%, 39%)" name="Capital" />
                  <Bar dataKey="insurance" stackId="a" fill="hsl(38, 92%, 50%)" radius={[3, 3, 0, 0]} name="Insurance" />
                  <Line type="monotone" dataKey="total" stroke="hsl(350, 80%, 60%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(350, 80%, 60%)" }} name="Total" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Cost breakdown pie */}
            <div className="glass-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Cost Breakdown</h3>
                <p className="text-xs text-muted-foreground">Current month distribution</p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={holdingCostBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                      {holdingCostBreakdown.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 w-full">
                  {holdingCostBreakdown.map((item, idx) => (
                    <div key={item.category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                        <span className="text-muted-foreground">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-foreground">${(item.value / 1000).toFixed(1)}k</span>
                        <span className="text-muted-foreground">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-xs text-muted-foreground">
                  <span className="text-warning font-medium">Optimization:</span> Reducing overstock items could lower holding costs by an estimated <span className="font-mono font-semibold text-foreground">$12,400/mo</span>.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 4: Accuracy & Seasonality ──────────────────────────────── */}
        <TabsContent value="accuracy" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Accuracy chart */}
            <div className="glass-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Forecast Accuracy (MAPE)</h3>
                <p className="text-xs text-muted-foreground">Mean Absolute Percentage Error &amp; Bias over time</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="mape" fill="hsl(213, 94%, 58%)" radius={[3, 3, 0, 0]} name="MAPE %" />
                  <Line type="monotone" dataKey="bias" stroke="hsl(38, 92%, 50%)" strokeWidth={2} name="Forecast Bias %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Seasonality */}
            <div className="glass-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Seasonal Demand Index</h3>
                <p className="text-xs text-muted-foreground">Monthly seasonality factor (1.0 = average)</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={seasonalityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0.5, 1.5]} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="index" name="Seasonal Index" radius={[4, 4, 0, 0]}>
                    {seasonalityData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.index >= 1 ? "hsl(160, 84%, 39%)" : "hsl(350, 80%, 60%)"}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Method comparison */}
          <div className="glass-card p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Forecasting Method Comparison</h3>
              <p className="text-xs text-muted-foreground">Accuracy metrics across all available methods</p>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                    <TableHead className="text-xs">Method</TableHead>
                    <TableHead className="text-xs text-right">MAPE</TableHead>
                    <TableHead className="text-xs text-right">MAD</TableHead>
                    <TableHead className="text-xs text-right">Bias</TableHead>
                    <TableHead className="text-xs text-right">Tracking Signal</TableHead>
                    <TableHead className="text-xs text-center">Recommendation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { method: "Weighted Moving Average", mape: "3.2%", mad: "68", bias: "+0.8%", ts: "1.2", rec: "Best Fit" },
                    { method: "Exponential Smoothing", mape: "4.1%", mad: "85", bias: "-1.5%", ts: "1.8", rec: "Good" },
                    { method: "Linear Regression", mape: "5.8%", mad: "112", bias: "+3.2%", ts: "2.9", rec: "Fair" },
                    { method: "Seasonal Decomposition", mape: "3.9%", mad: "78", bias: "+0.4%", ts: "1.4", rec: "Recommended" },
                  ].map((m) => (
                    <TableRow key={m.method}>
                      <TableCell className="text-sm font-medium">{m.method}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{m.mape}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{m.mad}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{m.bias}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{m.ts}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={
                          m.rec === "Best Fit" ? "bg-success/20 text-success border-success/30" :
                          m.rec === "Recommended" ? "bg-primary/20 text-primary border-primary/30" :
                          m.rec === "Good" ? "bg-warning/20 text-warning border-warning/30" :
                          "bg-secondary/50 text-muted-foreground border-border"
                        }>
                          {m.rec}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryForecasting;
