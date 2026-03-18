import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Trash2, Upload, Save, Printer, FileText, Link2, Eye, Info,
  Package, ChevronDown, Search, Settings2, Copy, Send, X, MoreHorizontal,
  DollarSign, Calculator, ArrowLeftRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductInfoPopover from "./ProductInfoPopover";
import AdditionalAmountDialog from "./AdditionalAmountDialog";
import DocumentLinkingDialog from "./DocumentLinkingDialog";
import ExcelUploadDialog from "./ExcelUploadDialog";

export interface DocumentConfig {
  title: string;
  docType: string;
  showImportFields?: boolean;
  showRecurringFields?: boolean;
  showServiceFields?: boolean;
  showReturnFields?: boolean;
  showGRNFields?: boolean;
  showDebitNoteFields?: boolean;
  linkedDocTypes?: string[];
}

interface LineItem {
  id: string;
  location: string;
  productCode: string;
  description: string;
  unit: string;
  qty: number;
  fcRate: number;
  localAmount: number;
  binNo: string;
  vatPct: number;
  vatAmount: number;
  additionalAmount: number;
  additionalDetails: { name: string; amount: number }[];
  netAmount: number;
}

interface AdditionalColumn {
  id: string;
  label: string;
  field: string;
  visible: boolean;
}

const defaultColumns: AdditionalColumn[] = [
  { id: "discount", label: "Discount %", field: "discountPct", visible: false },
  { id: "discountAmt", label: "Discount Amt", field: "discountAmt", visible: false },
  { id: "weight", label: "Weight", field: "weight", visible: false },
  { id: "volume", label: "Volume", field: "volume", visible: false },
  { id: "batchNo", label: "Batch No", field: "batchNo", visible: false },
  { id: "expiryDate", label: "Expiry Date", field: "expiryDate", visible: false },
  { id: "serialNo", label: "Serial No", field: "serialNo", visible: false },
  { id: "remarks", label: "Remarks", field: "remarks", visible: false },
  { id: "costCenter", label: "Cost Center", field: "costCenter", visible: false },
  { id: "project", label: "Project", field: "project", visible: false },
];

const suppliers = [
  { id: "SUP001", name: "Al Futtaim Trading LLC", taxNo: "TRN-100293847" },
  { id: "SUP002", name: "Dubai Steel Industries", taxNo: "TRN-100384756" },
  { id: "SUP003", name: "Global Parts Supply Co.", taxNo: "TRN-100475638" },
  { id: "SUP004", name: "Emirates Hardware Dist.", taxNo: "TRN-100566729" },
];

const sampleProducts = [
  { code: "PRD-001", desc: "Steel Pipe 2\" x 6m", unit: "PCS", lastCost: 45.00, avgCost: 43.50 },
  { code: "PRD-002", desc: "Copper Wire 2.5mm 100m", unit: "ROLL", lastCost: 120.00, avgCost: 118.00 },
  { code: "PRD-003", desc: "PVC Fitting 1\" Elbow", unit: "PCS", lastCost: 3.50, avgCost: 3.25 },
  { code: "PRD-004", desc: "Hydraulic Oil 20L", unit: "CAN", lastCost: 85.00, avgCost: 82.00 },
  { code: "PRD-005", desc: "Welding Rod 3.15mm 5kg", unit: "PKT", lastCost: 28.00, avgCost: 27.00 },
];

const createEmptyLine = (): LineItem => ({
  id: crypto.randomUUID(),
  location: "",
  productCode: "",
  description: "",
  unit: "",
  qty: 0,
  fcRate: 0,
  localAmount: 0,
  binNo: "",
  vatPct: 5,
  vatAmount: 0,
  additionalAmount: 0,
  additionalDetails: [],
  netAmount: 0,
});

const PurchaseDocumentForm: React.FC<{ config: DocumentConfig }> = ({ config }) => {
  const { toast } = useToast();
  const [documentMode, setDocumentMode] = useState<"credit" | "cash">("credit");
  const [lines, setLines] = useState<LineItem[]>([createEmptyLine()]);
  const [extraColumns, setExtraColumns] = useState<AdditionalColumn[]>(defaultColumns);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [activeProductLine, setActiveProductLine] = useState<string | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [showLinking, setShowLinking] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [showAdditionalAmt, setShowAdditionalAmt] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const docNumber = `${config.docType}-${new Date().getFullYear()}-00001`;

  const recalcLine = useCallback((line: LineItem): LineItem => {
    const localAmount = line.qty * line.fcRate;
    const vatAmount = (localAmount * line.vatPct) / 100;
    const addlTotal = line.additionalDetails.reduce((s, a) => s + a.amount, 0);
    return {
      ...line,
      localAmount,
      vatAmount,
      additionalAmount: addlTotal,
      netAmount: localAmount + vatAmount + addlTotal,
    };
  }, []);

  const updateLine = (id: string, field: keyof LineItem, value: any) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? recalcLine({ ...l, [field]: value }) : l))
    );
  };

  const addLine = () => setLines((p) => [...p, createEmptyLine()]);

  const removeLine = (id: string) => {
    if (lines.length === 1) return;
    setLines((p) => p.filter((l) => l.id !== id));
  };

  const selectProduct = (lineId: string, product: typeof sampleProducts[0]) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? recalcLine({
              ...l,
              productCode: product.code,
              description: product.desc,
              unit: product.unit,
              fcRate: product.lastCost,
              qty: l.qty || 1,
            })
          : l
      )
    );
    setShowProductSearch(false);
    setActiveProductLine(null);
  };

  const toggleColumn = (colId: string) => {
    setExtraColumns((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, visible: !c.visible } : c))
    );
  };

  const visibleExtra = extraColumns.filter((c) => c.visible);

  const totals = lines.reduce(
    (acc, l) => ({
      subtotal: acc.subtotal + l.localAmount,
      vatTotal: acc.vatTotal + l.vatAmount,
      addlTotal: acc.addlTotal + l.additionalAmount,
      grandTotal: acc.grandTotal + l.netAmount,
    }),
    { subtotal: 0, vatTotal: 0, addlTotal: 0, grandTotal: 0 }
  );

  const handleSave = (status: string) => {
    toast({
      title: `${config.title} ${status}`,
      description: `Document ${docNumber} has been ${status.toLowerCase()}.`,
    });
  };

  const supplierInfo = suppliers.find((s) => s.id === selectedSupplier);

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            {docNumber}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border p-1">
            <button
              onClick={() => setDocumentMode("credit")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                documentMode === "credit"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Credit
            </button>
            <button
              onClick={() => setDocumentMode("cash")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                documentMode === "cash"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cash
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowExcelUpload(true)}>
            <Upload className="h-3.5 w-3.5 mr-1" /> Excel Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowLinking(true)}>
            <Link2 className="h-3.5 w-3.5 mr-1" /> Link Document
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSave("Drafted")}>
            <Save className="h-3.5 w-3.5 mr-1" /> Save Draft
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-3.5 w-3.5 mr-1" /> Print
          </Button>
          <Button size="sm" onClick={() => handleSave("Submitted")}>
            <Send className="h-3.5 w-3.5 mr-1" /> Submit
          </Button>
        </div>
      </div>

      {/* Document Header */}
      <Card className="border-border bg-card">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-4 gap-x-4 gap-y-3">
            {/* Row 1 */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Branch</Label>
              <Select defaultValue="main">
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Branch</SelectItem>
                  <SelectItem value="branch2">Branch 2</SelectItem>
                  <SelectItem value="branch3">Branch 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Division</Label>
              <Select defaultValue="trading">
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Location</Label>
              <Select defaultValue="wh1">
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wh1">Warehouse 1</SelectItem>
                  <SelectItem value="wh2">Warehouse 2</SelectItem>
                  <SelectItem value="shop">Shop Floor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Document No.</Label>
              <Input className="h-8 text-xs" defaultValue={docNumber} />
            </div>

            {/* Row 2 */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Document Date</Label>
              <Input type="date" className="h-8 text-xs" defaultValue={today} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Purchase Date</Label>
              <Input type="date" className="h-8 text-xs" defaultValue={today} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Credit Days</Label>
              <Input type="number" className="h-8 text-xs" defaultValue="30" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select supplier..." /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 3 */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Delivery Address</Label>
              <Select defaultValue="main">
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Office</SelectItem>
                  <SelectItem value="wh">Warehouse</SelectItem>
                  <SelectItem value="site">Site Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Tax Number</Label>
              <Input className="h-8 text-xs" value={supplierInfo?.taxNo || ""} readOnly placeholder="Auto from supplier" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Currency</Label>
              <Select defaultValue="aed">
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aed">AED</SelectItem>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="gbp">GBP</SelectItem>
                  <SelectItem value="inr">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Payment Terms</Label>
              <Select defaultValue="net30">
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="net30">Net 30</SelectItem>
                  <SelectItem value="net60">Net 60</SelectItem>
                  <SelectItem value="net90">Net 90</SelectItem>
                  <SelectItem value="cod">COD</SelectItem>
                  <SelectItem value="advance">Advance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 4 */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Previous Transaction</Label>
              <Input className="h-8 text-xs" placeholder="Linked doc..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Job Number</Label>
              <Input className="h-8 text-xs" placeholder="Job / Project..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Ref Doc No</Label>
              <Input className="h-8 text-xs" placeholder="Reference..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Ref Doc Date</Label>
              <Input type="date" className="h-8 text-xs" />
            </div>

            {/* Row 5 - conditional fields */}
            {(config.showImportFields || config.docType === "PI") && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">P.Invoice No</Label>
                <Input className="h-8 text-xs" placeholder="Invoice number..." />
              </div>
            )}
            {config.showImportFields && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Bill of Lading</Label>
                  <Input className="h-8 text-xs" placeholder="B/L number..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Customs Declaration</Label>
                  <Input className="h-8 text-xs" placeholder="Declaration no..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Port of Origin</Label>
                  <Select defaultValue="">
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select port..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jebel-ali">Jebel Ali</SelectItem>
                      <SelectItem value="shanghai">Shanghai</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="rotterdam">Rotterdam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {config.showRecurringFields && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Frequency</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Next Run Date</Label>
                  <Input type="date" className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">End Date</Label>
                  <Input type="date" className="h-8 text-xs" />
                </div>
              </>
            )}
            {config.showReturnFields && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Original Invoice</Label>
                  <Input className="h-8 text-xs" placeholder="Select invoice..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Return Reason</Label>
                  <Select defaultValue="">
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defective">Defective</SelectItem>
                      <SelectItem value="wrong-item">Wrong Item</SelectItem>
                      <SelectItem value="excess">Excess Quantity</SelectItem>
                      <SelectItem value="quality">Quality Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {config.showGRNFields && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">PO Reference</Label>
                  <Input className="h-8 text-xs" placeholder="Select PO..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Received By</Label>
                  <Input className="h-8 text-xs" placeholder="Receiver name..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Inspection Status</Label>
                  <Select defaultValue="pending">
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="passed">Passed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <Card className="border-border bg-card">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Line Items</CardTitle>
            <div className="flex items-center gap-2">
              <Dialog open={showColumnConfig} onOpenChange={setShowColumnConfig}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Settings2 className="h-3.5 w-3.5 mr-1" /> Columns
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Configure Columns</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3 py-4">
                    {extraColumns.map((col) => (
                      <div key={col.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={col.visible}
                          onCheckedChange={() => toggleColumn(col.id)}
                        />
                        <Label className="text-sm">{col.label}</Label>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addLine}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Line
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="w-8 text-xs">#</TableHead>
                  <TableHead className="text-xs w-24">Location</TableHead>
                  <TableHead className="text-xs w-28">Product Code</TableHead>
                  <TableHead className="text-xs min-w-[180px]">Description</TableHead>
                  <TableHead className="text-xs w-16">Unit</TableHead>
                  <TableHead className="text-xs w-16 text-right">Qty</TableHead>
                  <TableHead className="text-xs w-24 text-right">FC Rate</TableHead>
                  <TableHead className="text-xs w-24 text-right">Local Amt</TableHead>
                  <TableHead className="text-xs w-20">Bin No</TableHead>
                  <TableHead className="text-xs w-16 text-right">VAT %</TableHead>
                  <TableHead className="text-xs w-24 text-right">VAT Amt</TableHead>
                  <TableHead className="text-xs w-24 text-right">Addl Amt</TableHead>
                  {visibleExtra.map((col) => (
                    <TableHead key={col.id} className="text-xs w-24">{col.label}</TableHead>
                  ))}
                  <TableHead className="text-xs w-28 text-right">Net Amount</TableHead>
                  <TableHead className="w-20 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, idx) => (
                  <TableRow key={line.id} className="group">
                    <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <Select
                        value={line.location}
                        onValueChange={(v) => updateLine(line.id, "location", v)}
                      >
                        <SelectTrigger className="h-7 text-xs border-transparent hover:border-border">
                          <SelectValue placeholder="..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wh1">WH-1</SelectItem>
                          <SelectItem value="wh2">WH-2</SelectItem>
                          <SelectItem value="shop">Shop</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Input
                          className="h-7 text-xs border-transparent hover:border-border w-20"
                          value={line.productCode}
                          onChange={(e) => updateLine(line.id, "productCode", e.target.value)}
                          placeholder="Code"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setActiveProductLine(line.id);
                            setShowProductSearch(true);
                          }}
                        >
                          <Search className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Input
                          className="h-7 text-xs border-transparent hover:border-border flex-1"
                          value={line.description}
                          onChange={(e) => updateLine(line.id, "description", e.target.value)}
                          placeholder="Product description"
                        />
                        {line.productCode && (
                          <ProductInfoPopover productCode={line.productCode} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-7 text-xs border-transparent hover:border-border w-14"
                        value={line.unit}
                        onChange={(e) => updateLine(line.id, "unit", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-7 text-xs border-transparent hover:border-border w-14 text-right"
                        value={line.qty || ""}
                        onChange={(e) => updateLine(line.id, "qty", Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-7 text-xs border-transparent hover:border-border w-20 text-right"
                        value={line.fcRate || ""}
                        onChange={(e) => updateLine(line.id, "fcRate", Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-right font-medium">
                      {line.localAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-7 text-xs border-transparent hover:border-border w-16"
                        value={line.binNo}
                        onChange={(e) => updateLine(line.id, "binNo", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-7 text-xs border-transparent hover:border-border w-14 text-right"
                        value={line.vatPct}
                        onChange={(e) => updateLine(line.id, "vatPct", Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {line.vatAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs w-full justify-end"
                        onClick={() => {
                          setSelectedLineId(line.id);
                          setShowAdditionalAmt(true);
                        }}
                      >
                        {line.additionalAmount > 0 ? line.additionalAmount.toFixed(2) : "—"}
                        <Plus className="h-3 w-3 ml-1" />
                      </Button>
                    </TableCell>
                    {visibleExtra.map((col) => (
                      <TableCell key={col.id}>
                        <Input
                          className="h-7 text-xs border-transparent hover:border-border"
                          placeholder="..."
                        />
                      </TableCell>
                    ))}
                    <TableCell className="text-xs text-right font-bold text-primary">
                      {line.netAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => {
                          const copy = { ...line, id: crypto.randomUUID() };
                          setLines((p) => [...p, recalcLine(copy)]);
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive"
                          onClick={() => removeLine(line.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Totals & Notes */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 border-border bg-card">
          <CardContent className="pt-4 space-y-3">
            <Label className="text-xs text-muted-foreground">Notes / Remarks</Label>
            <Textarea className="text-xs min-h-[60px]" placeholder="Document notes, special instructions..." />
            <div className="flex items-center gap-4">
              <Label className="text-xs text-muted-foreground">Internal Memo</Label>
              <Textarea className="text-xs min-h-[40px] flex-1" placeholder="Internal notes (not printed)..." />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">VAT / Tax</span>
              <span className="font-medium">{totals.vatTotal.toFixed(2)}</span>
            </div>
            {totals.addlTotal > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Additional</span>
                <span className="font-medium">{totals.addlTotal.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Grand Total</span>
              <span className="font-bold text-primary">{totals.grandTotal.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Items</span>
              <span>{lines.filter((l) => l.productCode).length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Qty</span>
              <span>{lines.reduce((s, l) => s + l.qty, 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Search Dialog */}
      <Dialog open={showProductSearch} onOpenChange={setShowProductSearch}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search Product</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search by code or description..."
            value={productSearchTerm}
            onChange={(e) => setProductSearchTerm(e.target.value)}
            className="mb-3"
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Code</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Unit</TableHead>
                <TableHead className="text-xs text-right">Last Cost</TableHead>
                <TableHead className="text-xs text-right">Avg Cost</TableHead>
                <TableHead className="text-xs w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleProducts
                .filter(
                  (p) =>
                    !productSearchTerm ||
                    p.code.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    p.desc.toLowerCase().includes(productSearchTerm.toLowerCase())
                )
                .map((p) => (
                  <TableRow key={p.code} className="cursor-pointer hover:bg-secondary/50">
                    <TableCell className="text-xs font-mono">{p.code}</TableCell>
                    <TableCell className="text-xs">{p.desc}</TableCell>
                    <TableCell className="text-xs">{p.unit}</TableCell>
                    <TableCell className="text-xs text-right">{p.lastCost.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right">{p.avgCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => activeProductLine && selectProduct(activeProductLine, p)}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Additional Amount Dialog */}
      <AdditionalAmountDialog
        open={showAdditionalAmt}
        onOpenChange={setShowAdditionalAmt}
        lineId={selectedLineId}
        currentDetails={lines.find((l) => l.id === selectedLineId)?.additionalDetails || []}
        onSave={(lineId, details) => {
          setLines((prev) =>
            prev.map((l) =>
              l.id === lineId
                ? recalcLine({ ...l, additionalDetails: details })
                : l
            )
          );
        }}
      />

      {/* Document Linking Dialog */}
      <DocumentLinkingDialog
        open={showLinking}
        onOpenChange={setShowLinking}
        docType={config.docType}
        linkedDocTypes={config.linkedDocTypes || []}
      />

      {/* Excel Upload Dialog */}
      <ExcelUploadDialog
        open={showExcelUpload}
        onOpenChange={setShowExcelUpload}
        onImport={(data) => {
          toast({ title: "Excel Imported", description: `${data.length} lines imported.` });
        }}
      />
    </div>
  );
};

export default PurchaseDocumentForm;
