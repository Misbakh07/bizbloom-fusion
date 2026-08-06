import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { GitBranch, Factory, AlertTriangle, ArrowUpRight, Boxes, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { initialBoms, bomCost, money, type Bom } from "@/data/bomData";
import { sampleProducts, type Product } from "@/components/purchase/purchaseData";
import { getStockSummary } from "@/data/stockData";

const statusTone: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default", pending: "outline", draft: "secondary", obsolete: "destructive",
};

export default function ProductBomPanel({ product }: { product: Product }) {
  const bomsByCode = useMemo(
    () => Object.fromEntries(initialBoms.map((b) => [b.code, b])) as Record<string, Bom>,
    [],
  );
  const ownBoms = useMemo(() => initialBoms.filter((b) => b.productCode === product.code), [product]);
  const whereUsed = useMemo(
    () => initialBoms.filter((b) => b.components.some((c) => c.productCode === product.code)),
    [product],
  );
  const defaultBom = ownBoms.find((b) => b.isDefault && b.status === "approved") ?? ownBoms[0];
  const cost = defaultBom ? bomCost(defaultBom, bomsByCode) : null;

  const buildable = useMemo(() => {
    if (!defaultBom) return null;
    const limits = defaultBom.components
      .filter((c) => !c.optional && !c.isSubAssembly)
      .map((c) => {
        const p = sampleProducts.find((sp) => sp.code === c.productCode);
        const need = c.qtyPer * (1 + c.scrapPercent / 100);
        const avail = p ? p.availableQty - p.bookedQty : 0;
        return { code: c.productCode, description: c.description, need, avail, uom: c.uom, canMake: need > 0 ? Math.floor(avail / need) : 0 };
      });
    return { limits, maxQty: limits.length ? Math.min(...limits.map((l) => l.canMake)) : 0 };
  }, [defaultBom]);

  const stock = getStockSummary(product);

  return (
    <div className="space-y-4">
      {/* Config summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card border-border/30"><CardContent className="p-3">
          <p className="text-[11px] text-muted-foreground">BOMs for this product</p>
          <p className="text-lg font-bold font-mono">{ownBoms.length}</p>
        </CardContent></Card>
        <Card className="glass-card border-border/30"><CardContent className="p-3">
          <p className="text-[11px] text-muted-foreground">Used as component in</p>
          <p className="text-lg font-bold font-mono">{whereUsed.length} BOMs</p>
        </CardContent></Card>
        <Card className="glass-card border-border/30"><CardContent className="p-3">
          <p className="text-[11px] text-muted-foreground">Rolled-up BOM cost</p>
          <p className="text-lg font-bold font-mono text-primary">{cost ? money(cost.unitTotal) : "—"}</p>
        </CardContent></Card>
        <Card className="glass-card border-border/30"><CardContent className="p-3">
          <p className="text-[11px] text-muted-foreground">Buildable from free stock</p>
          <p className={cn("text-lg font-bold font-mono", buildable && buildable.maxQty === 0 ? "text-destructive" : "text-success")}>
            {buildable ? `${buildable.maxQty} ${product.unit}` : "—"}
          </p>
        </CardContent></Card>
      </div>

      {/* Cost variance vs product master cost */}
      {cost && (
        <Card className="glass-card border-border/30">
          <CardContent className="p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <span className="flex items-center gap-1.5 font-medium"><DollarSign size={14} className="text-primary" /> Cost roll-up ({defaultBom!.code} {defaultBom!.version})</span>
            <span className="font-mono">Material {money(cost.material)}</span>
            <span className="font-mono">Labour {money(cost.labour)}</span>
            <span className="font-mono">Overhead {money(cost.overhead)}</span>
            <span className="font-mono font-semibold text-primary">Unit {money(cost.unitTotal)}</span>
            <span className="font-mono text-muted-foreground">Master avg cost {money(product.avgCost)}</span>
            <Badge variant={cost.unitTotal > product.avgCost ? "destructive" : "secondary"} className="text-[10px]">
              Variance {money(cost.unitTotal - product.avgCost)} ({(((cost.unitTotal - product.avgCost) / Math.max(product.avgCost, 1)) * 100).toFixed(1)}%)
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Own BOMs */}
      <Card className="glass-card border-border/30">
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Factory size={15} className="text-primary" /> Bill of Materials (this product as parent)
          </CardTitle>
          <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
            <Link to="/inventory/bom">Open BOM Master <ArrowUpRight size={12} /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border border-border/40 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  {["BOM Code", "Ver", "Type", "Status", "Batch", "Yield %", "Components", "Ops", "Unit Cost", "Default"].map((h) => (
                    <TableHead key={h} className="text-xs h-8 whitespace-nowrap">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ownBoms.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center text-xs text-muted-foreground py-4">
                    No BOM configured. This product is treated as purchased / non-manufactured.
                  </TableCell></TableRow>
                ) : ownBoms.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="text-xs font-mono text-primary">{b.code}</TableCell>
                    <TableCell className="text-xs font-mono">{b.version}</TableCell>
                    <TableCell className="text-xs capitalize">{b.type}</TableCell>
                    <TableCell><Badge variant={statusTone[b.status]} className="text-[10px] capitalize">{b.status}</Badge></TableCell>
                    <TableCell className="text-xs font-mono">{b.batchSize}</TableCell>
                    <TableCell className="text-xs font-mono">{b.yieldPercent}</TableCell>
                    <TableCell className="text-xs font-mono">{b.components.length}</TableCell>
                    <TableCell className="text-xs font-mono">{b.operations.length}</TableCell>
                    <TableCell className="text-xs font-mono">{money(bomCost(b, bomsByCode).unitTotal)}</TableCell>
                    <TableCell className="text-xs">{b.isDefault ? "Yes" : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Component availability */}
      {buildable && defaultBom && (
        <Card className="glass-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Boxes size={15} className="text-primary" /> Component Availability ({defaultBom.code})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border/40 rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30">
                    {["Component", "Description", "Qty / Unit (incl. scrap)", "Free Stock", "Can Build", "Shortage"].map((h) => (
                      <TableHead key={h} className="text-xs h-8 whitespace-nowrap">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildable.limits.map((l) => (
                    <TableRow key={l.code}>
                      <TableCell className="text-xs font-mono text-primary">{l.code}</TableCell>
                      <TableCell className="text-xs">{l.description}</TableCell>
                      <TableCell className="text-xs font-mono">{l.need.toFixed(2)} {l.uom}</TableCell>
                      <TableCell className="text-xs font-mono">{l.avail}</TableCell>
                      <TableCell className={cn("text-xs font-mono", l.canMake === buildable.maxQty ? "text-warning font-semibold" : "")}>{l.canMake}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {l.avail <= 0 ? <span className="text-destructive flex items-center gap-1"><AlertTriangle size={11} /> Out of stock</span> : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Constraint component limits production to {buildable.maxQty} {product.unit}. Current free stock of this product: {stock.free} {product.unit}.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Where used */}
      <Card className="glass-card border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GitBranch size={15} className="text-primary" /> Where Used (this product as component)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border/40 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  {["Parent BOM", "Parent Product", "Type", "Status", "Qty Per", "Scrap %", "Issue Method", "Operation"].map((h) => (
                    <TableHead key={h} className="text-xs h-8 whitespace-nowrap">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {whereUsed.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-xs text-muted-foreground py-4">Not used in any BOM</TableCell></TableRow>
                ) : whereUsed.map((b) => {
                  const c = b.components.find((x) => x.productCode === product.code)!;
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="text-xs font-mono text-primary">{b.code}</TableCell>
                      <TableCell className="text-xs">{b.productName}</TableCell>
                      <TableCell className="text-xs capitalize">{b.type}</TableCell>
                      <TableCell><Badge variant={statusTone[b.status]} className="text-[10px] capitalize">{b.status}</Badge></TableCell>
                      <TableCell className="text-xs font-mono">{c.qtyPer} {c.uom}</TableCell>
                      <TableCell className="text-xs font-mono">{c.scrapPercent}</TableCell>
                      <TableCell className="text-xs capitalize">{c.issueMethod}</TableCell>
                      <TableCell className="text-xs font-mono">{c.operationSeq || "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
