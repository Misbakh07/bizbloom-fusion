import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Search, Edit2, Trash2, Copy, Printer, QrCode, Barcode,
  Download, Upload, Filter, MoreHorizontal, Eye, RefreshCw,
  Hash, Tag, Package, ScanLine,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type BarcodeFormat = "EAN-13" | "EAN-8" | "UPC-A" | "UPC-E" | "Code128" | "Code39" | "ITF-14" | "QR" | "DataMatrix";

interface BarcodeEntry {
  id: string;
  barcode: string;
  format: BarcodeFormat;
  productCode: string;
  productName: string;
  variant?: string;
  uom: string;
  batchNumber?: string;
  status: "active" | "inactive" | "retired";
  isPrimary: boolean;
  createdAt: string;
  lastScanned?: string;
  scanCount: number;
}

interface BarcodeTemplate {
  id: string;
  name: string;
  format: BarcodeFormat;
  prefix: string;
  nextSequence: number;
  digitLength: number;
  includeCheckDigit: boolean;
  isDefault: boolean;
  description: string;
}

const initialBarcodes: BarcodeEntry[] = [
  { id: "1", barcode: "8901234567890", format: "EAN-13", productCode: "PRD-001", productName: "Hydraulic Pump Assembly", variant: "12V", uom: "PCS", status: "active", isPrimary: true, createdAt: "2025-01-15", lastScanned: "2026-03-14", scanCount: 342 },
  { id: "2", barcode: "8901234567906", format: "EAN-13", productCode: "PRD-001", productName: "Hydraulic Pump Assembly", variant: "24V", uom: "PCS", status: "active", isPrimary: false, createdAt: "2025-01-15", lastScanned: "2026-03-12", scanCount: 187 },
  { id: "3", barcode: "012345678905", format: "UPC-A", productCode: "PRD-002", productName: "Brake Pad Set – Ceramic", uom: "SET", status: "active", isPrimary: true, createdAt: "2025-02-10", lastScanned: "2026-03-15", scanCount: 891 },
  { id: "4", barcode: "PRD003-A1", format: "Code128", productCode: "PRD-003", productName: "Engine Oil Filter", uom: "PCS", batchNumber: "BT-2026-001", status: "active", isPrimary: true, createdAt: "2025-03-05", lastScanned: "2026-03-10", scanCount: 456 },
  { id: "5", barcode: "89012345", format: "EAN-8", productCode: "PRD-004", productName: "Spark Plug – Iridium", uom: "PCS", status: "inactive", isPrimary: true, createdAt: "2025-04-20", scanCount: 23 },
  { id: "6", barcode: "14512345678906", format: "ITF-14", productCode: "PRD-005", productName: "Timing Belt Kit", uom: "KIT", status: "active", isPrimary: true, createdAt: "2025-05-12", lastScanned: "2026-03-13", scanCount: 134 },
];

const initialTemplates: BarcodeTemplate[] = [
  { id: "1", name: "Standard EAN-13", format: "EAN-13", prefix: "890", nextSequence: 1235, digitLength: 13, includeCheckDigit: true, isDefault: true, description: "Default barcode format for all products" },
  { id: "2", name: "Internal Code128", format: "Code128", prefix: "PRD", nextSequence: 450, digitLength: 10, includeCheckDigit: false, isDefault: false, description: "Internal tracking barcodes" },
  { id: "3", name: "Carton ITF-14", format: "ITF-14", prefix: "145", nextSequence: 890, digitLength: 14, includeCheckDigit: true, isDefault: false, description: "Outer carton barcodes for shipping" },
];

const formatColors: Record<BarcodeFormat, string> = {
  "EAN-13": "bg-primary/10 text-primary",
  "EAN-8": "bg-accent/80 text-accent-foreground",
  "UPC-A": "bg-secondary text-secondary-foreground",
  "UPC-E": "bg-muted text-muted-foreground",
  "Code128": "bg-destructive/10 text-destructive",
  "Code39": "bg-primary/20 text-primary",
  "ITF-14": "bg-secondary/80 text-secondary-foreground",
  "QR": "bg-accent text-accent-foreground",
  "DataMatrix": "bg-muted text-muted-foreground",
};

const BarcodeMaster: React.FC = () => {
  const { toast } = useToast();
  const [barcodes, setBarcodes] = useState<BarcodeEntry[]>(initialBarcodes);
  const [templates, setTemplates] = useState<BarcodeTemplate[]>(initialTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormat, setFilterFormat] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingBarcode, setEditingBarcode] = useState<BarcodeEntry | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<BarcodeTemplate | null>(null);

  const [barcodeForm, setBarcodeForm] = useState({
    barcode: "", format: "EAN-13" as BarcodeFormat, productCode: "", productName: "",
    variant: "", uom: "PCS", batchNumber: "", isPrimary: true,
  });

  const [templateForm, setTemplateForm] = useState({
    name: "", format: "EAN-13" as BarcodeFormat, prefix: "", nextSequence: 1,
    digitLength: 13, includeCheckDigit: true, isDefault: false, description: "",
  });

  const filteredBarcodes = barcodes.filter((b) => {
    const matchesSearch = !searchTerm || b.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = filterFormat === "all" || b.format === filterFormat;
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesFormat && matchesStatus;
  });

  const kpis = {
    total: barcodes.length,
    active: barcodes.filter((b) => b.status === "active").length,
    totalScans: barcodes.reduce((sum, b) => sum + b.scanCount, 0),
    formats: new Set(barcodes.map((b) => b.format)).size,
  };

  const openNewBarcode = () => {
    setEditingBarcode(null);
    setBarcodeForm({ barcode: "", format: "EAN-13", productCode: "", productName: "", variant: "", uom: "PCS", batchNumber: "", isPrimary: true });
    setShowBarcodeDialog(true);
  };

  const openEditBarcode = (b: BarcodeEntry) => {
    setEditingBarcode(b);
    setBarcodeForm({ barcode: b.barcode, format: b.format, productCode: b.productCode, productName: b.productName, variant: b.variant || "", uom: b.uom, batchNumber: b.batchNumber || "", isPrimary: b.isPrimary });
    setShowBarcodeDialog(true);
  };

  const saveBarcode = () => {
    if (!barcodeForm.barcode || !barcodeForm.productCode || !barcodeForm.productName) {
      toast({ title: "Validation Error", description: "Barcode, product code and product name are required.", variant: "destructive" });
      return;
    }
    if (editingBarcode) {
      setBarcodes((prev) => prev.map((b) => b.id === editingBarcode.id ? { ...b, ...barcodeForm, variant: barcodeForm.variant || undefined, batchNumber: barcodeForm.batchNumber || undefined } : b));
      toast({ title: "Barcode Updated" });
    } else {
      const newEntry: BarcodeEntry = {
        id: Date.now().toString(), ...barcodeForm,
        variant: barcodeForm.variant || undefined, batchNumber: barcodeForm.batchNumber || undefined,
        status: "active", createdAt: new Date().toISOString().split("T")[0], scanCount: 0,
      };
      setBarcodes((prev) => [...prev, newEntry]);
      toast({ title: "Barcode Created" });
    }
    setShowBarcodeDialog(false);
  };

  const deleteBarcode = (id: string) => {
    setBarcodes((prev) => prev.filter((b) => b.id !== id));
    toast({ title: "Barcode Deleted" });
  };

  const generateBarcode = () => {
    const defaultTpl = templates.find((t) => t.isDefault) || templates[0];
    if (!defaultTpl) return;
    const seq = String(defaultTpl.nextSequence).padStart(defaultTpl.digitLength - defaultTpl.prefix.length - (defaultTpl.includeCheckDigit ? 1 : 0), "0");
    const code = defaultTpl.prefix + seq;
    setBarcodeForm((prev) => ({ ...prev, barcode: code, format: defaultTpl.format }));
    setTemplates((prev) => prev.map((t) => t.id === defaultTpl.id ? { ...t, nextSequence: t.nextSequence + 1 } : t));
  };

  const openNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: "", format: "EAN-13", prefix: "", nextSequence: 1, digitLength: 13, includeCheckDigit: true, isDefault: false, description: "" });
    setShowTemplateDialog(true);
  };

  const openEditTemplate = (t: BarcodeTemplate) => {
    setEditingTemplate(t);
    setTemplateForm({ name: t.name, format: t.format, prefix: t.prefix, nextSequence: t.nextSequence, digitLength: t.digitLength, includeCheckDigit: t.includeCheckDigit, isDefault: t.isDefault, description: t.description });
    setShowTemplateDialog(true);
  };

  const saveTemplate = () => {
    if (!templateForm.name || !templateForm.prefix) {
      toast({ title: "Validation Error", description: "Name and prefix are required.", variant: "destructive" });
      return;
    }
    if (editingTemplate) {
      setTemplates((prev) => prev.map((t) => {
        if (t.id === editingTemplate.id) return { ...t, ...templateForm };
        if (templateForm.isDefault) return { ...t, isDefault: false };
        return t;
      }));
      toast({ title: "Template Updated" });
    } else {
      const newTpl: BarcodeTemplate = { id: Date.now().toString(), ...templateForm };
      setTemplates((prev) => {
        const updated = templateForm.isDefault ? prev.map((t) => ({ ...t, isDefault: false })) : prev;
        return [...updated, newTpl];
      });
      toast({ title: "Template Created" });
    }
    setShowTemplateDialog(false);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Template Deleted" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Barcode Master</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage barcodes, QR codes, and generation templates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1.5" />Print Labels</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" />Export</Button>
          <Button size="sm" onClick={openNewBarcode}><Plus className="h-4 w-4 mr-1.5" />New Barcode</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Barcodes", value: kpis.total, icon: Barcode, color: "text-primary" },
          { label: "Active", value: kpis.active, icon: ScanLine, color: "text-primary" },
          { label: "Total Scans", value: kpis.totalScans.toLocaleString(), icon: Hash, color: "text-primary" },
          { label: "Formats Used", value: kpis.formats, icon: Tag, color: "text-primary" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="barcodes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="barcodes">Barcodes</TabsTrigger>
          <TabsTrigger value="templates">Generation Templates</TabsTrigger>
        </TabsList>

        {/* Barcodes Tab */}
        <TabsContent value="barcodes" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search barcode, product code or name…" className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={filterFormat} onValueChange={setFilterFormat}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Format" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                {(["EAN-13", "EAN-8", "UPC-A", "UPC-E", "Code128", "Code39", "ITF-14", "QR", "DataMatrix"] as BarcodeFormat[]).map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border border-border/50">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Barcode</TableHead>
                    <TableHead className="font-semibold">Format</TableHead>
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">Variant</TableHead>
                    <TableHead className="font-semibold">UOM</TableHead>
                    <TableHead className="font-semibold">Batch</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Scans</TableHead>
                    <TableHead className="font-semibold">Last Scanned</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBarcodes.length === 0 ? (
                    <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No barcodes found</TableCell></TableRow>
                  ) : filteredBarcodes.map((b) => (
                    <TableRow key={b.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{b.barcode}</code>
                          {b.isPrimary && <Badge variant="outline" className="text-[10px] px-1">Primary</Badge>}
                        </div>
                      </TableCell>
                      <TableCell><Badge className={`${formatColors[b.format]} border-0 text-xs`}>{b.format}</Badge></TableCell>
                      <TableCell>
                        <div>
                          <span className="text-xs text-muted-foreground">{b.productCode}</span>
                          <p className="text-sm font-medium text-foreground">{b.productName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{b.variant || "—"}</TableCell>
                      <TableCell className="text-sm">{b.uom}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{b.batchNumber || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={b.status === "active" ? "default" : b.status === "inactive" ? "secondary" : "outline"} className="text-xs">
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">{b.scanCount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{b.lastScanned || "Never"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditBarcode(b)}><Edit2 className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Printer className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteBarcode(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Configure barcode generation templates with prefix, sequence and format rules.</p>
            <Button size="sm" onClick={openNewTemplate}><Plus className="h-4 w-4 mr-1.5" />New Template</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <Card key={t.id} className={`border ${t.isDefault ? "border-primary/50 bg-primary/5" : "border-border/50"} hover:shadow-md transition-shadow`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {t.name}
                      {t.isDefault && <Badge className="text-[10px] bg-primary/10 text-primary border-0">Default</Badge>}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditTemplate(t)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTemplate(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Format:</span> <Badge className={`${formatColors[t.format]} border-0 text-[10px] ml-1`}>{t.format}</Badge></div>
                    <div><span className="text-muted-foreground">Prefix:</span> <code className="bg-muted px-1.5 py-0.5 rounded ml-1">{t.prefix}</code></div>
                    <div><span className="text-muted-foreground">Next Seq:</span> <span className="font-medium text-foreground ml-1">{t.nextSequence}</span></div>
                    <div><span className="text-muted-foreground">Length:</span> <span className="font-medium text-foreground ml-1">{t.digitLength} digits</span></div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`h-2 w-2 rounded-full ${t.includeCheckDigit ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    Check digit {t.includeCheckDigit ? "enabled" : "disabled"}
                  </div>
                  <div className="pt-1 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground">Preview: <code className="bg-muted px-1.5 py-0.5 rounded">{t.prefix}{String(t.nextSequence).padStart(t.digitLength - t.prefix.length, "0")}</code></p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Barcode Dialog */}
      <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBarcode ? "Edit Barcode" : "New Barcode"}</DialogTitle>
            <DialogDescription>Enter barcode details and link to a product.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label>Barcode *</Label>
                <Input value={barcodeForm.barcode} onChange={(e) => setBarcodeForm((p) => ({ ...p, barcode: e.target.value }))} placeholder="Enter or generate" />
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={generateBarcode} className="mb-0.5"><RefreshCw className="h-3.5 w-3.5 mr-1" />Generate</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Format *</Label>
                <Select value={barcodeForm.format} onValueChange={(v) => setBarcodeForm((p) => ({ ...p, format: v as BarcodeFormat }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["EAN-13", "EAN-8", "UPC-A", "UPC-E", "Code128", "Code39", "ITF-14", "QR", "DataMatrix"] as BarcodeFormat[]).map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>UOM</Label>
                <Select value={barcodeForm.uom} onValueChange={(v) => setBarcodeForm((p) => ({ ...p, uom: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["PCS", "SET", "KIT", "BOX", "KG", "LTR", "MTR"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Product Code *</Label>
                <Input value={barcodeForm.productCode} onChange={(e) => setBarcodeForm((p) => ({ ...p, productCode: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Variant</Label>
                <Input value={barcodeForm.variant} onChange={(e) => setBarcodeForm((p) => ({ ...p, variant: e.target.value }))} placeholder="e.g. 12V, Red, XL" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Product Name *</Label>
              <Input value={barcodeForm.productName} onChange={(e) => setBarcodeForm((p) => ({ ...p, productName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Batch Number</Label>
              <Input value={barcodeForm.batchNumber} onChange={(e) => setBarcodeForm((p) => ({ ...p, batchNumber: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={barcodeForm.isPrimary} onCheckedChange={(v) => setBarcodeForm((p) => ({ ...p, isPrimary: v }))} />
              <Label className="text-sm">Primary barcode for this product</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBarcodeDialog(false)}>Cancel</Button>
            <Button onClick={saveBarcode}>{editingBarcode ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "New Template"}</DialogTitle>
            <DialogDescription>Configure barcode generation rules.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Template Name *</Label>
              <Input value={templateForm.name} onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={templateForm.description} onChange={(e) => setTemplateForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Format</Label>
                <Select value={templateForm.format} onValueChange={(v) => setTemplateForm((p) => ({ ...p, format: v as BarcodeFormat }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["EAN-13", "EAN-8", "UPC-A", "UPC-E", "Code128", "Code39", "ITF-14", "QR", "DataMatrix"] as BarcodeFormat[]).map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prefix *</Label>
                <Input value={templateForm.prefix} onChange={(e) => setTemplateForm((p) => ({ ...p, prefix: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Next Sequence</Label>
                <Input type="number" value={templateForm.nextSequence} onChange={(e) => setTemplateForm((p) => ({ ...p, nextSequence: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Total Length</Label>
                <Input type="number" value={templateForm.digitLength} onChange={(e) => setTemplateForm((p) => ({ ...p, digitLength: Number(e.target.value) }))} />
              </div>
              <div className="flex items-end pb-0.5 gap-2">
                <Switch checked={templateForm.includeCheckDigit} onCheckedChange={(v) => setTemplateForm((p) => ({ ...p, includeCheckDigit: v }))} />
                <Label className="text-xs">Check digit</Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={templateForm.isDefault} onCheckedChange={(v) => setTemplateForm((p) => ({ ...p, isDefault: v }))} />
              <Label className="text-sm">Set as default template</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
            <Button onClick={saveTemplate}>{editingTemplate ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarcodeMaster;
