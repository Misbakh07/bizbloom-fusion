export interface Product {
  code: string;
  description: string;
  unit: string;
  barcode: string;
  brand: string;
  category: string;
  availableQty: number;
  bookedQty: number;
  onOrderQty: number;
  bin: string;
  lastCost: number;
  avgCost: number;
  reorderLevel: number;
  vatPercent: number;
}

export const sampleProducts: Product[] = [
  { code: "PRD-001", description: "Hydraulic Cylinder 50mm Bore", unit: "PCS", barcode: "6291041500001", brand: "Parker", category: "Hydraulics", availableQty: 45, bookedQty: 12, onOrderQty: 25, bin: "A-01-01", lastCost: 320.00, avgCost: 315.50, reorderLevel: 20, vatPercent: 5 },
  { code: "PRD-002", description: "Steel Pipe Grade B 2 inch", unit: "MTR", barcode: "6291041500002", brand: "ArcelorMittal", category: "Steel", availableQty: 280, bookedQty: 50, onOrderQty: 100, bin: "B-02-03", lastCost: 45.75, avgCost: 44.20, reorderLevel: 100, vatPercent: 5 },
  { code: "PRD-003", description: "Ball Bearing 6205-2RS", unit: "PCS", barcode: "6291041500003", brand: "SKF", category: "Bearings", availableQty: 150, bookedQty: 30, onOrderQty: 0, bin: "C-01-02", lastCost: 12.50, avgCost: 11.80, reorderLevel: 50, vatPercent: 5 },
  { code: "PRD-004", description: "Electric Motor 5HP 3-Phase", unit: "PCS", barcode: "6291041500004", brand: "ABB", category: "Motors", availableQty: 8, bookedQty: 3, onOrderQty: 10, bin: "D-01-01", lastCost: 1250.00, avgCost: 1180.00, reorderLevel: 5, vatPercent: 5 },
  { code: "PRD-005", description: "Welding Rod E7018 3.2mm", unit: "KG", barcode: "6291041500005", brand: "ESAB", category: "Welding", availableQty: 500, bookedQty: 0, onOrderQty: 200, bin: "E-03-01", lastCost: 8.50, avgCost: 8.20, reorderLevel: 200, vatPercent: 5 },
  { code: "PRD-006", description: "PVC Pipe 4 inch Schedule 40", unit: "MTR", barcode: "6291041500006", brand: "Astral", category: "Plumbing", availableQty: 120, bookedQty: 25, onOrderQty: 0, bin: "F-01-02", lastCost: 18.90, avgCost: 17.50, reorderLevel: 50, vatPercent: 5 },
  { code: "PRD-007", description: "Safety Helmet Yellow CE", unit: "PCS", barcode: "6291041500007", brand: "3M", category: "Safety", availableQty: 200, bookedQty: 0, onOrderQty: 50, bin: "G-02-01", lastCost: 22.00, avgCost: 21.50, reorderLevel: 30, vatPercent: 5 },
  { code: "PRD-008", description: "Copper Cable 4 sq mm", unit: "MTR", barcode: "6291041500008", brand: "Ducab", category: "Electrical", availableQty: 1500, bookedQty: 200, onOrderQty: 500, bin: "H-01-03", lastCost: 6.75, avgCost: 6.50, reorderLevel: 500, vatPercent: 5 },
  { code: "PRD-009", description: "Air Compressor 10HP Screw", unit: "PCS", barcode: "6291041500009", brand: "Atlas Copco", category: "Compressors", availableQty: 3, bookedQty: 1, onOrderQty: 2, bin: "I-01-01", lastCost: 8500.00, avgCost: 8200.00, reorderLevel: 2, vatPercent: 5 },
  { code: "PRD-010", description: "Stainless Steel Sheet 304 2mm", unit: "SHT", barcode: "6291041500010", brand: "POSCO", category: "Steel", availableQty: 35, bookedQty: 10, onOrderQty: 20, bin: "B-03-01", lastCost: 450.00, avgCost: 430.00, reorderLevel: 15, vatPercent: 5 },
  { code: "PRD-011", description: "Lubricant Oil SAE 40 20L", unit: "DRM", barcode: "6291041500011", brand: "Shell", category: "Lubricants", availableQty: 25, bookedQty: 5, onOrderQty: 10, bin: "J-01-02", lastCost: 185.00, avgCost: 178.00, reorderLevel: 10, vatPercent: 5 },
  { code: "PRD-012", description: "Paint Epoxy White 20L", unit: "TIN", barcode: "6291041500012", brand: "Jotun", category: "Paints", availableQty: 40, bookedQty: 8, onOrderQty: 15, bin: "K-02-01", lastCost: 320.00, avgCost: 310.00, reorderLevel: 15, vatPercent: 5 },
];

export const binOptions = [
  "A-01-01", "A-01-02", "A-02-01", "B-01-01", "B-02-03", "B-03-01",
  "C-01-01", "C-01-02", "D-01-01", "E-03-01", "F-01-02", "G-02-01",
  "H-01-03", "I-01-01", "J-01-02", "K-02-01", "L-01-01", "L-02-01",
];

export interface LineItem {
  id: string;
  location: string;
  productCode: string;
  productDescription: string;
  unit: string;
  qty: number;
  foreignRate: number;
  localAmount: number;
  bin: string;
  vatPercent: number;
  vatAmount: number;
  additionalAmount: number;
  netAmount: number;
  // stock info
  availableQty: number;
  bookedQty: number;
  onOrderQty: number;
  lastCost: number;
  // extra columns
  [key: string]: string | number | boolean;
}

export interface AdditionalCharge {
  id: string;
  name: string;
  type: "fixed" | "percentage";
  value: number;
  amount: number;
  taxable: boolean;
}

export const additionalChargesMaster = [
  { name: "Freight Charges", type: "fixed" as const },
  { name: "Insurance", type: "percentage" as const },
  { name: "Customs Duty", type: "percentage" as const },
  { name: "Handling Charges", type: "fixed" as const },
  { name: "Packing Charges", type: "fixed" as const },
  { name: "Loading/Unloading", type: "fixed" as const },
  { name: "Transportation", type: "fixed" as const },
  { name: "Inspection Fees", type: "fixed" as const },
  { name: "Documentation Charges", type: "fixed" as const },
  { name: "Commission", type: "percentage" as const },
];

export const extraColumnOptions = [
  { key: "barcode", label: "Barcode" },
  { key: "brand", label: "Brand" },
  { key: "category", label: "Category" },
  { key: "weight", label: "Weight" },
  { key: "dimension", label: "Dimensions" },
  { key: "color", label: "Color" },
  { key: "size", label: "Size" },
  { key: "serialNo", label: "Serial Number" },
  { key: "batchNo", label: "Batch Number" },
  { key: "expiryDate", label: "Expiry Date" },
  { key: "manufacturer", label: "Manufacturer" },
  { key: "origin", label: "Country of Origin" },
  { key: "hsCode", label: "HS Code" },
  { key: "discount", label: "Discount %" },
  { key: "discountAmount", label: "Discount Amount" },
  { key: "remarks", label: "Line Remarks" },
  { key: "costCenter", label: "Cost Center" },
  { key: "project", label: "Project" },
];

export function createEmptyLineItem(location: string): LineItem {
  return {
    id: crypto.randomUUID(),
    location,
    productCode: "",
    productDescription: "",
    unit: "",
    qty: 0,
    foreignRate: 0,
    localAmount: 0,
    bin: "",
    vatPercent: 5,
    vatAmount: 0,
    additionalAmount: 0,
    netAmount: 0,
    availableQty: 0,
    bookedQty: 0,
    onOrderQty: 0,
    lastCost: 0,
  };
}
