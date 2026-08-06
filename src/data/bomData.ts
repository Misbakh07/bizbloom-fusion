// ─── Types ───
type BomStatus = "draft" | "pending" | "approved" | "obsolete";
type BomType = "manufacturing" | "assembly" | "kit" | "phantom" | "subcontract";
type CostMethod = "last" | "average" | "standard";

interface BomComponent {
  id: string;
  productCode: string;
  description: string;
  uom: string;
  qtyPer: number;
  scrapPercent: number;
  unitCost: number;
  issueMethod: "backflush" | "manual" | "subcontract";
  location: string;
  operationSeq: number;
  isSubAssembly: boolean;
  subBomCode?: string;
  optional: boolean;
  notes: string;
}

interface BomOperation {
  id: string;
  seq: number;
  name: string;
  workCenter: string;
  setupMins: number;
  runMinsPerUnit: number;
  ratePerHour: number;
  outsourced: boolean;
}

interface Bom {
  id: string;
  code: string;
  version: string;
  productCode: string;
  productName: string;
  uom: string;
  type: BomType;
  status: BomStatus;
  batchSize: number;
  yieldPercent: number;
  costMethod: CostMethod;
  overheadPercent: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string;
  revisionNo: number;
  isDefault: boolean;
  allowSubstitutes: boolean;
  autoConsumeOnProduction: boolean;
  createSalesKit: boolean;
  routingRequired: boolean;
  location: string;
  createdBy: string;
  approvedBy: string;
  notes: string;
  components: BomComponent[];
  operations: BomOperation[];
}

const workCenters = ["Machining Cell A", "Welding Bay", "Assembly Line 1", "Paint Booth", "QC Station", "Packing"];
const locations = ["Central Warehouse", "Abu Dhabi Branch", "Sharjah DC", "Production Floor"];

const uid = () => Math.random().toString(36).slice(2, 10);

const initialBoms: Bom[] = [
  {
    id: "1", code: "BOM-1001", version: "v2.1", productCode: "PRD-009", productName: "Air Compressor 10HP Screw",
    uom: "PCS", type: "manufacturing", status: "approved", batchSize: 1, yieldPercent: 97, costMethod: "average",
    overheadPercent: 8, currency: "AED", effectiveFrom: "2026-01-01", effectiveTo: "", revisionNo: 3,
    isDefault: true, allowSubstitutes: true, autoConsumeOnProduction: true, createSalesKit: false,
    routingRequired: true, location: "Production Floor", createdBy: "R. Kumar", approvedBy: "M. Al Hashimi",
    notes: "Master BOM for 10HP screw compressor assembly line.",
    components: [
      { id: uid(), productCode: "PRD-004", description: "Electric Motor 5HP 3-Phase", uom: "PCS", qtyPer: 2, scrapPercent: 0, unitCost: 1180, issueMethod: "backflush", location: "Production Floor", operationSeq: 20, isSubAssembly: false, optional: false, notes: "" },
      { id: uid(), productCode: "PRD-001", description: "Hydraulic Cylinder 50mm Bore", uom: "PCS", qtyPer: 1, scrapPercent: 2, unitCost: 315.5, issueMethod: "backflush", location: "Production Floor", operationSeq: 20, isSubAssembly: false, optional: false, notes: "" },
      { id: uid(), productCode: "PRD-003", description: "Ball Bearing 6205-2RS", uom: "PCS", qtyPer: 6, scrapPercent: 3, unitCost: 11.8, issueMethod: "backflush", location: "Central Warehouse", operationSeq: 10, isSubAssembly: false, optional: false, notes: "" },
      { id: uid(), productCode: "PRD-008", description: "Copper Cable 4 sq mm", uom: "MTR", qtyPer: 12, scrapPercent: 5, unitCost: 6.5, issueMethod: "manual", location: "Central Warehouse", operationSeq: 30, isSubAssembly: false, optional: false, notes: "" },
      { id: uid(), productCode: "BOM-1002", description: "Frame Sub-Assembly", uom: "PCS", qtyPer: 1, scrapPercent: 0, unitCost: 0, issueMethod: "backflush", location: "Production Floor", operationSeq: 10, isSubAssembly: true, subBomCode: "BOM-1002", optional: false, notes: "Nested BOM" },
    ],
    operations: [
      { id: uid(), seq: 10, name: "Frame Preparation", workCenter: "Welding Bay", setupMins: 45, runMinsPerUnit: 120, ratePerHour: 85, outsourced: false },
      { id: uid(), seq: 20, name: "Mechanical Assembly", workCenter: "Assembly Line 1", setupMins: 30, runMinsPerUnit: 180, ratePerHour: 70, outsourced: false },
      { id: uid(), seq: 30, name: "Electrical Wiring", workCenter: "Assembly Line 1", setupMins: 15, runMinsPerUnit: 90, ratePerHour: 95, outsourced: false },
      { id: uid(), seq: 40, name: "Test & QC", workCenter: "QC Station", setupMins: 10, runMinsPerUnit: 45, ratePerHour: 60, outsourced: false },
    ],
  },
  {
    id: "2", code: "BOM-1002", version: "v1.0", productCode: "PRD-010", productName: "Frame Sub-Assembly (SS 304)",
    uom: "PCS", type: "assembly", status: "approved", batchSize: 5, yieldPercent: 99, costMethod: "last",
    overheadPercent: 5, currency: "AED", effectiveFrom: "2025-09-01", effectiveTo: "", revisionNo: 1,
    isDefault: true, allowSubstitutes: false, autoConsumeOnProduction: true, createSalesKit: false,
    routingRequired: true, location: "Production Floor", createdBy: "A. Fernandes", approvedBy: "M. Al Hashimi",
    notes: "",
    components: [
      { id: uid(), productCode: "PRD-010", description: "Stainless Steel Sheet 304 2mm", uom: "SHT", qtyPer: 2, scrapPercent: 8, unitCost: 430, issueMethod: "manual", location: "Central Warehouse", operationSeq: 10, isSubAssembly: false, optional: false, notes: "" },
      { id: uid(), productCode: "PRD-005", description: "Welding Rod E7018 3.2mm", uom: "KG", qtyPer: 1.5, scrapPercent: 10, unitCost: 8.2, issueMethod: "backflush", location: "Central Warehouse", operationSeq: 10, isSubAssembly: false, optional: false, notes: "" },
      { id: uid(), productCode: "PRD-012", description: "Paint Epoxy White 20L", uom: "TIN", qtyPer: 0.2, scrapPercent: 0, unitCost: 310, issueMethod: "backflush", location: "Central Warehouse", operationSeq: 20, isSubAssembly: false, optional: false, notes: "" },
    ],
    operations: [
      { id: uid(), seq: 10, name: "Cut & Weld Frame", workCenter: "Welding Bay", setupMins: 60, runMinsPerUnit: 95, ratePerHour: 85, outsourced: false },
      { id: uid(), seq: 20, name: "Surface Coating", workCenter: "Paint Booth", setupMins: 20, runMinsPerUnit: 40, ratePerHour: 55, outsourced: false },
    ],
  },
  {
    id: "3", code: "BOM-2001", version: "v1.2", productCode: "PRD-007", productName: "Site Safety Starter Kit",
    uom: "KIT", type: "kit", status: "pending", batchSize: 10, yieldPercent: 100, costMethod: "standard",
    overheadPercent: 2, currency: "AED", effectiveFrom: "2026-03-01", effectiveTo: "2026-12-31", revisionNo: 2,
    isDefault: true, allowSubstitutes: true, autoConsumeOnProduction: false, createSalesKit: true,
    routingRequired: false, location: "Central Warehouse", createdBy: "S. Nair", approvedBy: "",
    notes: "Sold as a bundle from Sales Invoice — components exploded at delivery.",
    components: [
      { id: uid(), productCode: "PRD-007", description: "Safety Helmet Yellow CE", uom: "PCS", qtyPer: 1, scrapPercent: 0, unitCost: 21.5, issueMethod: "manual", location: "Central Warehouse", operationSeq: 0, isSubAssembly: false, optional: false, notes: "" },
      { id: uid(), productCode: "PRD-011", description: "Lubricant Oil SAE 40 20L", uom: "DRM", qtyPer: 0.1, scrapPercent: 0, unitCost: 178, issueMethod: "manual", location: "Central Warehouse", operationSeq: 0, isSubAssembly: false, optional: true, notes: "Optional add-on" },
    ],
    operations: [],
  },
  {
    id: "4", code: "BOM-3001", version: "v0.9", productCode: "PRD-002", productName: "Fabricated Pipe Spool",
    uom: "PCS", type: "subcontract", status: "draft", batchSize: 20, yieldPercent: 95, costMethod: "last",
    overheadPercent: 4, currency: "AED", effectiveFrom: "2026-06-01", effectiveTo: "", revisionNo: 1,
    isDefault: false, allowSubstitutes: false, autoConsumeOnProduction: false, createSalesKit: false,
    routingRequired: true, location: "Sharjah DC", createdBy: "R. Kumar", approvedBy: "",
    notes: "Pending vendor rate confirmation before approval.",
    components: [
      { id: uid(), productCode: "PRD-002", description: "Steel Pipe Grade B 2 inch", uom: "MTR", qtyPer: 6, scrapPercent: 6, unitCost: 44.2, issueMethod: "subcontract", location: "Sharjah DC", operationSeq: 10, isSubAssembly: false, optional: false, notes: "Issued to subcontractor" },
      { id: uid(), productCode: "PRD-005", description: "Welding Rod E7018 3.2mm", uom: "KG", qtyPer: 0.8, scrapPercent: 10, unitCost: 8.2, issueMethod: "subcontract", location: "Sharjah DC", operationSeq: 10, isSubAssembly: false, optional: false, notes: "" },
    ],
    operations: [
      { id: uid(), seq: 10, name: "Spool Fabrication (Vendor)", workCenter: "Welding Bay", setupMins: 0, runMinsPerUnit: 60, ratePerHour: 120, outsourced: true },
    ],
  },
];

const emptyBom: Omit<Bom, "id"> = {
  code: "", version: "v1.0", productCode: "", productName: "", uom: "PCS", type: "manufacturing",
  status: "draft", batchSize: 1, yieldPercent: 100, costMethod: "average", overheadPercent: 0,
  currency: "AED", effectiveFrom: new Date().toISOString().slice(0, 10), effectiveTo: "", revisionNo: 1,
  isDefault: true, allowSubstitutes: false, autoConsumeOnProduction: true, createSalesKit: false,
  routingRequired: false, location: "Central Warehouse", createdBy: "Current User", approvedBy: "",
  notes: "", components: [], operations: [],
};

// ─── Costing helpers ───
const componentCost = (c: BomComponent, bomsByCode: Record<string, Bom>, depth = 0): number => {
  const effQty = c.qtyPer * (1 + c.scrapPercent / 100);
  if (c.isSubAssembly && c.subBomCode && bomsByCode[c.subBomCode] && depth < 8) {
    const sub = bomsByCode[c.subBomCode];
    return effQty * (bomCost(sub, bomsByCode, depth + 1).unitTotal);
  }
  return effQty * c.unitCost;
};

const bomCost = (bom: Bom, bomsByCode: Record<string, Bom>, depth = 0) => {
  const material = bom.components.reduce((s, c) => s + componentCost(c, bomsByCode, depth), 0);
  const labour = bom.operations.reduce(
    (s, o) => s + ((o.setupMins / Math.max(bom.batchSize, 1)) + o.runMinsPerUnit) / 60 * o.ratePerHour, 0
  );
  const overhead = (material + labour) * (bom.overheadPercent / 100);
  const subtotal = material + labour + overhead;
  const unitTotal = subtotal / Math.max(bom.yieldPercent / 100, 0.01);
  return { material, labour, overhead, unitTotal };
};

const money = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
