import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  Boxes, Lock, Truck, PackageCheck, AlertTriangle, TrendingUp, ArrowUpRight, Layers, Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getBatches, getLocationStock, getMovements, getOpenPurchaseDocs, getStockSummary, type Product,
} from "@/data/stockData";

const money = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const KPI = ({ label, value, sub, icon: Icon, tone = "default" }: {
  label: string; value: string; sub?: string; icon: React.ElementType; tone?: "default" | "warning" | "success" | "danger";
}) => (
  <Card className="glass-card border-border/30">
    <CardContent className="p-3 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <Icon size={14} className={cn(
          tone === "warning" && "text-warning",
          tone === "success" && "text-success",
          tone === "danger" && "text-destructive",
          tone === "default" && "text-primary",
        )} />
      </div>
      <p className={cn("text-lg font-bold font-mono",
        tone === "warning" && "text-warning",
        tone === "success" && "text-success",
        tone === "danger" && "text-destructive",
      )}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </CardContent>
  </Card>
);

export default function ProductStockPanel({ product }: { product: Product }) {
  const summary = useMemo(() => getStockSummary(product), [product]);
  const locations = useMemo(() => getLocationStock(product), [product]);
  const batches = useMemo(() => getBatches(product), [product]);
  const movements = useMemo(() => getMovements(product), [product]);
  const openDocs = useMemo(() => getOpenPurchaseDocs(product), [product]);

  const fillPct = Math.min(100, Math.round((summary.onHand / Math.max(product.reorderLevel * 4, 1)) * 100));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPI label="On Hand" value={`${summary.onHand} ${product.unit}`} sub={`Value ${money(summary.stockValue)}`} icon={Boxes} />
        <KPI label="Booked / Reserved" value={`${summary.booked}`} sub="Committed to sales orders" icon={Lock} tone="warning" />
        <KPI label="Free to Sell" value={`${summary.free}`} sub="On hand − booked" icon={PackageCheck} tone={summary.free > 0 ? "success" : "danger"} />
        <KPI label="On Order" value={`${summary.onOrder}`} sub={`${openDocs.length} open purchase docs`} icon={Truck} />
        <KPI label="In Transit" value={`${summary.inTransit}`} sub="Inter-location transfers" icon={ArrowUpRight} />
        <KPI
          label="Projected Available"
          value={`${summary.projected}`}
          sub={`≈ ${summary.coverDays} days cover`}
          icon={TrendingUp}
          tone={summary.belowReorder ? "danger" : "success"}
        />
      </div>

      {/* Reorder status */}
      <Card className="glass-card border-border/30">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {summary.belowReorder ? <AlertTriangle size={15} className="text-destructive" /> : <PackageCheck size={15} className="text-success" />}
              <span className="text-xs font-medium">
                {summary.belowReorder ? "Below re-order level — replenishment required" : "Stock healthy above re-order level"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
              <span>Min {Math.round(product.reorderLevel * 0.5)}</span>
              <span>Re-order {product.reorderLevel}</span>
              <span>Max {product.reorderLevel * 4}</span>
              <span>Avg usage {summary.avgDailyUsage}/day</span>
            </div>
          </div>
          <Progress value={fillPct} className={cn("h-2", summary.belowReorder && "[&>div]:bg-destructive")} />
          <div className="flex gap-2 pt-1">
            <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
              <Link to="/purchase/order">Raise Purchase Order</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
              <Link to="/inventory/forecasting">Forecast & EOQ</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
              <Link to="/reports/inventory-valuation">Valuation Report</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock by location */}
      <Card className="glass-card border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Warehouse size={15} className="text-primary" /> Stock by Location & Bin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border/40 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  {["Location", "Bin", "On Hand", "Booked", "Free", "On Order", "In Transit", "Min", "Re-order", "Max", "Status"].map((h) => (
                    <TableHead key={h} className="text-xs h-8 whitespace-nowrap">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((l) => {
                  const free = l.onHand - l.booked;
                  const low = l.onHand <= l.reorderLevel;
                  return (
                    <TableRow key={l.location}>
                      <TableCell className="text-xs">{l.location}</TableCell>
                      <TableCell className="text-xs font-mono">{l.bin}</TableCell>
                      <TableCell className="text-xs font-mono">{l.onHand}</TableCell>
                      <TableCell className="text-xs font-mono text-warning">{l.booked}</TableCell>
                      <TableCell className={cn("text-xs font-mono", free > 0 ? "text-success" : "text-destructive")}>{free}</TableCell>
                      <TableCell className="text-xs font-mono text-primary">{l.onOrder}</TableCell>
                      <TableCell className="text-xs font-mono">{l.inTransit}</TableCell>
                      <TableCell className="text-xs font-mono">{l.minQty}</TableCell>
                      <TableCell className="text-xs font-mono">{l.reorderLevel}</TableCell>
                      <TableCell className="text-xs font-mono">{l.maxQty}</TableCell>
                      <TableCell>
                        <Badge variant={low ? "destructive" : "secondary"} className="text-[10px]">{low ? "Re-order" : "OK"}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Batches */}
        <Card className="glass-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers size={15} className="text-primary" /> Batch / Lot Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border/40 rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30">
                    {["Batch", "Location", "Qty", "Mfg", "Expiry", "Cost"].map((h) => (
                      <TableHead key={h} className="text-xs h-8">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((b) => (
                    <TableRow key={b.batchNo}>
                      <TableCell className="text-xs font-mono text-primary">{b.batchNo}</TableCell>
                      <TableCell className="text-xs">{b.location}</TableCell>
                      <TableCell className="text-xs font-mono">{b.qty}</TableCell>
                      <TableCell className="text-xs font-mono">{b.mfgDate}</TableCell>
                      <TableCell className="text-xs font-mono">{b.expiryDate}</TableCell>
                      <TableCell className="text-xs font-mono">{money(b.cost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button asChild size="sm" variant="ghost" className="h-7 text-xs mt-2 gap-1">
              <Link to="/inventory/batches">Open Batch Master <ArrowUpRight size={12} /></Link>
            </Button>
          </CardContent>
        </Card>

        {/* Open purchase pipeline */}
        <Card className="glass-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Truck size={15} className="text-primary" /> Open Purchase Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border/40 rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30">
                    {["Doc", "Date", "Supplier", "Qty", "Received", "Rate", "Status"].map((h) => (
                      <TableHead key={h} className="text-xs h-8">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openDocs.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-4">No open purchase documents</TableCell></TableRow>
                  ) : openDocs.map((d) => (
                    <TableRow key={d.docNo}>
                      <TableCell className="text-xs font-mono text-primary">{d.docNo}</TableCell>
                      <TableCell className="text-xs font-mono">{d.date}</TableCell>
                      <TableCell className="text-xs">{d.supplier}</TableCell>
                      <TableCell className="text-xs font-mono">{d.qty}</TableCell>
                      <TableCell className="text-xs font-mono">{d.received}</TableCell>
                      <TableCell className="text-xs font-mono">{money(d.rate)}</TableCell>
                      <TableCell><Badge variant={d.status === "Open" ? "secondary" : "outline"} className="text-[10px]">{d.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movements */}
      <Card className="glass-card border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ArrowUpRight size={15} className="text-primary" /> Stock Ledger / Recent Movements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border/40 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  {["Date", "Document", "Doc No", "Location", "In", "Out", "Rate", "Balance", "Reference"].map((h) => (
                    <TableHead key={h} className="text-xs h-8 whitespace-nowrap">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.docNo}>
                    <TableCell className="text-xs font-mono">{m.date}</TableCell>
                    <TableCell className="text-xs">{m.docType}</TableCell>
                    <TableCell className="text-xs font-mono text-primary">{m.docNo}</TableCell>
                    <TableCell className="text-xs">{m.location}</TableCell>
                    <TableCell className="text-xs font-mono text-success">{m.inQty || "—"}</TableCell>
                    <TableCell className="text-xs font-mono text-destructive">{m.outQty || "—"}</TableCell>
                    <TableCell className="text-xs font-mono">{money(m.rate)}</TableCell>
                    <TableCell className="text-xs font-mono font-semibold">{m.balance}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.reference}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
