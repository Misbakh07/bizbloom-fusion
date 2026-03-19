import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Trash2, Upload, Columns3, Package, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import ProductSearchDialog from "./ProductSearchDialog";
import AdditionalAmountsDialog from "./AdditionalAmountsDialog";
import {
  type LineItem, type Product, type AdditionalCharge,
  binOptions, extraColumnOptions, createEmptyLineItem, sampleProducts
} from "./purchaseData";

interface Props {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  additionalCharges: AdditionalCharge[];
  onAdditionalChargesChange: (charges: AdditionalCharge[]) => void;
  currency: string;
  location: string;
}

export default function ItemEntryGrid({ items, onChange, additionalCharges, onAdditionalChargesChange, currency, location }: Props) {
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [additionalAmountsOpen, setAdditionalAmountsOpen] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [extraColumns, setExtraColumns] = useState<string[]>([]);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const addRow = () => onChange([...items, createEmptyLineItem(location)]);

  const removeRow = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next.length === 0 ? [createEmptyLineItem(location)] : next);
  };

  const updateRow = useCallback((index: number, field: string, value: string | number) => {
    const next = [...items];
    const row = { ...next[index], [field]: value };
    // recalculate
    row.localAmount = row.qty * row.foreignRate;
    row.vatAmount = (row.localAmount * row.vatPercent) / 100;
    row.netAmount = row.localAmount + row.vatAmount + row.additionalAmount;
    next[index] = row;
    onChange(next);
  }, [items, onChange]);

  const handleProductSelect = (product: Product) => {
    if (activeRowIndex === null) return;
    const next = [...items];
    const row = { ...next[activeRowIndex] };
    row.productCode = product.code;
    row.productDescription = product.description;
    row.unit = product.unit;
    row.foreignRate = product.lastCost;
    row.bin = product.bin;
    row.vatPercent = product.vatPercent;
    row.availableQty = product.availableQty;
    row.bookedQty = product.bookedQty;
    row.onOrderQty = product.onOrderQty;
    row.lastCost = product.lastCost;
    row.localAmount = row.qty * row.foreignRate;
    row.vatAmount = (row.localAmount * row.vatPercent) / 100;
    row.netAmount = row.localAmount + row.vatAmount + row.additionalAmount;
    next[activeRowIndex] = row;
    onChange(next);
  };

  const handleQuickSearch = (index: number, value: string) => {
    updateRow(index, "productCode", value);
    const match = sampleProducts.find((p) =>
      p.code.toLowerCase() === value.toLowerCase() || p.barcode === value
    );
    if (match) handleProductSelectForRow(index, match);
  };

  const handleProductSelectForRow = (index: number, product: Product) => {
    const next = [...items];
    const row = { ...next[index] };
    row.productCode = product.code;
    row.productDescription = product.description;
    row.unit = product.unit;
    row.foreignRate = product.lastCost;
    row.bin = product.bin;
    row.vatPercent = product.vatPercent;
    row.availableQty = product.availableQty;
    row.bookedQty = product.bookedQty;
    row.onOrderQty = product.onOrderQty;
    row.lastCost = product.lastCost;
    row.localAmount = row.qty * row.foreignRate;
    row.vatAmount = (row.localAmount * row.vatPercent) / 100;
    row.netAmount = row.localAmount + row.vatAmount + row.additionalAmount;
    next[index] = row;
    onChange(next);
  };

  const handleExcelUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = () => {
      // Mock: add sample rows
      const newItems = sampleProducts.slice(0, 3).map((p) => {
        const item = createEmptyLineItem(location);
        item.productCode = p.code;
        item.productDescription = p.description;
        item.unit = p.unit;
        item.qty = Math.floor(Math.random() * 50) + 5;
        item.foreignRate = p.lastCost;
        item.bin = p.bin;
        item.vatPercent = p.vatPercent;
        item.localAmount = item.qty * item.foreignRate;
        item.vatAmount = (item.localAmount * item.vatPercent) / 100;
        item.netAmount = item.localAmount + item.vatAmount;
        item.availableQty = p.availableQty;
        item.bookedQty = p.bookedQty;
        item.onOrderQty = p.onOrderQty;
        item.lastCost = p.lastCost;
        return item;
      });
      onChange([...items.filter((i) => i.productCode), ...newItems]);
    };
    input.click();
  };

  const toggleColumn = (key: string) => {
    setExtraColumns((prev) => prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]);
  };

  const totals = items.reduce((acc, item) => ({
    localAmount: acc.localAmount + item.localAmount,
    vatAmount: acc.vatAmount + item.vatAmount,
    additionalAmount: acc.additionalAmount + item.additionalAmount,
    netAmount: acc.netAmount + item.netAmount,
  }), { localAmount: 0, vatAmount: 0, additionalAmount: 0, netAmount: 0 });

  const grandTotal = totals.netAmount + additionalCharges.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={addRow}>
          <Plus className="h-3.5 w-3.5" /> Add Row
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleExcelUpload}>
          <Upload className="h-3.5 w-3.5" /> Upload Excel
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setAdditionalAmountsOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Additional Amounts
        </Button>

        {/* Column Customizer */}
        <Popover open={columnsOpen} onOpenChange={setColumnsOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 ml-auto">
              <Columns3 className="h-3.5 w-3.5" /> Columns
              {extraColumns.length > 0 && <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1">{extraColumns.length}</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="end">
            <p className="text-xs font-semibold mb-2 text-foreground">Extra Columns</p>
            <div className="space-y-1 max-h-60 overflow-auto">
              {extraColumnOptions.map((col) => (
                <label key={col.key} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-secondary/50 cursor-pointer text-xs">
                  <Checkbox checked={extraColumns.includes(col.key)} onCheckedChange={() => toggleColumn(col.key)} />
                  {col.label}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Items Table */}
      <div className="border border-border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="text-[11px] font-semibold w-8 text-center">#</TableHead>
              <TableHead className="text-[11px] font-semibold w-20">Location</TableHead>
              <TableHead className="text-[11px] font-semibold w-28">Product Code</TableHead>
              <TableHead className="text-[11px] font-semibold min-w-[180px]">Description</TableHead>
              <TableHead className="text-[11px] font-semibold w-16">Unit</TableHead>
              <TableHead className="text-[11px] font-semibold w-16 text-right">Qty</TableHead>
              <TableHead className="text-[11px] font-semibold w-24 text-right">{currency} Rate</TableHead>
              <TableHead className="text-[11px] font-semibold w-24 text-right">Amount</TableHead>
              <TableHead className="text-[11px] font-semibold w-20">Bin No.</TableHead>
              <TableHead className="text-[11px] font-semibold w-16 text-right">VAT%</TableHead>
              <TableHead className="text-[11px] font-semibold w-20 text-right">VAT Amt</TableHead>
              <TableHead className="text-[11px] font-semibold w-20 text-right">Add. Amt</TableHead>
              {extraColumns.map((key) => {
                const col = extraColumnOptions.find((c) => c.key === key);
                return <TableHead key={key} className="text-[11px] font-semibold w-24">{col?.label || key}</TableHead>;
              })}
              <TableHead className="text-[11px] font-semibold w-24 text-right">Net Amount</TableHead>
              <TableHead className="text-[11px] font-semibold w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow
                key={item.id}
                className="group"
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <TableCell className="text-[11px] text-center text-muted-foreground">{idx + 1}</TableCell>
                <TableCell className="p-1">
                  <Select value={item.location} onValueChange={(v) => updateRow(idx, "location", v)}>
                    <SelectTrigger className="h-7 text-[11px] border-0 bg-transparent"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Warehouse A", "Warehouse B", "Store 1", "Store 2"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-1">
                  <div className="flex gap-0.5">
                    <Input
                      value={item.productCode}
                      onChange={(e) => handleQuickSearch(idx, e.target.value)}
                      className="h-7 text-[11px] border-0 bg-transparent font-mono px-1"
                      placeholder="Type code..."
                    />
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setActiveRowIndex(idx); setProductSearchOpen(true); }}>
                      <Search className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="p-1 relative">
                  <Input value={item.productDescription} onChange={(e) => updateRow(idx, "productDescription", e.target.value)} className="h-7 text-[11px] border-0 bg-transparent px-1" />
                  {/* Stock Info Tooltip */}
                  {item.productCode && hoveredRow === idx && (
                    <div className="absolute left-0 top-full z-20 mt-0.5 bg-card border border-border rounded-md p-2 shadow-lg min-w-[200px]">
                      <div className="text-[10px] space-y-0.5">
                        <div className="flex justify-between"><span className="text-muted-foreground">Available:</span><span className={cn("font-medium", item.availableQty <= 10 ? "text-destructive" : "text-success")}>{item.availableQty}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Booked (SO):</span><span className="text-warning font-medium">{item.bookedQty}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">On Order (PO):</span><span className="text-primary font-medium">{item.onOrderQty}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Bin:</span><span>{item.bin}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Last Cost:</span><span>{item.lastCost.toFixed(2)}</span></div>
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-[11px] text-center">{item.unit}</TableCell>
                <TableCell className="p-1">
                  <Input type="number" value={item.qty || ""} onChange={(e) => updateRow(idx, "qty", parseFloat(e.target.value) || 0)} className="h-7 text-[11px] border-0 bg-transparent text-right px-1" />
                </TableCell>
                <TableCell className="p-1">
                  <Input type="number" value={item.foreignRate || ""} onChange={(e) => updateRow(idx, "foreignRate", parseFloat(e.target.value) || 0)} className="h-7 text-[11px] border-0 bg-transparent text-right px-1" />
                </TableCell>
                <TableCell className="text-[11px] text-right font-medium">{item.localAmount.toFixed(2)}</TableCell>
                <TableCell className="p-1">
                  <Select value={item.bin} onValueChange={(v) => updateRow(idx, "bin", v)}>
                    <SelectTrigger className="h-7 text-[11px] border-0 bg-transparent"><SelectValue placeholder="Bin" /></SelectTrigger>
                    <SelectContent>
                      {binOptions.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-1">
                  <Input type="number" value={item.vatPercent || ""} onChange={(e) => updateRow(idx, "vatPercent", parseFloat(e.target.value) || 0)} className="h-7 text-[11px] border-0 bg-transparent text-right px-1" />
                </TableCell>
                <TableCell className="text-[11px] text-right">{item.vatAmount.toFixed(2)}</TableCell>
                <TableCell className="p-1">
                  <Input type="number" value={item.additionalAmount || ""} onChange={(e) => updateRow(idx, "additionalAmount", parseFloat(e.target.value) || 0)} className="h-7 text-[11px] border-0 bg-transparent text-right px-1" />
                </TableCell>
                {extraColumns.map((key) => (
                  <TableCell key={key} className="p-1">
                    <Input value={String(item[key] || "")} onChange={(e) => updateRow(idx, key, e.target.value)} className="h-7 text-[11px] border-0 bg-transparent px-1" />
                  </TableCell>
                ))}
                <TableCell className="text-[11px] text-right font-semibold text-primary">{item.netAmount.toFixed(2)}</TableCell>
                <TableCell className="p-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100" onClick={() => removeRow(idx)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80 space-y-1.5 border border-border rounded-lg p-3 bg-secondary/20">
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Subtotal:</span><span>{totals.localAmount.toFixed(2)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">VAT/Tax:</span><span>{totals.vatAmount.toFixed(2)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Line Additional:</span><span>{totals.additionalAmount.toFixed(2)}</span></div>
          {additionalCharges.filter((c) => c.amount > 0).map((charge) => (
            <div key={charge.id} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{charge.name}:</span>
              <span>{charge.amount.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-1.5 flex justify-between text-sm font-semibold">
            <span>Grand Total ({currency}):</span>
            <span className="text-primary">{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <ProductSearchDialog open={productSearchOpen} onClose={() => setProductSearchOpen(false)} onSelect={handleProductSelect} />
      <AdditionalAmountsDialog open={additionalAmountsOpen} onClose={() => setAdditionalAmountsOpen(false)} charges={additionalCharges} onChange={onAdditionalChargesChange} subtotal={totals.localAmount} />
    </div>
  );
}
