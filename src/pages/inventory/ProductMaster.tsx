import { useState } from "react";
import {
  Package, Plus, Search, Printer, Tag, Upload, Download, Globe, Monitor,
  Image, Barcode, Trash2, ChevronDown, Star, Copy, RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ───── Reusable field row ───── */
const Field = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
  </div>
);

/* ───── Section wrapper ───── */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-foreground border-b border-border/40 pb-2">{title}</h3>
    {children}
  </div>
);

/* ───── Dynamic row list (substitute / supersede / fitment / bins etc.) ───── */
const DynamicRows = ({
  title, columns, rows, onAdd,
}: {
  title: string;
  columns: string[];
  rows: string[][];
  onAdd: () => void;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-xs text-muted-foreground">{title}</Label>
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onAdd}>
        <Plus size={12} /> Add
      </Button>
    </div>
    <div className="border border-border/40 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/30">
            {columns.map((c) => (
              <TableHead key={c} className="text-xs h-8">{c}</TableHead>
            ))}
            <TableHead className="w-10 text-xs h-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center text-xs text-muted-foreground py-4">
                No records. Click "Add" to create one.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell key={j} className="py-1.5">
                    <Input defaultValue={cell} className="h-7 text-xs" />
                  </TableCell>
                ))}
                <TableCell className="py-1.5">
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive">
                    <Trash2 size={12} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  </div>
);

/* ════════════════════════════════════════════════ */
/*                PRODUCT MASTER                   */
/* ════════════════════════════════════════════════ */
const ProductMaster = () => {
  const [substituteRows, setSubstituteRows] = useState<string[][]>([]);
  const [supersedeRows, setSupersedeRows] = useState<string[][]>([]);
  const [fitmentRows, setFitmentRows] = useState<string[][]>([]);
  const [locationRows, setLocationRows] = useState<string[][]>([
    ["Main Warehouse", "10", "500", "50", "100", "A1-01"],
  ]);
  const [altUomRows, setAltUomRows] = useState<string[][]>([]);
  const [supplierRows, setSupplierRows] = useState<string[][]>([]);
  const [customerRows, setCustomerRows] = useState<string[][]>([]);
  const [priceRows, setPriceRows] = useState<string[][]>([
    ["Retail Price", "150.00", "USD"],
    ["Wholesale Price", "120.00", "USD"],
  ]);
  const [binRows, setBinRows] = useState<string[][]>([["A1-01"], ["A1-02"]]);

  return (
    <div className="space-y-4 max-w-[1600px]">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Product Master</h1>
            <p className="text-xs text-muted-foreground">Manage inventory items, pricing, locations & more</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Search size={14} /> Search
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Printer size={14} /> Print Label
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Tag size={14} /> Generate Labels
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download size={14} /> Export
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Upload size={14} /> Import
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            <Plus size={14} /> New Product
          </Button>
        </div>
      </div>

      {/* ── Main Tabs ── */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="bg-secondary/40 flex flex-wrap h-auto gap-1 p-1">
          {[
            "basic", "pricing", "locations", "other", "fitment", "channels",
          ].map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {t === "basic" ? "Basic Details" : t === "pricing" ? "Pricing & Cost" : t === "channels" ? "Web Store & POS" : t.charAt(0).toUpperCase() + t.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ════════ TAB 1 — Basic Details ════════ */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left – Core fields */}
            <Card className="lg:col-span-2 glass-card border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Field label="Stock / Product Code">
                    <Input placeholder="PRD-00001" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="Serial Number">
                    <Input placeholder="SN-000000" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="HS Code">
                    <Input placeholder="8471.30.00" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="Product Description" className="sm:col-span-2">
                    <Input placeholder="Enter product description" className="h-8 text-xs" />
                  </Field>
                  <Field label="Description Translation">
                    <Input placeholder="ترجمہ / الترجمة" className="h-8 text-xs" dir="rtl" />
                  </Field>
                  <Field label="Barcode">
                    <div className="flex gap-1.5">
                      <Input placeholder="Scan or enter barcode" className="h-8 text-xs font-mono" />
                      <Button size="icon" variant="outline" className="h-8 w-8 shrink-0">
                        <Barcode size={14} />
                      </Button>
                    </div>
                  </Field>
                  <Field label="Brand">
                    <Select>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select brand" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brand-a">Brand A</SelectItem>
                        <SelectItem value="brand-b">Brand B</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Manufacturer">
                    <Select>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select manufacturer" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mfr-a">Manufacturer A</SelectItem>
                        <SelectItem value="mfr-b">Manufacturer B</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Size">
                    <Input placeholder="e.g. Large / 42" className="h-8 text-xs" />
                  </Field>
                  <Field label="Color">
                    <Input placeholder="e.g. Red" className="h-8 text-xs" />
                  </Field>
                  <Field label="Product Type">
                    <Select>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="finished">Finished Good</SelectItem>
                        <SelectItem value="raw">Raw Material</SelectItem>
                        <SelectItem value="semi">Semi-Finished</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Items Group">
                    <Select>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select group" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g1">Electronics</SelectItem>
                        <SelectItem value="g2">Mechanical</SelectItem>
                        <SelectItem value="g3">Consumables</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Tax Group">
                    <Select>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select tax group" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vat5">VAT 5%</SelectItem>
                        <SelectItem value="vat15">VAT 15%</SelectItem>
                        <SelectItem value="exempt">Exempt</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Separator className="bg-border/30" />

                {/* UOM & Costing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Main UOM">
                    <Select>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pieces" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Pieces</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="ltr">Liters</SelectItem>
                        <SelectItem value="mtr">Meters</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Sale UOM">
                    <Select>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pieces" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Pieces</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="doz">Dozen</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Costing Method">
                    <Select>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fifo">FIFO</SelectItem>
                        <SelectItem value="lifo">LIFO</SelectItem>
                        <SelectItem value="avg">Weighted Average</SelectItem>
                        <SelectItem value="std">Standard Cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="VED Classification">
                    <Select>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vital">Vital</SelectItem>
                        <SelectItem value="essential">Essential</SelectItem>
                        <SelectItem value="desirable">Desirable</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Separator className="bg-border/30" />

                {/* Qty thresholds */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <Field label="Minimum Qty">
                    <Input type="number" placeholder="0" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="Maximum Qty">
                    <Input type="number" placeholder="0" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="Reorder Level">
                    <Input type="number" placeholder="0" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="Expiry Date">
                    <Input type="date" className="h-8 text-xs" />
                  </Field>
                  <Field label="Country of Origin">
                    <Input placeholder="e.g. Pakistan" className="h-8 text-xs" />
                  </Field>
                  <Field label="HS Code">
                    <Input placeholder="8471.30.00" className="h-8 text-xs font-mono" />
                  </Field>
                </div>

                <Separator className="bg-border/30" />

                {/* Toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3 gap-x-6">
                  {[
                    "Non-Stock Item", "Consignment Issue Item", "Consignment Receipt Item",
                    "Seasonal Item",
                  ].map((label) => (
                    <div key={label} className="flex items-center gap-2">
                      <Switch id={label} />
                      <Label htmlFor={label} className="text-xs">{label}</Label>
                    </div>
                  ))}
                </div>

                {/* Season dates (shown conditionally for demo) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Season Start Date">
                    <Input type="date" className="h-8 text-xs" />
                  </Field>
                  <Field label="Season End Date">
                    <Input type="date" className="h-8 text-xs" />
                  </Field>
                </div>
              </CardContent>
            </Card>

            {/* Right – Image & Quick Info */}
            <div className="space-y-4">
              <Card className="glass-card border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Product Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="w-full aspect-square rounded-lg bg-secondary/30 border border-dashed border-border/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 transition-colors">
                    <Image size={32} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Click to upload or drag & drop</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1">
                      <Upload size={12} /> Upload
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1">
                      <RefreshCw size={12} /> Sync Google
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Labels & Printing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                    <Tag size={14} /> Generate Barcode Label
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                    <Printer size={14} /> Print Product Label
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                    <Copy size={14} /> Batch Print Labels
                  </Button>
                  <Field label="Label Qty">
                    <Input type="number" defaultValue="1" className="h-8 text-xs font-mono" />
                  </Field>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════ TAB 2 — Pricing & Cost ════════ */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Pricing Method">
                    <Select>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="markup">Cost + Markup</SelectItem>
                        <SelectItem value="margin">Margin Based</SelectItem>
                        <SelectItem value="tiered">Tiered Pricing</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Standard Cost">
                    <Input type="number" placeholder="0.00" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="Minimum Selling Price">
                    <Input type="number" placeholder="0.00" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="Discount %">
                    <Input type="number" placeholder="0" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="ICT Margin %">
                    <Input type="number" placeholder="0" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="Loyalty Points">
                    <Input type="number" placeholder="0" className="h-8 text-xs font-mono" />
                  </Field>
                </div>

                <Separator className="bg-border/30" />

                <DynamicRows
                  title="Selling Prices (Multiple)"
                  columns={["Price Type", "Amount", "Currency"]}
                  rows={priceRows}
                  onAdd={() => setPriceRows([...priceRows, ["", "", "USD"]])}
                />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="glass-card border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Alternative UOM</CardTitle>
                </CardHeader>
                <CardContent>
                  <DynamicRows
                    title="UOM Conversions"
                    columns={["Alt UOM", "Conversion Factor", "Barcode"]}
                    rows={altUomRows}
                    onAdd={() => setAltUomRows([...altUomRows, ["", "", ""]])}
                  />
                </CardContent>
              </Card>

              <Card className="glass-card border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Packing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Pack Size">
                      <Input type="number" placeholder="0" className="h-8 text-xs font-mono" />
                    </Field>
                    <Field label="Pack UOM">
                      <Select>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="carton">Carton</SelectItem>
                          <SelectItem value="pallet">Pallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Weight (kg)">
                      <Input type="number" placeholder="0.00" className="h-8 text-xs font-mono" />
                    </Field>
                    <Field label="Dimensions (L×W×H)">
                      <Input placeholder="0 × 0 × 0 cm" className="h-8 text-xs font-mono" />
                    </Field>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════ TAB 3 — Locations ════════ */}
        <TabsContent value="locations" className="space-y-4">
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Location Details</CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicRows
                title="Locations"
                columns={["Location", "Min Qty", "Max Qty", "Re-Order Level", "Re-Order Qty", "Bin Number"]}
                rows={locationRows}
                onAdd={() => setLocationRows([...locationRows, ["", "", "", "", "", ""]])}
              />
            </CardContent>
          </Card>

          <Card className="glass-card border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Bin Numbers (Dropdown)</CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicRows
                title="Available Bins"
                columns={["Bin / Rack / Shelf"]}
                rows={binRows}
                onAdd={() => setBinRows([...binRows, [""]])}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Supplier Details</CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicRows
                  title="Suppliers"
                  columns={["Supplier Name", "Supplier Code", "Lead Time (days)", "Cost Price"]}
                  rows={supplierRows}
                  onAdd={() => setSupplierRows([...supplierRows, ["", "", "", ""]])}
                />
              </CardContent>
            </Card>
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Customer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicRows
                  title="Customers"
                  columns={["Customer Name", "Customer Code", "Special Price"]}
                  rows={customerRows}
                  onAdd={() => setCustomerRows([...customerRows, ["", "", ""]])}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════ TAB 4 — Other Details ════════ */}
        <TabsContent value="other" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Substitute & Superseded Numbers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DynamicRows
                  title="Substitute Numbers (Multiple)"
                  columns={["Substitute Number", "Description", "Brand"]}
                  rows={substituteRows}
                  onAdd={() => setSubstituteRows([...substituteRows, ["", "", ""]])}
                />
                <DynamicRows
                  title="Superseded Numbers (Multiple)"
                  columns={["Superseded Number", "Description", "Effective Date"]}
                  rows={supersedeRows}
                  onAdd={() => setSupersedeRows([...supersedeRows, ["", "", ""]])}
                />
              </CardContent>
            </Card>

            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">More Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Country of Origin">
                    <Input placeholder="e.g. Pakistan" className="h-8 text-xs" />
                  </Field>
                  <Field label="Min Order Qty (Sales)">
                    <Input type="number" placeholder="0" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="Min Order Qty (Purchase)">
                    <Input type="number" placeholder="0" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="HS Code">
                    <Input placeholder="8471.30.00" className="h-8 text-xs font-mono" />
                  </Field>
                </div>

                <Separator className="bg-border/30" />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch id="seasonal" />
                    <Label htmlFor="seasonal" className="text-xs">Seasonal Item</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Season Start Date">
                      <Input type="date" className="h-8 text-xs" />
                    </Field>
                    <Field label="Season End Date">
                      <Input type="date" className="h-8 text-xs" />
                    </Field>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════ TAB 5 — Fitment Details ════════ */}
        <TabsContent value="fitment" className="space-y-4">
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Fitment / Compatibility Details</CardTitle>
              <p className="text-xs text-muted-foreground">Define which products, models, or equipment this item is compatible with or usable for.</p>
            </CardHeader>
            <CardContent>
              <DynamicRows
                title="Fitment Records"
                columns={["Compatible Product / Model", "Make", "Year From", "Year To", "Notes"]}
                rows={fitmentRows}
                onAdd={() => setFitmentRows([...fitmentRows, ["", "", "", "", ""]])}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════ TAB 6 — Web Store & POS ════════ */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-primary" />
                  <CardTitle className="text-sm font-semibold">Online Web Store</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/30">
                  <div>
                    <p className="text-xs font-medium text-foreground">Publish to Web Store</p>
                    <p className="text-[11px] text-muted-foreground">Make this product visible on your online store</p>
                  </div>
                  <Switch />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Web Display Name">
                    <Input placeholder="Display name for store" className="h-8 text-xs" />
                  </Field>
                  <Field label="URL Slug">
                    <Input placeholder="product-name" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="Web Category">
                    <Select>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cat1">Electronics</SelectItem>
                        <SelectItem value="cat2">Clothing</SelectItem>
                        <SelectItem value="cat3">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Web Price">
                    <Input type="number" placeholder="0.00" className="h-8 text-xs font-mono" />
                  </Field>
                </div>
                <Field label="Web Description">
                  <Textarea placeholder="Product description for web store..." className="text-xs min-h-[80px]" />
                </Field>
                <div className="flex items-center gap-2">
                  <Checkbox id="featured" />
                  <Label htmlFor="featured" className="text-xs">Featured Product</Label>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Monitor size={16} className="text-primary" />
                  <CardTitle className="text-sm font-semibold">Point of Sale (POS)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/30">
                  <div>
                    <p className="text-xs font-medium text-foreground">Available in POS</p>
                    <p className="text-[11px] text-muted-foreground">Show this product in your POS terminals</p>
                  </div>
                  <Switch />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="POS Display Name">
                    <Input placeholder="Short POS name" className="h-8 text-xs" />
                  </Field>
                  <Field label="POS Category">
                    <Select>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quick">Quick Sale</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="POS Price">
                    <Input type="number" placeholder="0.00" className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="POS Barcode">
                    <Input placeholder="Scan barcode" className="h-8 text-xs font-mono" />
                  </Field>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="pos-weight" />
                    <Label htmlFor="pos-weight" className="text-xs">Weighing Item (Scale)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="pos-discount" />
                    <Label htmlFor="pos-discount" className="text-xs">Allow POS Discount</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="pos-return" />
                    <Label htmlFor="pos-return" className="text-xs">Allow POS Return</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Footer Actions ── */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
        <Button variant="outline" size="sm" className="text-xs">Cancel</Button>
        <Button variant="outline" size="sm" className="text-xs">Save as Draft</Button>
        <Button size="sm" className="text-xs">Save Product</Button>
      </div>
    </div>
  );
};

export default ProductMaster;
