import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Download, DollarSign, TrendingUp, TrendingDown, Package,
  BarChart3, ArrowUpDown, MapPin, Layers, ChevronDown, ChevronRight,
  AlertTriangle, Info,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell,
  AreaChart, Area,
} from "recharts";

type CostingMethod = "FIFO" | "LIFO" | "Simple Avg" | "Weighted Avg" | "Standard" | "Specific ID";

const METHODS: CostingMethod[] = ["FIFO", "LIFO", "Simple Avg", "Weighted Avg", "Standard", "Specific ID"];

interface ProductValuation {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  qtyOnHand: number;
  uom: string;
  valuations: Record<CostingMethod, number>;
  lastPurchasePrice: number;
  lastSalePrice: number;
}

interface LocationSummary {
  location: string;
  totalQty: number;
  totalValue: Record<CostingMethod, number>;
  productCount: number;
}

interface TrendPoint {
  month: string;
  FIFO: number;
  LIFO: number;
  "Simple Avg": number;
  "Weighted Avg": number;
  Standard: number;
  "Specific ID": number;
}

const products: ProductValuation[] = [
  { id: "1", code: "PRD-001", name: "Hydraulic Pump Assembly", category: "Machinery Parts", location: "Warehouse A", qtyOnHand: 120, uom: "PCS", valuations: { FIFO: 156000, LIFO: 162000, "Simple Avg": 158400, "Weighted Avg": 157800, Standard: 154800, "Specific ID": 159600 }, lastPurchasePrice: 1350, lastSalePrice: 1850 },
  { id: "2", code: "PRD-002", name: "Brake Pad Set – Ceramic", category: "Automotive", location: "Warehouse A", qtyOnHand: 450, uom: "SET", valuations: { FIFO: 67500, LIFO: 72000, "Simple Avg": 69300, "Weighted Avg": 68850, Standard: 67500, "Specific ID": 70200 }, lastPurchasePrice: 155, lastSalePrice: 220 },
  { id: "3", code: "PRD-003", name: "Engine Oil Filter", category: "Automotive", location: "Warehouse B", qtyOnHand: 800, uom: "PCS", valuations: { FIFO: 24000, LIFO: 25600, "Simple Avg": 24800, "Weighted Avg": 24400, Standard: 24000, "Specific ID": 25200 }, lastPurchasePrice: 32, lastSalePrice: 48 },
  { id: "4", code: "PRD-004", name: "Spark Plug – Iridium", category: "Automotive", location: "Warehouse B", qtyOnHand: 1200, uom: "PCS", valuations: { FIFO: 18000, LIFO: 19200, "Simple Avg": 18600, "Weighted Avg": 18300, Standard: 18000, "Specific ID": 18900 }, lastPurchasePrice: 16, lastSalePrice: 25 },
  { id: "5", code: "PRD-005", name: "Timing Belt Kit", category: "Machinery Parts", location: "Warehouse A", qtyOnHand: 85, uom: "KIT", valuations: { FIFO: 42500, LIFO: 44200, "Simple Avg": 43350, "Weighted Avg": 42925, Standard: 42500, "Specific ID": 43775 }, lastPurchasePrice: 510, lastSalePrice: 720 },
  { id: "6", code: "PRD-006", name: "Industrial Bearing Set", category: "Machinery Parts", location: "Warehouse C", qtyOnHand: 300, uom: "SET", valuations: { FIFO: 90000, LIFO: 93000, "Simple Avg": 91500, "Weighted Avg": 90750, Standard: 90000, "Specific ID": 92250 }, lastPurchasePrice: 305, lastSalePrice: 430 },
  { id: "7", code: "PRD-007", name: "Hydraulic Hose Assembly", category: "Machinery Parts", location: "Warehouse C", qtyOnHand: 200, uom: "PCS", valuations: { FIFO: 30000, LIFO: 32000, "Simple Avg": 31000, "Weighted Avg": 30500, Standard: 30000, "Specific ID": 31500 }, lastPurchasePrice: 155, lastSalePrice: 215 },
  { id: "8", code: "PRD-008", name: "Air Compressor Unit", category: "Equipment", location: "Warehouse A", qtyOnHand: 25, uom: "PCS", valuations: { FIFO: 125000, LIFO: 130000, "Simple Avg": 127500, "Weighted Avg": 126250, Standard: 125000, "Specific ID": 128750 }, lastPurchasePrice: 5100, lastSalePrice: 7200 },
  { id: "9", code: "PRD-009", name: "Welding Electrode Pack", category: "Consumables", location: "Warehouse B", qtyOnHand: 2000, uom: "PKT", valuations: { FIFO: 40000, LIFO: 42000, "Simple Avg": 41000, "Weighted Avg": 40500, Standard: 40000, "Specific ID": 41500 }, lastPurchasePrice: 21, lastSalePrice: 32 },
  { id: "10", code: "PRD-010", name: "Safety Helmet – Industrial", category: "Safety", location: "Warehouse C", qtyOnHand: 500, uom: "PCS", valuations: { FIFO: 25000, LIFO: 26500, "Simple Avg": 25750, "Weighted Avg": 25375, Standard: 25000, "Specific ID": 26125 }, lastPurchasePrice: 52, lastSalePrice: 78 },
];

const trendData: TrendPoint[] = [
  { month: "Oct", FIFO: 580000, LIFO: 605000, "Simple Avg": 592000, "Weighted Avg": 587000, Standard: 578000, "Specific ID": 598000 },
  { month: "Nov", FIFO: 595000, LIFO: 618000, "Simple Avg": 606000, "Weighted Avg": 601000, Standard: 593000, "Specific ID": 612000 },
  { month: "Dec", FIFO: 610000, LIFO: 635000, "Simple Avg": 622000, "Weighted Avg": 616000, Standard: 608000, "Specific ID": 628000 },
  { month: "Jan", FIFO: 598000, LIFO: 625000, "Simple Avg": 611000, "Weighted Avg": 605000, Standard: 596000, "Specific ID": 618000 },
  { month: "Feb", FIFO: 612000, LIFO: 640000, "Simple Avg": 625000, "Weighted Avg": 619000, Standard: 610000, "Specific ID": 632000 },
  { month: "Mar", FIFO: 618000, LIFO: 646500, "Simple Avg": 631200, "Weighted Avg": 625650, Standard: 616800, "Specific ID": 637800 },
];

const CHART_COLORS = [
  "hsl(213, 94%, 58%)", "hsl(160, 84%, 39%)", "hsl(38, 92%, 50%)",
  "hsl(280, 67%, 60%)", "hsl(350, 80%, 60%)", "hsl(190, 80%, 50%)",
];

const fmt = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtK = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`;

const InventoryValuation: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<CostingMethod>("Weighted Avg");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortField, setSortField] = useState<"name" | "value" | "qty">("value");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const locations = useMemo(() => [...new Set(products.map((p) => p.location))], []);
  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], []);

  const filtered = useMemo(() => {
    let items = products.filter((p) => {
      const s = searchTerm.toLowerCase();
      const matchSearch = !s || p.code.toLowerCase().includes(s) || p.name.toLowerCase().includes(s);
      const matchLoc = filterLocation === "all" || p.location === filterLocation;
      const matchCat = filterCategory === "all" || p.category === filterCategory;
      return matchSearch && matchLoc && matchCat;
    });
    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "value") cmp = a.valuations[selectedMethod] - b.valuations[selectedMethod];
      else cmp = a.qtyOnHand - b.qtyOnHand;
      return sortDir === "desc" ? -cmp : cmp;
    });
    return items;
  }, [searchTerm, filterLocation, filterCategory, sortField, sortDir, selectedMethod]);

  const totals = useMemo(() => {
    const t: Record<CostingMethod, number> = { FIFO: 0, LIFO: 0, "Simple Avg": 0, "Weighted Avg": 0, Standard: 0, "Specific ID": 0 };
    products.forEach((p) => METHODS.forEach((m) => (t[m] += p.valuations[m])));
    return t;
  }, []);

  const totalQty = products.reduce((s, p) => s + p.qtyOnHand, 0);
  const primaryValue = totals[selectedMethod];
  const maxVal = Math.max(...Object.values(totals));
  const minVal = Math.min(...Object.values(totals));
  const variance = maxVal - minVal;
  const variancePct = ((variance / minVal) * 100).toFixed(1);

  const locationData: LocationSummary[] = useMemo(() => {
    const map = new Map<string, LocationSummary>();
    products.forEach((p) => {
      if (!map.has(p.location)) map.set(p.location, { location: p.location, totalQty: 0, totalValue: { FIFO: 0, LIFO: 0, "Simple Avg": 0, "Weighted Avg": 0, Standard: 0, "Specific ID": 0 }, productCount: 0 });
      const loc = map.get(p.location)!;
      loc.totalQty += p.qtyOnHand;
      loc.productCount += 1;
      METHODS.forEach((m) => (loc.totalValue[m] += p.valuations[m]));
    });
    return Array.from(map.values());
  }, []);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => map.set(p.category, (map.get(p.category) || 0) + p.valuations[selectedMethod]));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [selectedMethod]);

  const varianceData = useMemo(() =>
    METHODS.map((m) => ({ method: m, value: totals[m], diff: totals[m] - totals.Standard })),
  [totals]);

  const methodComparisonData = useMemo(() =>
    METHODS.map((m, i) => ({ method: m, value: totals[m], fill: CHART_COLORS[i] })),
  [totals]);

  const toggleRow = (id: string) => setExpandedRows((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventory Valuation</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time stock valuation across all costing methods and locations</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={selectedMethod} onValueChange={(v) => setSelectedMethod(v as CostingMethod)}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>{METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" />Export</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: `Total Value (${selectedMethod})`, value: fmt(primaryValue), icon: DollarSign, sub: `${products.length} products` },
          { label: "Total Qty on Hand", value: totalQty.toLocaleString(), icon: Package, sub: `${locations.length} locations` },
          { label: "Max Method Variance", value: fmt(variance), icon: AlertTriangle, sub: `${variancePct}% spread across methods` },
          { label: "Highest Method", value: METHODS.reduce((a, b) => totals[a] > totals[b] ? a : b), icon: TrendingUp, sub: fmt(maxVal) },
        ].map((kpi) => (
          <Card key={kpi.label} className="border border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground">{kpi.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Product Drill-down</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Method Comparison */}
            <Card className="border border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground">Valuation by Method</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={methodComparisonData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                    <XAxis type="number" tickFormatter={fmtK} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                    <YAxis type="category" dataKey="method" width={90} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                    <RechartsTooltip formatter={(v: number) => fmt(v)} contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(217, 33%, 22%)", borderRadius: 8, color: "hsl(210, 40%, 98%)" }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {methodComparisonData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="border border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground">Value by Category ({selectedMethod})</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55} strokeWidth={0} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(v: number) => fmt(v)} contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(217, 33%, 22%)", borderRadius: 8, color: "hsl(210, 40%, 98%)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Location Breakdown */}
            <Card className="border border-border/50 lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground">Valuation by Location</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {locationData.map((loc) => (
                    <Card key={loc.location} className="border border-border/40 bg-secondary/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm text-foreground">{loc.location}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <span className="text-muted-foreground">Products</span><span className="text-right font-medium text-foreground">{loc.productCount}</span>
                          <span className="text-muted-foreground">Total Qty</span><span className="text-right font-medium text-foreground">{loc.totalQty.toLocaleString()}</span>
                          <span className="text-muted-foreground">{selectedMethod}</span><span className="text-right font-semibold text-primary">{fmt(loc.totalValue[selectedMethod])}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(loc.totalValue[selectedMethod] / primaryValue) * 100}%` }} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Product Drill-down */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by code or name…" className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card className="border border-border/50">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="font-semibold">Code</TableHead>
                    <TableHead className="font-semibold cursor-pointer select-none" onClick={() => toggleSort("name")}>
                      <span className="flex items-center gap-1">Product <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold cursor-pointer select-none text-right" onClick={() => toggleSort("qty")}>
                      <span className="flex items-center justify-end gap-1">Qty <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead className="font-semibold cursor-pointer select-none text-right" onClick={() => toggleSort("value")}>
                      <span className="flex items-center justify-end gap-1">{selectedMethod} Value <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead className="font-semibold text-right">Unit Cost</TableHead>
                    <TableHead className="font-semibold text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No products found</TableCell></TableRow>
                  ) : filtered.map((p) => {
                    const val = p.valuations[selectedMethod];
                    const unitCost = val / p.qtyOnHand;
                    const margin = ((p.lastSalePrice - unitCost) / p.lastSalePrice * 100).toFixed(1);
                    const expanded = expandedRows.has(p.id);
                    return (
                      <React.Fragment key={p.id}>
                        <TableRow className="group cursor-pointer" onClick={() => toggleRow(p.id)}>
                          <TableCell className="px-2">{expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}</TableCell>
                          <TableCell><code className="text-xs font-mono text-muted-foreground">{p.code}</code></TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-foreground">{p.name}</p>
                              <Badge variant="outline" className="text-[10px] mt-0.5">{p.category}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{p.location}</TableCell>
                          <TableCell className="text-right text-sm font-medium">{p.qtyOnHand.toLocaleString()} {p.uom}</TableCell>
                          <TableCell className="text-right text-sm font-semibold text-primary">{fmt(val)}</TableCell>
                          <TableCell className="text-right text-sm">{fmt(Math.round(unitCost))}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={`border-0 text-xs ${Number(margin) >= 30 ? "bg-accent/20 text-accent" : Number(margin) >= 15 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                              {margin}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                        {expanded && (
                          <TableRow className="bg-secondary/20">
                            <TableCell colSpan={8} className="p-4">
                              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                {METHODS.map((m) => {
                                  const v = p.valuations[m];
                                  const uc = v / p.qtyOnHand;
                                  const isSelected = m === selectedMethod;
                                  return (
                                    <div key={m} className={`p-3 rounded-lg border text-center ${isSelected ? "border-primary/50 bg-primary/5" : "border-border/40"}`}>
                                      <p className="text-[10px] text-muted-foreground font-medium">{m}</p>
                                      <p className={`text-sm font-bold mt-1 ${isSelected ? "text-primary" : "text-foreground"}`}>{fmt(v)}</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">{fmt(Math.round(uc))}/unit</p>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex gap-6 mt-3 text-xs text-muted-foreground">
                                <span>Last Purchase: <span className="text-foreground font-medium">{fmt(p.lastPurchasePrice)}</span></span>
                                <span>Last Sale: <span className="text-foreground font-medium">{fmt(p.lastSalePrice)}</span></span>
                                <span>Method Spread: <span className="text-foreground font-medium">{fmt(Math.max(...Object.values(p.valuations)) - Math.min(...Object.values(p.valuations)))}</span></span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Historical Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card className="border border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground">6-Month Valuation Trend – All Methods</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={trendData} margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                  <YAxis tickFormatter={fmtK} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                  <RechartsTooltip formatter={(v: number) => fmt(v)} contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(217, 33%, 22%)", borderRadius: 8, color: "hsl(210, 40%, 98%)" }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215, 20%, 55%)" }} />
                  {METHODS.map((m, i) => (
                    <Area key={m} type="monotone" dataKey={m} stroke={CHART_COLORS[i]} fill={CHART_COLORS[i]} fillOpacity={0.08} strokeWidth={m === selectedMethod ? 3 : 1.5} dot={m === selectedMethod} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            {METHODS.map((m, i) => {
              const first = trendData[0][m];
              const last = trendData[trendData.length - 1][m];
              const change = ((last - first) / first * 100).toFixed(1);
              const isUp = last >= first;
              return (
                <Card key={m} className={`border ${m === selectedMethod ? "border-primary/50 bg-primary/5" : "border-border/50"}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">{m}</p>
                        <p className="text-lg font-bold text-foreground mt-1">{fmt(last)}</p>
                      </div>
                      <Badge className={`border-0 text-xs ${isUp ? "bg-accent/20 text-accent" : "bg-destructive/10 text-destructive"}`}>
                        {isUp ? "↑" : "↓"} {change}%
                      </Badge>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                      <span>Start: {fmt(first)}</span>
                      <span>Δ {fmt(last - first)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Variance Analysis */}
        <TabsContent value="variance" className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
            <Info className="h-4 w-4 text-primary shrink-0" />
            Variance is calculated against the <span className="font-semibold text-foreground">Standard Cost</span> baseline. Positive values indicate higher valuation.
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="border border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground">Method vs. Standard Cost Variance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={varianceData} margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                    <XAxis dataKey="method" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                    <YAxis tickFormatter={fmtK} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                    <RechartsTooltip formatter={(v: number) => fmt(v)} contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(217, 33%, 22%)", borderRadius: 8, color: "hsl(210, 40%, 98%)" }} />
                    <Bar dataKey="diff" name="Variance from Standard" radius={[4, 4, 0, 0]}>
                      {varianceData.map((d, i) => <Cell key={i} fill={d.diff >= 0 ? "hsl(160, 84%, 39%)" : "hsl(0, 72%, 51%)"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground">Detailed Variance Table</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold">Method</TableHead>
                      <TableHead className="font-semibold text-right">Total Value</TableHead>
                      <TableHead className="font-semibold text-right">Variance ($)</TableHead>
                      <TableHead className="font-semibold text-right">Variance (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {varianceData.map((d) => {
                      const pct = totals.Standard > 0 ? ((d.diff / totals.Standard) * 100).toFixed(2) : "0";
                      return (
                        <TableRow key={d.method} className={d.method === selectedMethod ? "bg-primary/5" : ""}>
                          <TableCell className="font-medium text-sm">
                            {d.method}
                            {d.method === selectedMethod && <Badge className="ml-2 text-[10px] bg-primary/10 text-primary border-0">Active</Badge>}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">{fmt(d.value)}</TableCell>
                          <TableCell className={`text-right text-sm font-semibold ${d.diff > 0 ? "text-accent" : d.diff < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                            {d.diff > 0 ? "+" : ""}{fmt(d.diff)}
                          </TableCell>
                          <TableCell className={`text-right text-sm ${Number(pct) > 0 ? "text-accent" : Number(pct) < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                            {Number(pct) > 0 ? "+" : ""}{pct}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Per-Product Variance */}
          <Card className="border border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground">Product-Level Method Spread (Max – Min Valuation)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={products.map((p) => ({ name: p.code, spread: Math.max(...Object.values(p.valuations)) - Math.min(...Object.values(p.valuations)) }))} margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                  <YAxis tickFormatter={fmtK} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                  <RechartsTooltip formatter={(v: number) => fmt(v)} contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(217, 33%, 22%)", borderRadius: 8, color: "hsl(210, 40%, 98%)" }} />
                  <Bar dataKey="spread" name="Valuation Spread" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryValuation;
