import { sampleProducts, type Product } from "@/components/purchase/purchaseData";

export interface LocationStock {
  location: string;
  bin: string;
  onHand: number;
  booked: number;
  onOrder: number;
  inTransit: number;
  minQty: number;
  maxQty: number;
  reorderLevel: number;
  reorderQty: number;
}

export interface BatchStock {
  batchNo: string;
  location: string;
  qty: number;
  mfgDate: string;
  expiryDate: string;
  cost: number;
}

export interface StockMovement {
  date: string;
  docType: "GRN" | "Purchase Invoice" | "Purchase Return" | "Production Receipt" | "Material Issue" | "Transfer" | "Adjustment" | "Sales Delivery";
  docNo: string;
  location: string;
  inQty: number;
  outQty: number;
  rate: number;
  balance: number;
  reference: string;
}

export interface OpenPurchaseDoc {
  docType: "Purchase Order" | "GRN" | "Purchase Invoice";
  docNo: string;
  date: string;
  supplier: string;
  qty: number;
  received: number;
  rate: number;
  status: "Open" | "Partial" | "Closed";
}

const LOCATIONS = ["Central Warehouse", "Abu Dhabi Branch", "Sharjah DC", "Production Floor"];
const SUPPLIERS = ["Al Futtaim Trading", "Gulf Industrial Supplies", "Karachi Steel Co.", "Emirates Tech LLC"];

/** Deterministic pseudo-random from a product code so numbers stay stable across renders. */
const seedOf = (code: string) => code.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
const rnd = (seed: number, i: number, max: number) => ((seed * 9301 + i * 49297) % 233280) / 233280 * max;

/** Stock split across locations, always reconciling to the product master totals. */
export function getLocationStock(product: Product): LocationStock[] {
  const seed = seedOf(product.code);
  const weights = LOCATIONS.map((_, i) => 0.15 + rnd(seed, i + 1, 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let onHandLeft = product.availableQty;
  let bookedLeft = product.bookedQty;
  let orderLeft = product.onOrderQty;

  return LOCATIONS.map((location, i) => {
    const last = i === LOCATIONS.length - 1;
    const share = weights[i] / total;
    const onHand = last ? onHandLeft : Math.round(product.availableQty * share);
    const booked = last ? bookedLeft : Math.round(product.bookedQty * share);
    const onOrder = last ? orderLeft : Math.round(product.onOrderQty * share);
    onHandLeft -= onHand; bookedLeft -= booked; orderLeft -= onOrder;
    return {
      location,
      bin: i === 0 ? product.bin : `${String.fromCharCode(77 + i)}-0${i}-0${i + 1}`,
      onHand: Math.max(onHand, 0),
      booked: Math.max(booked, 0),
      onOrder: Math.max(onOrder, 0),
      inTransit: Math.round(rnd(seed, i + 7, product.reorderLevel * 0.2)),
      minQty: Math.round(product.reorderLevel * 0.5),
      maxQty: product.reorderLevel * 4,
      reorderLevel: product.reorderLevel,
      reorderQty: product.reorderLevel * 2,
    };
  });
}

export function getBatches(product: Product): BatchStock[] {
  const seed = seedOf(product.code);
  return Array.from({ length: 3 }, (_, i) => {
    const qty = Math.round(product.availableQty / (i + 2.5));
    return {
      batchNo: `${product.code.replace("PRD", "BT")}-${2026 - i}${String(i + 3).padStart(2, "0")}`,
      location: LOCATIONS[i % LOCATIONS.length],
      qty: Math.max(qty, 1),
      mfgDate: `2025-${String(3 + i * 2).padStart(2, "0")}-1${i}`,
      expiryDate: `2027-${String(3 + i * 2).padStart(2, "0")}-1${i}`,
      cost: +(product.avgCost * (1 + rnd(seed, i + 3, 0.08) - 0.04)).toFixed(2),
    };
  });
}

export function getMovements(product: Product): StockMovement[] {
  const seed = seedOf(product.code);
  const rows: Omit<StockMovement, "balance">[] = [
    { date: "2026-07-02", docType: "GRN", docNo: "GRN-1042", location: LOCATIONS[0], inQty: Math.round(product.reorderLevel * 1.2) || 10, outQty: 0, rate: product.avgCost, reference: "PO-2201" },
    { date: "2026-07-08", docType: "Purchase Invoice", docNo: "PI-3310", location: LOCATIONS[0], inQty: 0, outQty: 0, rate: product.lastCost, reference: "GRN-1042" },
    { date: "2026-07-11", docType: "Material Issue", docNo: "MI-0781", location: "Production Floor", inQty: 0, outQty: Math.round(rnd(seed, 2, product.reorderLevel * 0.4)) || 3, rate: product.avgCost, reference: "WO-5501 (BOM)" },
    { date: "2026-07-16", docType: "Transfer", docNo: "TRF-0221", location: "Abu Dhabi Branch", inQty: Math.round(rnd(seed, 4, product.reorderLevel * 0.3)) || 2, outQty: 0, rate: product.avgCost, reference: "From Central Warehouse" },
    { date: "2026-07-21", docType: "Sales Delivery", docNo: "DN-4408", location: LOCATIONS[0], inQty: 0, outQty: Math.round(rnd(seed, 5, product.reorderLevel * 0.5)) || 4, rate: product.avgCost * 1.25, reference: "SO-9912" },
    { date: "2026-07-28", docType: "Purchase Return", docNo: "PR-0119", location: LOCATIONS[0], inQty: 0, outQty: Math.round(rnd(seed, 6, product.reorderLevel * 0.1)) || 1, rate: product.lastCost, reference: "GRN-1042" },
    { date: "2026-08-03", docType: "Adjustment", docNo: "ADJ-0057", location: "Sharjah DC", inQty: 0, outQty: 1, rate: product.avgCost, reference: "Cycle count variance" },
  ];
  let bal = Math.max(product.availableQty - rows.reduce((s, r) => s + r.inQty - r.outQty, 0), 0);
  return rows.map((r) => {
    bal += r.inQty - r.outQty;
    return { ...r, balance: bal };
  });
}

export function getOpenPurchaseDocs(product: Product): OpenPurchaseDoc[] {
  const seed = seedOf(product.code);
  if (product.onOrderQty <= 0) return [];
  const half = Math.round(product.onOrderQty / 2);
  return [
    { docType: "Purchase Order", docNo: "PO-2245", date: "2026-07-19", supplier: SUPPLIERS[seed % SUPPLIERS.length], qty: product.onOrderQty - half, received: 0, rate: product.lastCost, status: "Open" },
    { docType: "Purchase Order", docNo: "PO-2260", date: "2026-07-30", supplier: SUPPLIERS[(seed + 1) % SUPPLIERS.length], qty: half, received: Math.round(half / 3), rate: +(product.lastCost * 1.03).toFixed(2), status: "Partial" },
  ];
}

export interface StockSummary {
  onHand: number;
  booked: number;
  onOrder: number;
  inTransit: number;
  free: number;
  projected: number;
  stockValue: number;
  belowReorder: boolean;
  coverDays: number;
  avgDailyUsage: number;
}

export function getStockSummary(product: Product): StockSummary {
  const locs = getLocationStock(product);
  const inTransit = locs.reduce((s, l) => s + l.inTransit, 0);
  const free = product.availableQty - product.bookedQty;
  const avgDailyUsage = Math.max(+(product.reorderLevel / 15).toFixed(2), 0.1);
  return {
    onHand: product.availableQty,
    booked: product.bookedQty,
    onOrder: product.onOrderQty,
    inTransit,
    free,
    projected: free + product.onOrderQty + inTransit,
    stockValue: +(product.availableQty * product.avgCost).toFixed(2),
    belowReorder: product.availableQty <= product.reorderLevel,
    coverDays: Math.round(free / avgDailyUsage),
    avgDailyUsage,
  };
}

export const allProducts = sampleProducts;
export type { Product };
