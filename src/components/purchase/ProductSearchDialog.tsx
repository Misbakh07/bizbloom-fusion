import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Package, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { sampleProducts, type Product } from "./purchaseData";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}

const searchFields = ["All Fields", "Product Code", "Description", "Barcode", "Brand", "Category"];

export default function ProductSearchDialog({ open, onClose, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("All Fields");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");

  const categories = useMemo(() => ["All", ...new Set(sampleProducts.map((p) => p.category))], []);
  const brands = useMemo(() => ["All", ...new Set(sampleProducts.map((p) => p.brand))], []);

  const filtered = useMemo(() => {
    return sampleProducts.filter((p) => {
      const s = search.toLowerCase();
      let matchSearch = true;
      if (s) {
        switch (searchField) {
          case "Product Code": matchSearch = p.code.toLowerCase().includes(s); break;
          case "Description": matchSearch = p.description.toLowerCase().includes(s); break;
          case "Barcode": matchSearch = p.barcode.toLowerCase().includes(s); break;
          case "Brand": matchSearch = p.brand.toLowerCase().includes(s); break;
          case "Category": matchSearch = p.category.toLowerCase().includes(s); break;
          default: matchSearch = `${p.code} ${p.description} ${p.barcode} ${p.brand} ${p.category}`.toLowerCase().includes(s);
        }
      }
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      const matchBrand = brandFilter === "All" || p.brand === brandFilter;
      return matchSearch && matchCat && matchBrand;
    });
  }, [search, searchField, categoryFilter, brandFilter]);

  const clearFilters = () => { setSearch(""); setSearchField("All Fields"); setCategoryFilter("All"); setBrandFilter("All"); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5 text-primary" /> Product Search
          </DialogTitle>
        </DialogHeader>

        {/* Search & Filters */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-40 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{searchFields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-9 h-9 text-xs" autoFocus />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
            {(search || categoryFilter !== "All" || brandFilter !== "All") && (
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={clearFilters}><X className="h-3 w-3" />Clear</Button>
            )}
            <span className="text-xs text-muted-foreground ml-auto">{filtered.length} results</span>
          </div>
        </div>

        {/* Results Table */}
        <div className="flex-1 overflow-auto border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="text-xs font-semibold w-24">Code</TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
                <TableHead className="text-xs font-semibold w-20">Unit</TableHead>
                <TableHead className="text-xs font-semibold w-20 text-right">Avail Qty</TableHead>
                <TableHead className="text-xs font-semibold w-20 text-right">Booked</TableHead>
                <TableHead className="text-xs font-semibold w-20 text-right">On Order</TableHead>
                <TableHead className="text-xs font-semibold w-20">Bin</TableHead>
                <TableHead className="text-xs font-semibold w-24 text-right">Last Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow
                  key={p.code}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => { onSelect(p); onClose(); }}
                >
                  <TableCell className="text-xs font-mono text-primary">{p.code}</TableCell>
                  <TableCell className="text-xs">
                    <div>{p.description}</div>
                    <div className="text-[10px] text-muted-foreground">{p.brand} • {p.category}</div>
                  </TableCell>
                  <TableCell className="text-xs">{p.unit}</TableCell>
                  <TableCell className={cn("text-xs text-right font-medium", p.availableQty <= p.reorderLevel ? "text-destructive" : "text-success")}>{p.availableQty}</TableCell>
                  <TableCell className="text-xs text-right text-warning">{p.bookedQty}</TableCell>
                  <TableCell className="text-xs text-right text-primary">{p.onOrderQty}</TableCell>
                  <TableCell className="text-xs">{p.bin}</TableCell>
                  <TableCell className="text-xs text-right">{p.lastCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-xs text-muted-foreground py-8">No products found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
