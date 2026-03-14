import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Plus, Edit2, Trash2, Filter, Download, Upload, Package,
  Calendar, AlertTriangle, CheckCircle2, Clock, BarChart3, Layers,
  Tag, MapPin, Eye, Copy, Archive, XCircle
} from "lucide-react";

// ─── Types ───
type BatchStatus = "active" | "quarantine" | "expired" | "recalled" | "consumed" | "reserved";

interface BatchNumber {
  id: string;
  batchNo: string;
  lotNo: string;
  productCode: string;
  productName: string;
  manufacturingDate: string;
  expiryDate: string;
  receivedDate: string;
  status: BatchStatus;
  quantity: number;
  availableQty: number;
  reservedQty: number;
  uom: string;
  location: string;
  bin: string;
  supplierBatch: string;
  supplier: string;
  costPrice: number;
  currency: string;
  certificateNo: string;
  qualityGrade: string;
  inspectionDate: string;
  inspectedBy: string;
  temperature: string;
  humidity: string;
  serialTracking: boolean;
  notes: string;
}

const statusConfig: Record<BatchStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  active: { label: "Active", variant: "default", icon: CheckCircle2 },
  quarantine: { label: "Quarantine", variant: "outline", icon: AlertTriangle },
  expired: { label: "Expired", variant: "destructive", icon: XCircle },
  recalled: { label: "Recalled", variant: "destructive", icon: AlertTriangle },
  consumed: { label: "Consumed", variant: "secondary", icon: Archive },
  reserved: { label: "Reserved", variant: "outline", icon: Clock },
};

const initialBatches: BatchNumber[] = [
  {
    id: "1", batchNo: "BT-2026-001", lotNo: "LOT-A1", productCode: "PRD-001", productName: "Paracetamol 500mg",
    manufacturingDate: "2026-01-15", expiryDate: "2028-01-15", receivedDate: "2026-02-01",
    status: "active", quantity: 10000, availableQty: 7500, reservedQty: 500, uom: "Tablets",
    location: "Central Warehouse", bin: "WH1-A1-R2-S3-B1", supplierBatch: "SUP-BT-88901",
    supplier: "PharmaCorp Ltd", costPrice: 0.05, currency: "AED", certificateNo: "COA-2026-001",
    qualityGrade: "A", inspectionDate: "2026-02-02", inspectedBy: "Dr. Rashid",
    temperature: "15-25°C", humidity: "< 60%", serialTracking: false, notes: "First shipment of 2026"
  },
  {
    id: "2", batchNo: "BT-2026-002", lotNo: "LOT-B3", productCode: "PRD-005", productName: "Engine Oil 5W-30",
    manufacturingDate: "2025-11-20", expiryDate: "2027-11-20", receivedDate: "2026-01-10",
    status: "active", quantity: 5000, availableQty: 3200, reservedQty: 800, uom: "Liters",
    location: "Central Warehouse", bin: "WH1-B2-R1-S1-B3", supplierBatch: "MO-2025-4421",
    supplier: "AutoParts Global", costPrice: 12.50, currency: "AED", certificateNo: "QC-EO-556",
    qualityGrade: "Premium", inspectionDate: "2026-01-12", inspectedBy: "Ali Khan",
    temperature: "0-40°C", humidity: "N/A", serialTracking: false, notes: ""
  },
  {
    id: "3", batchNo: "BT-2025-089", lotNo: "LOT-C7", productCode: "PRD-012", productName: "Vitamin C 1000mg",
    manufacturingDate: "2024-06-01", expiryDate: "2026-06-01", receivedDate: "2024-07-15",
    status: "quarantine", quantity: 20000, availableQty: 0, reservedQty: 0, uom: "Tablets",
    location: "Abu Dhabi Branch", bin: "BR1-A1-R1-S2-B4", supplierBatch: "VC-2024-1123",
    supplier: "NutriHealth Inc", costPrice: 0.08, currency: "AED", certificateNo: "COA-2024-089",
    qualityGrade: "B", inspectionDate: "2026-03-01", inspectedBy: "Pending",
    temperature: "15-25°C", humidity: "< 50%", serialTracking: false, notes: "Quarantined for quality re-inspection near expiry"
  },
  {
    id: "4", batchNo: "BT-2024-045", lotNo: "LOT-D2", productCode: "PRD-003", productName: "Brake Pads Set",
    manufacturingDate: "2024-03-10", expiryDate: "", receivedDate: "2024-04-20",
    status: "active", quantity: 1200, availableQty: 340, reservedQty: 60, uom: "Sets",
    location: "Central Warehouse", bin: "WH1-C3-R4-S1-B2", supplierBatch: "BP-2024-SER-9900",
    supplier: "BrakeMaster LLC", costPrice: 45.00, currency: "AED", certificateNo: "ISO-BP-2024",
    qualityGrade: "OEM", inspectionDate: "2024-04-22", inspectedBy: "Raj Patel",
    temperature: "N/A", humidity: "N/A", serialTracking: true, notes: "Non-perishable, no expiry"
  },
  {
    id: "5", batchNo: "BT-2023-112", lotNo: "LOT-E5", productCode: "PRD-008", productName: "Surgical Gloves (L)",
    manufacturingDate: "2023-08-15", expiryDate: "2025-08-15", receivedDate: "2023-09-01",
    status: "expired", quantity: 50000, availableQty: 12000, reservedQty: 0, uom: "Pairs",
    location: "Central Warehouse", bin: "WH1-D1-R2-S4-B6", supplierBatch: "SG-2023-LX-445",
    supplier: "MediSupply Co", costPrice: 0.35, currency: "AED", certificateNo: "CE-SG-2023",
    qualityGrade: "Medical", inspectionDate: "2023-09-03", inspectedBy: "Dr. Sara",
    temperature: "15-30°C", humidity: "< 70%", serialTracking: false, notes: "Expired — pending disposal approval"
  },
  {
    id: "6", batchNo: "BT-2026-010", lotNo: "LOT-F1", productCode: "PRD-020", productName: "Hydraulic Fluid ISO 46",
    manufacturingDate: "2026-02-01", expiryDate: "2029-02-01", receivedDate: "2026-03-05",
    status: "reserved", quantity: 2000, availableQty: 0, reservedQty: 2000, uom: "Liters",
    location: "Sharjah DC", bin: "DC1-A2-R1-S1-B1", supplierBatch: "HF-2026-ISO46-R1",
    supplier: "IndustrialFluids ME", costPrice: 8.75, currency: "AED", certificateNo: "TDS-HF-2026",
    qualityGrade: "Industrial", inspectionDate: "2026-03-06", inspectedBy: "Ali Khan",
    temperature: "-10-50°C", humidity: "N/A", serialTracking: false, notes: "Reserved for Project Alpha"
  },
];

const emptyBatch: Omit<BatchNumber, "id"> = {
  batchNo: "", lotNo: "", productCode: "", productName: "", manufacturingDate: "", expiryDate: "",
  receivedDate: "", status: "active", quantity: 0, availableQty: 0, reservedQty: 0, uom: "Units",
  location: "", bin: "", supplierBatch: "", supplier: "", costPrice: 0, currency: "AED",
  certificateNo: "", qualityGrade: "", inspectionDate: "", inspectedBy: "", temperature: "",
  humidity: "", serialTracking: false, notes: "",
};

const daysUntilExpiry = (date: string) => {
  if (!date) return Infinity;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
};

const BatchNumbers: React.FC = () => {
  const [batches, setBatches] = useState<BatchNumber[]>(initialBatches);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchNumber | null>(null);
  const [formData, setFormData] = useState<Omit<BatchNumber, "id">>(emptyBatch);
  const [activeTab, setActiveTab] = useState("batch");
  const [detailBatch, setDetailBatch] = useState<BatchNumber | null>(null);

  const filtered = batches.filter(b => {
    const matchSearch = !search || [b.batchNo, b.lotNo, b.productCode, b.productName, b.supplier].some(f => f.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: batches.length,
    active: batches.filter(b => b.status === "active").length,
    expiringSoon: batches.filter(b => { const d = daysUntilExpiry(b.expiryDate); return d > 0 && d <= 90; }).length,
    quarantine: batches.filter(b => b.status === "quarantine").length,
    totalValue: batches.reduce((s, b) => s + b.availableQty * b.costPrice, 0),
  };

  const openAdd = () => { setEditingBatch(null); setFormData({ ...emptyBatch }); setActiveTab("batch"); setDialogOpen(true); };
  const openEdit = (b: BatchNumber) => { setEditingBatch(b); const { id, ...rest } = b; setFormData(rest); setActiveTab("batch"); setDialogOpen(true); };

  const handleSave = () => {
    if (!formData.batchNo || !formData.productName) return;
    if (editingBatch) {
      setBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...formData, id: editingBatch.id } : b));
    } else {
      setBatches(prev => [...prev, { ...formData, id: crypto.randomUUID() }]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => setBatches(prev => prev.filter(b => b.id !== id));

  const expiryBadge = (date: string) => {
    const d = daysUntilExpiry(date);
    if (!date) return <Badge variant="secondary" className="text-[10px]">No Expiry</Badge>;
    if (d <= 0) return <Badge variant="destructive" className="text-[10px]">Expired</Badge>;
    if (d <= 30) return <Badge variant="destructive" className="text-[10px]">{d}d left</Badge>;
    if (d <= 90) return <Badge variant="outline" className="text-[10px] border-[hsl(var(--warning))] text-[hsl(var(--warning))]">{d}d left</Badge>;
    return <Badge variant="secondary" className="text-[10px]">{d}d left</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Batch & Lot Numbers</h1>
          <p className="text-sm text-muted-foreground">Track batch lifecycle, expiry, quality and traceability</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" />Import</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />New Batch</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: "Total Batches", value: stats.total, icon: Layers, accent: "border-l-primary" },
          { title: "Active", value: stats.active, icon: CheckCircle2, accent: "border-l-[hsl(var(--success))]" },
          { title: "Expiring ≤90d", value: stats.expiringSoon, icon: AlertTriangle, accent: "border-l-[hsl(var(--warning))]" },
          { title: "Quarantine", value: stats.quarantine, icon: AlertTriangle, accent: "border-l-destructive" },
          { title: "Stock Value", value: `AED ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: BarChart3, accent: "border-l-[hsl(var(--chart-4))]" },
        ].map(kpi => (
          <Card key={kpi.title} className={`glass-card border-l-4 ${kpi.accent}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary"><kpi.icon className="h-5 w-5 text-muted-foreground" /></div>
              <div><p className="text-xs text-muted-foreground">{kpi.title}</p><p className="text-lg font-bold text-foreground">{kpi.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search batch, lot, product, supplier..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="glass-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead>Batch No</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead>Mfg Date</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(b => (
              <TableRow key={b.id} className="border-border/30 hover:bg-secondary/30 cursor-pointer" onClick={() => setDetailBatch(b)}>
                <TableCell className="font-mono text-xs font-medium text-foreground">{b.batchNo}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{b.lotNo}</TableCell>
                <TableCell>
                  <div><span className="text-foreground text-sm">{b.productName}</span><br /><span className="text-xs text-muted-foreground font-mono">{b.productCode}</span></div>
                </TableCell>
                <TableCell><Badge variant={statusConfig[b.status].variant}>{statusConfig[b.status].label}</Badge></TableCell>
                <TableCell className="text-right font-mono">{b.quantity.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{b.availableQty.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{b.manufacturingDate}</TableCell>
                <TableCell>{b.expiryDate ? <div className="flex items-center gap-1">{expiryBadge(b.expiryDate)}<span className="text-xs text-muted-foreground">{b.expiryDate}</span></div> : <span className="text-xs text-muted-foreground">N/A</span>}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{b.location}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{b.supplier}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b)}><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={11} className="text-center py-12 text-muted-foreground">No batches found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailBatch} onOpenChange={() => setDetailBatch(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {detailBatch && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Batch {detailBatch.batchNo}
                  <Badge variant={statusConfig[detailBatch.status].variant} className="ml-2">{statusConfig[detailBatch.status].label}</Badge>
                </DialogTitle>
                <DialogDescription>{detailBatch.productName} ({detailBatch.productCode})</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Batch No", detailBatch.batchNo], ["Lot No", detailBatch.lotNo],
                  ["Product", detailBatch.productName], ["Product Code", detailBatch.productCode],
                  ["Manufacturing Date", detailBatch.manufacturingDate], ["Expiry Date", detailBatch.expiryDate || "N/A"],
                  ["Received Date", detailBatch.receivedDate], ["Quantity", `${detailBatch.quantity.toLocaleString()} ${detailBatch.uom}`],
                  ["Available", `${detailBatch.availableQty.toLocaleString()} ${detailBatch.uom}`], ["Reserved", `${detailBatch.reservedQty.toLocaleString()} ${detailBatch.uom}`],
                  ["Location", detailBatch.location], ["Bin", detailBatch.bin],
                  ["Supplier", detailBatch.supplier], ["Supplier Batch", detailBatch.supplierBatch],
                  ["Cost Price", `${detailBatch.currency} ${detailBatch.costPrice.toFixed(2)}`],
                  ["Certificate No", detailBatch.certificateNo],
                  ["Quality Grade", detailBatch.qualityGrade], ["Inspection Date", detailBatch.inspectionDate],
                  ["Inspected By", detailBatch.inspectedBy], ["Temperature", detailBatch.temperature],
                  ["Humidity", detailBatch.humidity], ["Serial Tracking", detailBatch.serialTracking ? "Yes" : "No"],
                ].map(([label, value]) => (
                  <div key={label}><p className="text-muted-foreground text-xs">{label}</p><p className="font-medium text-foreground">{value}</p></div>
                ))}
              </div>
              {detailBatch.notes && <div className="mt-4 p-3 rounded-lg bg-secondary text-sm"><p className="text-xs text-muted-foreground mb-1">Notes</p><p className="text-foreground">{detailBatch.notes}</p></div>}
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDetailBatch(null); openEdit(detailBatch); }}>Edit Batch</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBatch ? "Edit Batch" : "New Batch"}</DialogTitle>
            <DialogDescription>Enter batch and quality details</DialogDescription>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="batch" className="flex-1">Batch Info</TabsTrigger>
              <TabsTrigger value="stock" className="flex-1">Stock & Location</TabsTrigger>
              <TabsTrigger value="quality" className="flex-1">Quality</TabsTrigger>
              <TabsTrigger value="supplier" className="flex-1">Supplier</TabsTrigger>
            </TabsList>
            <TabsContent value="batch" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Batch No *</Label><Input value={formData.batchNo} onChange={e => setFormData(p => ({ ...p, batchNo: e.target.value }))} placeholder="BT-2026-XXX" /></div>
                <div><Label>Lot No</Label><Input value={formData.lotNo} onChange={e => setFormData(p => ({ ...p, lotNo: e.target.value }))} /></div>
                <div><Label>Product Code</Label><Input value={formData.productCode} onChange={e => setFormData(p => ({ ...p, productCode: e.target.value }))} /></div>
                <div><Label>Product Name *</Label><Input value={formData.productName} onChange={e => setFormData(p => ({ ...p, productName: e.target.value }))} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v as BatchStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>UOM</Label><Input value={formData.uom} onChange={e => setFormData(p => ({ ...p, uom: e.target.value }))} /></div>
                <div><Label>Manufacturing Date</Label><Input type="date" value={formData.manufacturingDate} onChange={e => setFormData(p => ({ ...p, manufacturingDate: e.target.value }))} /></div>
                <div><Label>Expiry Date</Label><Input type="date" value={formData.expiryDate} onChange={e => setFormData(p => ({ ...p, expiryDate: e.target.value }))} /></div>
                <div><Label>Received Date</Label><Input type="date" value={formData.receivedDate} onChange={e => setFormData(p => ({ ...p, receivedDate: e.target.value }))} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.serialTracking} onCheckedChange={v => setFormData(p => ({ ...p, serialTracking: v }))} />
                <Label>Enable Serial Number Tracking</Label>
              </div>
            </TabsContent>
            <TabsContent value="stock" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Total Quantity</Label><Input type="number" value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: +e.target.value }))} /></div>
                <div><Label>Available Qty</Label><Input type="number" value={formData.availableQty} onChange={e => setFormData(p => ({ ...p, availableQty: +e.target.value }))} /></div>
                <div><Label>Reserved Qty</Label><Input type="number" value={formData.reservedQty} onChange={e => setFormData(p => ({ ...p, reservedQty: +e.target.value }))} /></div>
                <div><Label>Location</Label><Input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} /></div>
                <div><Label>Bin</Label><Input value={formData.bin} onChange={e => setFormData(p => ({ ...p, bin: e.target.value }))} /></div>
                <div><Label>Cost Price</Label><Input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData(p => ({ ...p, costPrice: +e.target.value }))} /></div>
                <div><Label>Currency</Label><Input value={formData.currency} onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))} /></div>
              </div>
            </TabsContent>
            <TabsContent value="quality" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Certificate No</Label><Input value={formData.certificateNo} onChange={e => setFormData(p => ({ ...p, certificateNo: e.target.value }))} /></div>
                <div><Label>Quality Grade</Label><Input value={formData.qualityGrade} onChange={e => setFormData(p => ({ ...p, qualityGrade: e.target.value }))} /></div>
                <div><Label>Inspection Date</Label><Input type="date" value={formData.inspectionDate} onChange={e => setFormData(p => ({ ...p, inspectionDate: e.target.value }))} /></div>
                <div><Label>Inspected By</Label><Input value={formData.inspectedBy} onChange={e => setFormData(p => ({ ...p, inspectedBy: e.target.value }))} /></div>
                <div><Label>Temperature Range</Label><Input value={formData.temperature} onChange={e => setFormData(p => ({ ...p, temperature: e.target.value }))} placeholder="15-25°C" /></div>
                <div><Label>Humidity</Label><Input value={formData.humidity} onChange={e => setFormData(p => ({ ...p, humidity: e.target.value }))} placeholder="< 60%" /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3} /></div>
            </TabsContent>
            <TabsContent value="supplier" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Supplier</Label><Input value={formData.supplier} onChange={e => setFormData(p => ({ ...p, supplier: e.target.value }))} /></div>
                <div><Label>Supplier Batch No</Label><Input value={formData.supplierBatch} onChange={e => setFormData(p => ({ ...p, supplierBatch: e.target.value }))} /></div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingBatch ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchNumbers;
