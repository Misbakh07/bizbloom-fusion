import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Plus, Search, MoreHorizontal, Edit2, Trash2, Copy, DollarSign,
  Calendar, Tag, Percent, Users, ShoppingCart, TrendingUp, Filter,
  ChevronDown, X, Check, AlertCircle, FileText, ArrowUpDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ──────────────────────────────────────────────────────────
interface PriceListItem {
  id: string;
  productCode: string;
  productName: string;
  basePrice: number;
  listPrice: number;
  minQty: number;
  maxQty: number;
  discountPercent: number;
  discountAmount: number;
}

interface PriceList {
  id: string;
  name: string;
  code: string;
  description: string;
  type: "selling" | "buying" | "promotional" | "contract";
  currency: string;
  effectiveFrom: string;
  effectiveTo: string;
  priority: number;
  isActive: boolean;
  customerGroup: string;
  roundingMethod: "none" | "nearest" | "up" | "down";
  roundingPrecision: number;
  basePriceList: string;
  adjustmentType: "percentage" | "fixed";
  adjustmentValue: number;
  items: PriceListItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Seed Data ──────────────────────────────────────────────────────
const defaultPriceLists: PriceList[] = [
  {
    id: "pl-1", name: "Standard Selling Price", code: "STD-SELL", description: "Default selling price for all customers",
    type: "selling", currency: "USD", effectiveFrom: "2025-01-01", effectiveTo: "2025-12-31",
    priority: 1, isActive: true, customerGroup: "All Customers", roundingMethod: "nearest", roundingPrecision: 2,
    basePriceList: "", adjustmentType: "percentage", adjustmentValue: 0,
    items: [
      { id: "i1", productCode: "PRD-001", productName: "Widget A", basePrice: 100, listPrice: 120, minQty: 1, maxQty: 999, discountPercent: 0, discountAmount: 0 },
      { id: "i2", productCode: "PRD-002", productName: "Widget B", basePrice: 200, listPrice: 250, minQty: 1, maxQty: 999, discountPercent: 0, discountAmount: 0 },
      { id: "i3", productCode: "PRD-003", productName: "Gadget X", basePrice: 500, listPrice: 599, minQty: 1, maxQty: 999, discountPercent: 0, discountAmount: 0 },
    ],
    createdAt: "2025-01-01", updatedAt: "2025-03-10",
  },
  {
    id: "pl-2", name: "Wholesale Price", code: "WHOLESALE", description: "Discounted price for wholesale buyers",
    type: "selling", currency: "USD", effectiveFrom: "2025-01-01", effectiveTo: "2025-12-31",
    priority: 2, isActive: true, customerGroup: "Wholesale", roundingMethod: "down", roundingPrecision: 2,
    basePriceList: "pl-1", adjustmentType: "percentage", adjustmentValue: -15,
    items: [
      { id: "i4", productCode: "PRD-001", productName: "Widget A", basePrice: 100, listPrice: 102, minQty: 50, maxQty: 9999, discountPercent: 15, discountAmount: 18 },
      { id: "i5", productCode: "PRD-002", productName: "Widget B", basePrice: 200, listPrice: 212.50, minQty: 25, maxQty: 9999, discountPercent: 15, discountAmount: 37.50 },
    ],
    createdAt: "2025-01-05", updatedAt: "2025-03-08",
  },
  {
    id: "pl-3", name: "Summer Promo 2025", code: "SUMMER-25", description: "Summer promotional pricing campaign",
    type: "promotional", currency: "USD", effectiveFrom: "2025-06-01", effectiveTo: "2025-08-31",
    priority: 10, isActive: true, customerGroup: "All Customers", roundingMethod: "nearest", roundingPrecision: 2,
    basePriceList: "pl-1", adjustmentType: "percentage", adjustmentValue: -20,
    items: [
      { id: "i6", productCode: "PRD-003", productName: "Gadget X", basePrice: 500, listPrice: 479, minQty: 1, maxQty: 999, discountPercent: 20, discountAmount: 120 },
    ],
    createdAt: "2025-03-01", updatedAt: "2025-03-01",
  },
  {
    id: "pl-4", name: "Vendor Purchase Price", code: "VEND-BUY", description: "Standard purchase pricing from vendors",
    type: "buying", currency: "USD", effectiveFrom: "2025-01-01", effectiveTo: "2025-12-31",
    priority: 1, isActive: true, customerGroup: "N/A", roundingMethod: "none", roundingPrecision: 2,
    basePriceList: "", adjustmentType: "percentage", adjustmentValue: 0,
    items: [
      { id: "i7", productCode: "PRD-001", productName: "Widget A", basePrice: 60, listPrice: 60, minQty: 100, maxQty: 99999, discountPercent: 0, discountAmount: 0 },
      { id: "i8", productCode: "PRD-002", productName: "Widget B", basePrice: 130, listPrice: 130, minQty: 50, maxQty: 99999, discountPercent: 0, discountAmount: 0 },
    ],
    createdAt: "2025-01-02", updatedAt: "2025-02-20",
  },
  {
    id: "pl-5", name: "VIP Contract - Corp ABC", code: "VIP-ABC", description: "Special contract pricing for Corp ABC",
    type: "contract", currency: "USD", effectiveFrom: "2025-02-01", effectiveTo: "2026-01-31",
    priority: 100, isActive: false, customerGroup: "VIP", roundingMethod: "up", roundingPrecision: 2,
    basePriceList: "pl-1", adjustmentType: "percentage", adjustmentValue: -25,
    items: [],
    createdAt: "2025-02-01", updatedAt: "2025-02-01",
  },
];

const typeConfig = {
  selling: { label: "Selling", color: "bg-primary/20 text-primary border-primary/30" },
  buying: { label: "Buying", color: "bg-accent/20 text-accent border-accent/30" },
  promotional: { label: "Promotional", color: "bg-warning/20 text-warning border-warning/30" },
  contract: { label: "Contract", color: "bg-chart-4/20 text-[hsl(var(--chart-4))] border-chart-4/30" },
};

const emptyList: PriceList = {
  id: "", name: "", code: "", description: "", type: "selling", currency: "USD",
  effectiveFrom: "", effectiveTo: "", priority: 1, isActive: true, customerGroup: "",
  roundingMethod: "nearest", roundingPrecision: 2, basePriceList: "", adjustmentType: "percentage",
  adjustmentValue: 0, items: [], createdAt: "", updatedAt: "",
};

const emptyItem: PriceListItem = {
  id: "", productCode: "", productName: "", basePrice: 0, listPrice: 0,
  minQty: 1, maxQty: 999, discountPercent: 0, discountAmount: 0,
};

const PriceListSetup = () => {
  const { toast } = useToast();
  const [priceLists, setPriceLists] = useState<PriceList[]>(defaultPriceLists);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<PriceList>(emptyList);
  const [editingItem, setEditingItem] = useState<PriceListItem>(emptyItem);
  const [selectedList, setSelectedList] = useState<PriceList | null>(null);
  const [formTab, setFormTab] = useState("general");

  const filtered = priceLists.filter((pl) => {
    const matchSearch = pl.name.toLowerCase().includes(search.toLowerCase()) ||
      pl.code.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || pl.type === filterType;
    const matchStatus = filterStatus === "all" ||
      (filterStatus === "active" && pl.isActive) ||
      (filterStatus === "inactive" && !pl.isActive);
    return matchSearch && matchType && matchStatus;
  });

  const totalLists = priceLists.length;
  const activeLists = priceLists.filter((p) => p.isActive).length;
  const totalItems = priceLists.reduce((sum, p) => sum + p.items.length, 0);
  const promoCount = priceLists.filter((p) => p.type === "promotional" && p.isActive).length;

  const openCreate = () => {
    setEditingList({ ...emptyList, id: `pl-${Date.now()}`, createdAt: new Date().toISOString().split("T")[0], updatedAt: new Date().toISOString().split("T")[0] });
    setFormTab("general");
    setDialogOpen(true);
  };

  const openEdit = (pl: PriceList) => {
    setEditingList({ ...pl });
    setFormTab("general");
    setDialogOpen(true);
  };

  const openDetail = (pl: PriceList) => setSelectedList(pl);

  const saveList = () => {
    if (!editingList.name || !editingList.code) {
      toast({ title: "Validation Error", description: "Name and Code are required.", variant: "destructive" });
      return;
    }
    const exists = priceLists.find((p) => p.id === editingList.id);
    if (exists) {
      setPriceLists(priceLists.map((p) => (p.id === editingList.id ? { ...editingList, updatedAt: new Date().toISOString().split("T")[0] } : p)));
      toast({ title: "Price List Updated", description: `"${editingList.name}" has been updated.` });
    } else {
      setPriceLists([...priceLists, editingList]);
      toast({ title: "Price List Created", description: `"${editingList.name}" has been created.` });
    }
    setDialogOpen(false);
  };

  const deleteList = (id: string) => {
    setPriceLists(priceLists.filter((p) => p.id !== id));
    if (selectedList?.id === id) setSelectedList(null);
    toast({ title: "Price List Deleted", description: "Price list has been removed." });
  };

  const duplicateList = (pl: PriceList) => {
    const dup: PriceList = {
      ...pl, id: `pl-${Date.now()}`, name: `${pl.name} (Copy)`, code: `${pl.code}-COPY`,
      createdAt: new Date().toISOString().split("T")[0], updatedAt: new Date().toISOString().split("T")[0],
    };
    setPriceLists([...priceLists, dup]);
    toast({ title: "Duplicated", description: `"${dup.name}" created.` });
  };

  const openAddItem = () => {
    setEditingItem({ ...emptyItem, id: `item-${Date.now()}` });
    setItemDialogOpen(true);
  };

  const saveItem = () => {
    if (!editingItem.productCode || !editingItem.productName) {
      toast({ title: "Validation Error", description: "Product Code and Name are required.", variant: "destructive" });
      return;
    }
    if (!selectedList) return;
    const existsItem = selectedList.items.find((i) => i.id === editingItem.id);
    let updatedItems: PriceListItem[];
    if (existsItem) {
      updatedItems = selectedList.items.map((i) => (i.id === editingItem.id ? editingItem : i));
    } else {
      updatedItems = [...selectedList.items, editingItem];
    }
    const updated = { ...selectedList, items: updatedItems, updatedAt: new Date().toISOString().split("T")[0] };
    setPriceLists(priceLists.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedList(updated);
    setItemDialogOpen(false);
    toast({ title: "Item Saved" });
  };

  const deleteItem = (itemId: string) => {
    if (!selectedList) return;
    const updated = { ...selectedList, items: selectedList.items.filter((i) => i.id !== itemId) };
    setPriceLists(priceLists.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedList(updated);
    toast({ title: "Item Removed" });
  };

  const getDaysStatus = (from: string, to: string) => {
    const now = new Date();
    const start = new Date(from);
    const end = new Date(to);
    if (now < start) return { label: "Upcoming", cls: "bg-primary/20 text-primary" };
    if (now > end) return { label: "Expired", cls: "bg-destructive/20 text-destructive" };
    const days = Math.ceil((end.getTime() - now.getTime()) / 86400000);
    if (days <= 30) return { label: `${days}d left`, cls: "bg-warning/20 text-warning" };
    return { label: "Active", cls: "bg-accent/20 text-accent" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Price List Setup</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage selling, buying, promotional and contract price lists
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Price List
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Price Lists", value: totalLists, icon: FileText, accent: "kpi-card-primary" },
          { title: "Active Lists", value: activeLists, icon: Check, accent: "kpi-card-success" },
          { title: "Total Line Items", value: totalItems, icon: Tag, accent: "kpi-card-warning" },
          { title: "Active Promos", value: promoCount, icon: Percent, accent: "kpi-card-destructive" },
        ].map((kpi) => (
          <div key={kpi.title} className={`kpi-card ${kpi.accent}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                <kpi.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search price lists..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="selling">Selling</SelectItem>
            <SelectItem value="buying">Buying</SelectItem>
            <SelectItem value="promotional">Promotional</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content – split view when a list is selected */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table */}
        <Card className={`glass-card ${selectedList ? "lg:col-span-5" : "lg:col-span-12"}`}>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Name / Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-center">Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No price lists found</TableCell>
                  </TableRow>
                )}
                {filtered.map((pl) => {
                  const status = getDaysStatus(pl.effectiveFrom, pl.effectiveTo);
                  const tc = typeConfig[pl.type];
                  return (
                    <TableRow
                      key={pl.id}
                      className={`cursor-pointer transition-colors ${selectedList?.id === pl.id ? "bg-primary/5" : "hover:bg-secondary/30"}`}
                      onClick={() => openDetail(pl)}
                    >
                      <TableCell>
                        <div>
                          <span className="font-medium text-foreground">{pl.name}</span>
                          <span className="block text-xs font-mono text-muted-foreground">{pl.code}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={tc.color}>{tc.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.cls}>{status.label}</Badge>
                        <span className="block text-xs text-muted-foreground mt-0.5">{pl.effectiveFrom} → {pl.effectiveTo}</span>
                      </TableCell>
                      <TableCell className="text-center font-medium">{pl.items.length}</TableCell>
                      <TableCell className="text-center">{pl.priority}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(pl)}><Edit2 className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateList(pl)}><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteList(pl.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        {selectedList && (
          <Card className="glass-card lg:col-span-7">
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg text-foreground">{selectedList.name}</CardTitle>
                <p className="text-xs font-mono text-muted-foreground">{selectedList.code}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={openAddItem} className="gap-1"><Plus className="h-3 w-3" />Add Item</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedList(null)}><X className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium text-foreground capitalize">{selectedList.type}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Currency</p>
                  <p className="font-medium text-foreground">{selectedList.currency}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Customer Group</p>
                  <p className="font-medium text-foreground">{selectedList.customerGroup}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Adjustment</p>
                  <p className="font-medium text-foreground">
                    {selectedList.adjustmentValue !== 0
                      ? `${selectedList.adjustmentValue > 0 ? "+" : ""}${selectedList.adjustmentValue}${selectedList.adjustmentType === "percentage" ? "%" : ""}`
                      : "None"}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 bg-secondary/20">
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Base Price</TableHead>
                      <TableHead className="text-right">List Price</TableHead>
                      <TableHead className="text-center">Min Qty</TableHead>
                      <TableHead className="text-center">Max Qty</TableHead>
                      <TableHead className="text-right">Disc %</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedList.items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <Tag className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p>No items yet. Click "Add Item" to begin.</p>
                        </TableCell>
                      </TableRow>
                    )}
                    {selectedList.items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-secondary/20">
                        <TableCell>
                          <span className="font-medium text-foreground">{item.productName}</span>
                          <span className="block text-xs font-mono text-muted-foreground">{item.productCode}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">{item.basePrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono font-medium text-foreground">{item.listPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-center">{item.minQty}</TableCell>
                        <TableCell className="text-center">{item.maxQty}</TableCell>
                        <TableCell className="text-right">
                          {item.discountPercent > 0 ? (
                            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">{item.discountPercent}%</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingItem({ ...item }); setItemDialogOpen(true); }}>
                                <Edit2 className="h-4 w-4 mr-2" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteItem(item.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── Price List Dialog ───────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{priceLists.find((p) => p.id === editingList.id) ? "Edit Price List" : "New Price List"}</DialogTitle>
          </DialogHeader>

          <Tabs value={formTab} onValueChange={setFormTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
              <TabsTrigger value="validity">Validity & Scope</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name <span className="text-destructive">*</span></Label>
                  <Input value={editingList.name} onChange={(e) => setEditingList({ ...editingList, name: e.target.value })} placeholder="e.g. Standard Selling Price" />
                </div>
                <div className="space-y-2">
                  <Label>Code <span className="text-destructive">*</span></Label>
                  <Input value={editingList.code} onChange={(e) => setEditingList({ ...editingList, code: e.target.value.toUpperCase() })} className="font-mono" placeholder="e.g. STD-SELL" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={editingList.description} onChange={(e) => setEditingList({ ...editingList, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={editingList.type} onValueChange={(v: PriceList["type"]) => setEditingList({ ...editingList, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="selling">Selling</SelectItem>
                      <SelectItem value="buying">Buying</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={editingList.currency} onValueChange={(v) => setEditingList({ ...editingList, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
                      <SelectItem value="SAR">SAR</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Switch checked={editingList.isActive} onCheckedChange={(v) => setEditingList({ ...editingList, isActive: v })} />
                <Label>Active</Label>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base Price List</Label>
                  <Select value={editingList.basePriceList || "none"} onValueChange={(v) => setEditingList({ ...editingList, basePriceList: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Independent)</SelectItem>
                      {priceLists.filter((p) => p.id !== editingList.id).map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input type="number" value={editingList.priority} onChange={(e) => setEditingList({ ...editingList, priority: parseInt(e.target.value) || 1 })} />
                  <p className="text-xs text-muted-foreground">Higher = preferred when overlapping</p>
                </div>
              </div>
              {editingList.basePriceList && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div className="space-y-2">
                    <Label>Adjustment Type</Label>
                    <Select value={editingList.adjustmentType} onValueChange={(v: "percentage" | "fixed") => setEditingList({ ...editingList, adjustmentType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Adjustment Value</Label>
                    <Input type="number" value={editingList.adjustmentValue} onChange={(e) => setEditingList({ ...editingList, adjustmentValue: parseFloat(e.target.value) || 0 })} />
                    <p className="text-xs text-muted-foreground">Use negative for discount</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rounding Method</Label>
                  <Select value={editingList.roundingMethod} onValueChange={(v: PriceList["roundingMethod"]) => setEditingList({ ...editingList, roundingMethod: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="nearest">Nearest</SelectItem>
                      <SelectItem value="up">Round Up</SelectItem>
                      <SelectItem value="down">Round Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rounding Precision</Label>
                  <Select value={String(editingList.roundingPrecision)} onValueChange={(v) => setEditingList({ ...editingList, roundingPrecision: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 decimals</SelectItem>
                      <SelectItem value="1">1 decimal</SelectItem>
                      <SelectItem value="2">2 decimals</SelectItem>
                      <SelectItem value="3">3 decimals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="validity" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Effective From</Label>
                  <Input type="date" value={editingList.effectiveFrom} onChange={(e) => setEditingList({ ...editingList, effectiveFrom: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Effective To</Label>
                  <Input type="date" value={editingList.effectiveTo} onChange={(e) => setEditingList({ ...editingList, effectiveTo: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Customer Group</Label>
                <Select value={editingList.customerGroup || "all"} onValueChange={(v) => setEditingList({ ...editingList, customerGroup: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Customers">All Customers</SelectItem>
                    <SelectItem value="Wholesale">Wholesale</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveList}>Save Price List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Item Dialog ────────────────────────────────────────── */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedList?.items.find((i) => i.id === editingItem.id) ? "Edit Item" : "Add Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Code <span className="text-destructive">*</span></Label>
                <Input value={editingItem.productCode} onChange={(e) => setEditingItem({ ...editingItem, productCode: e.target.value.toUpperCase() })} className="font-mono" placeholder="PRD-001" />
              </div>
              <div className="space-y-2">
                <Label>Product Name <span className="text-destructive">*</span></Label>
                <Input value={editingItem.productName} onChange={(e) => setEditingItem({ ...editingItem, productName: e.target.value })} placeholder="Widget A" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Base Price</Label>
                <Input type="number" value={editingItem.basePrice} onChange={(e) => setEditingItem({ ...editingItem, basePrice: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>List Price</Label>
                <Input type="number" value={editingItem.listPrice} onChange={(e) => setEditingItem({ ...editingItem, listPrice: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Qty</Label>
                <Input type="number" value={editingItem.minQty} onChange={(e) => setEditingItem({ ...editingItem, minQty: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="space-y-2">
                <Label>Max Qty</Label>
                <Input type="number" value={editingItem.maxQty} onChange={(e) => setEditingItem({ ...editingItem, maxQty: parseInt(e.target.value) || 999 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input type="number" value={editingItem.discountPercent} onChange={(e) => setEditingItem({ ...editingItem, discountPercent: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Discount Amount</Label>
                <Input type="number" value={editingItem.discountAmount} onChange={(e) => setEditingItem({ ...editingItem, discountAmount: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveItem}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriceListSetup;
