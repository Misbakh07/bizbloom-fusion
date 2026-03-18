import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Package, ShoppingCart, Truck, MapPin } from "lucide-react";

const productInfo: Record<string, {
  bookedQty: number;
  onOrderQty: number;
  availableQty: number;
  binNumber: string;
  lastPurchaseDate: string;
  lastPurchaseCost: number;
  avgCost: number;
  minStock: number;
  maxStock: number;
}> = {
  "PRD-001": {
    bookedQty: 25, onOrderQty: 50, availableQty: 120,
    binNumber: "A-01-03", lastPurchaseDate: "2026-02-15",
    lastPurchaseCost: 45.00, avgCost: 43.50, minStock: 20, maxStock: 200,
  },
  "PRD-002": {
    bookedQty: 10, onOrderQty: 20, availableQty: 35,
    binNumber: "B-02-01", lastPurchaseDate: "2026-03-01",
    lastPurchaseCost: 120.00, avgCost: 118.00, minStock: 10, maxStock: 100,
  },
  "PRD-003": {
    bookedQty: 100, onOrderQty: 200, availableQty: 450,
    binNumber: "C-05-12", lastPurchaseDate: "2026-02-28",
    lastPurchaseCost: 3.50, avgCost: 3.25, minStock: 100, maxStock: 1000,
  },
  "PRD-004": {
    bookedQty: 5, onOrderQty: 10, availableQty: 18,
    binNumber: "D-01-02", lastPurchaseDate: "2026-01-20",
    lastPurchaseCost: 85.00, avgCost: 82.00, minStock: 5, maxStock: 50,
  },
  "PRD-005": {
    bookedQty: 30, onOrderQty: 40, availableQty: 75,
    binNumber: "A-03-08", lastPurchaseDate: "2026-03-10",
    lastPurchaseCost: 28.00, avgCost: 27.00, minStock: 15, maxStock: 150,
  },
};

const ProductInfoPopover: React.FC<{ productCode: string }> = ({ productCode }) => {
  const info = productInfo[productCode];

  if (!info) return null;

  const stockStatus =
    info.availableQty <= info.minStock
      ? "critical"
      : info.availableQty <= info.minStock * 1.5
      ? "low"
      : "ok";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Info className="h-3.5 w-3.5 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{productCode}</span>
            <Badge
              variant={stockStatus === "ok" ? "default" : "destructive"}
              className="text-[10px] h-5"
            >
              {stockStatus === "ok" ? "In Stock" : stockStatus === "low" ? "Low Stock" : "Critical"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-secondary/50 p-2">
              <div className="flex items-center gap-1 mb-1">
                <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Booked (SO)</span>
              </div>
              <span className="text-sm font-bold">{info.bookedQty}</span>
            </div>
            <div className="rounded-md bg-secondary/50 p-2">
              <div className="flex items-center gap-1 mb-1">
                <Truck className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">On Order (PO)</span>
              </div>
              <span className="text-sm font-bold">{info.onOrderQty}</span>
            </div>
            <div className="rounded-md bg-secondary/50 p-2">
              <div className="flex items-center gap-1 mb-1">
                <Package className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Available</span>
              </div>
              <span className="text-sm font-bold text-accent">{info.availableQty}</span>
            </div>
            <div className="rounded-md bg-secondary/50 p-2">
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Bin</span>
              </div>
              <span className="text-sm font-bold font-mono">{info.binNumber}</span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Purchase</span>
              <span>{info.lastPurchaseDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Cost</span>
              <span className="font-medium">{info.lastPurchaseCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Cost</span>
              <span className="font-medium">{info.avgCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min / Max</span>
              <span>{info.minStock} / {info.maxStock}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProductInfoPopover;
