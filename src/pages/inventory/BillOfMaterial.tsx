import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Search, Plus, Edit2, Trash2, Filter, Download, Upload, Layers, GitBranch,
  CheckCircle2, Clock, AlertTriangle, Copy, Factory, Wrench, Boxes, DollarSign,
  ChevronRight, ChevronDown, Package, ArrowUpRight, ShoppingCart, FileText,
} from "lucide-react";
import { sampleProducts } from "@/components/purchase/purchaseData";

import {
  type Bom, type BomComponent, type BomOperation, type BomStatus, type BomType, type CostMethod,
  workCenters, locations, uid, initialBoms, emptyBom, componentCost, bomCost, money,
} from "@/data/bomData";

const statusConfig: Record<BomStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  draft: { label: "Draft", variant: "secondary", icon: Clock },
  pending: { label: "Pending Approval", variant: "outline", icon: AlertTriangle },
  approved: { label: "Approved", variant: "default", icon: CheckCircle2 },
  obsolete: { label: "Obsolete", variant: "destructive", icon: Trash2 },
};

const typeLabels: Record<BomType, string> = {
  manufacturing: "Manufacturing",
  assembly: "Assembly",
  kit: "Sales Kit",
  phantom: "Phantom",
  subcontract: "Subcontract",
};

const BillOfMaterial: React.FC = () => {
  const [boms, setBoms] = useState<Bom[]>(initialBoms);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Bom | null>(null);
  const [form, setForm] = useState<Omit<Bom, "id">>(emptyBom);
  const [tab, setTab] = useState("general");
  const [detail, setDetail] = useState<Bom | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [whereUsed, setWhereUsed] = useState<Bom | null>(null);

  const bomsByCode = useMemo(() => Object.fromEntries(boms.map(b => [b.code, b])) as Record<string, Bom>, [boms]);

  const filtered = boms.filter(b => {
    const s = search.toLowerCase();
    const matchSearch = !s || [b.code, b.productCode, b.productName, b.version].some(f => f.toLowerCase().includes(s));
    return matchSearch && (filterStatus === "all" || b.status === filterStatus) && (filterType === "all" || b.type === filterType);
  });

  const stats = {
    total: boms.length,
    approved: boms.filter(b => b.status === "approved").length,
    pending: boms.filter(b => b.status === "pending").length,
    components: boms.reduce((s, b) => s + b.components.length, 0),
    avgCost: boms.length ? boms.reduce((s, b) => s + bomCost(b, bomsByCode).unitTotal, 0) / boms.length : 0,
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyBom, code: `BOM-${1000 + boms.length + 1}`, components: [], operations: [] });
    setTab("general");
    setDialogOpen(true);
  };

  const openEdit = (b: Bom) => {
    setEditing(b);
    const { id, ...rest } = b;
    setForm({ ...rest, components: rest.components.map(c => ({ ...c })), operations: rest.operations.map(o => ({ ...o })) });
    setTab("general");
    setDialogOpen(true);
  };

  const duplicate = (b: Bom) => {
    const rev = b.revisionNo + 1;
    setBoms(prev => [...prev, {
      ...b, id: uid(), code: `${b.code}-R${rev}`, version: `v${rev}.0`, revisionNo: rev,
      status: "draft", approvedBy: "", isDefault: false,
      components: b.components.map(c => ({ ...c, id: uid() })),
      operations: b.operations.map(o => ({ ...o, id: uid() })),
    }]);
    toast.success(`Revision ${rev} created from ${b.code}`);
  };

  const handleSave = () => {
    if (!form.code || !form.productCode) { toast.error("BOM Code and Finished Product are required"); return; }
    if (form.components.length === 0) { toast.error("Add at least one component"); return; }
    if (editing) {
      setBoms(prev => prev.map(b => b.id === editing.id ? { ...form, id: editing.id } : b));
      toast.success(`${form.code} updated`);
    } else {
      setBoms(prev => [...prev, { ...form, id: uid() }]);
      toast.success(`${form.code} created`);
    }
    setDialogOpen(false);
  };

  const setStatus = (b: Bom, status: BomStatus) => {
    setBoms(prev => prev.map(x => x.id === b.id ? { ...x, status, approvedBy: status === "approved" ? "Current User" : "" } : x));
    setDetail(d => d && d.id === b.id ? { ...d, status } : d);
    toast.success(`${b.code} marked ${statusConfig[status].label}`);
  };

  const handleDelete = (id: string) => { setBoms(prev => prev.filter(b => b.id !== id)); toast.success("BOM deleted"); };

  // component editing
  const addComponent = (productCode?: string) => {
    const p = sampleProducts.find(x => x.code === productCode) ?? sampleProducts[0];
    setForm(f => ({
      ...f, components: [...f.components, {
        id: uid(), productCode: p.code, description: p.description, uom: p.unit, qtyPer: 1,
        scrapPercent: 0, unitCost: p.avgCost, issueMethod: "backflush", location: f.location,
        operationSeq: f.operations[0]?.seq ?? 10, isSubAssembly: false, optional: false, notes: "",
      }],
    }));
  };

  const updateComponent = (id: string, patch: Partial<BomComponent>) =>
    setForm(f => ({ ...f, components: f.components.map(c => c.id === id ? { ...c, ...patch } : c) }));

  const removeComponent = (id: string) =>
    setForm(f => ({ ...f, components: f.components.filter(c => c.id !== id) }));

  const addOperation = () =>
    setForm(f => ({
      ...f, operations: [...f.operations, {
        id: uid(), seq: (f.operations.length + 1) * 10, name: "", workCenter: workCenters[0],
        setupMins: 0, runMinsPerUnit: 0, ratePerHour: 0, outsourced: false,
      }],
    }));

  const updateOperation = (id: string, patch: Partial<BomOperation>) =>
    setForm(f => ({ ...f, operations: f.operations.map(o => o.id === id ? { ...o, ...patch } : o) }));

  const removeOperation = (id: string) =>
    setForm(f => ({ ...f, operations: f.operations.filter(o => o.id !== id) }));

  const formCost = bomCost({ ...form, id: "tmp" } as Bom, bomsByCode);

  // shortage check against inventory (integration with Product Master stock)
  const shortages = (b: Bom, qty = b.batchSize) =>
    b.components.filter(c => {
      if (c.isSubAssembly) return false;
      const p = sampleProducts.find(x => x.code === c.productCode);
      if (!p) return false;
      return p.availableQty < c.qtyPer * (1 + c.scrapPercent / 100) * qty;
    });

  const whereUsedList = (code: string) => boms.filter(b => b.components.some(c => c.productCode === code || c.subBomCode === code));

  const renderTree = (b: Bom, qty: number, depth: number, path: string): React.ReactNode[] =>
    b.components.flatMap(c => {
      const key = `${path}-${c.id}`;
      const effQty = c.qtyPer * (1 + c.scrapPercent / 100) * qty;
      const sub = c.subBomCode ? bomsByCode[c.subBomCode] : undefined;
      const isOpen = expanded[key];
      const p = sampleProducts.find(x => x.code === c.productCode);
      const short = p && p.availableQty < effQty;
      const rows: React.ReactNode[] = [
        <TableRow key={key} className="border-border/30">
          <TableCell style={{ paddingLeft: 12 + depth * 20 }}>
            <div className="flex items-center gap-1.5">
              {sub ? (
                <button onClick={() => setExpanded(e => ({ ...e, [key]: !e[key] }))} className="text-muted-foreground hover:text-foreground">
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              ) : <span className="w-3.5" />}
              {sub ? <GitBranch className="h-3.5 w-3.5 text-primary" /> : <Package className="h-3.5 w-3.5 text-muted-foreground" />}
              <span className="font-mono text-xs">{c.productCode}</span>
            </div>
          </TableCell>
          <TableCell className="text-sm">{c.description}{c.optional && <Badge variant="outline" className="ml-2 text-[10px]">Optional</Badge>}</TableCell>
          <TableCell className="text-xs text-muted-foreground">{c.uom}</TableCell>
          <TableCell className="text-right font-mono text-xs">{effQty.toFixed(3)}</TableCell>
          <TableCell className="text-right font-mono text-xs">{c.scrapPercent}%</TableCell>
          <TableCell className="text-right font-mono text-xs">{money(componentCost(c, bomsByCode) * qty)}</TableCell>
          <TableCell className="text-xs">{c.issueMethod}</TableCell>
          <TableCell className="text-xs">
            {p ? (
              <span className={short ? "text-destructive font-medium" : "text-[hsl(var(--success))]"}>
                {p.availableQty} {p.unit}
              </span>
            ) : <span className="text-muted-foreground">—</span>}
          </TableCell>
        </TableRow>,
      ];
      if (sub && isOpen) rows.push(...renderTree(sub, effQty, depth + 1, key));
      return rows;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bill of Material</h1>
          <p className="text-sm text-muted-foreground">Multi-level BOMs, routing, cost roll-up and production integration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("BOM list exported")}><Download className="h-4 w-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("Use Uploads & Import → Product Upload for bulk BOM import")}><Upload className="h-4 w-4 mr-1" />Import</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />New BOM</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: "Total BOMs", value: stats.total, icon: Layers, accent: "border-l-primary" },
          { title: "Approved", value: stats.approved, icon: CheckCircle2, accent: "border-l-[hsl(var(--success))]" },
          { title: "Pending Approval", value: stats.pending, icon: AlertTriangle, accent: "border-l-[hsl(var(--warning))]" },
          { title: "Component Lines", value: stats.components, icon: Boxes, accent: "border-l-[hsl(var(--chart-4))]" },
          { title: "Avg Unit Cost", value: `AED ${money(stats.avgCost)}`, icon: DollarSign, accent: "border-l-[hsl(var(--chart-2))]" },
        ].map(kpi => (
          <Card key={kpi.title} className={`glass-card border-l-4 ${kpi.accent}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary"><kpi.icon className="h-5 w-5 text-muted-foreground" /></div>
              <div><p className="text-xs text-muted-foreground">{kpi.title}</p><p className="text-lg font-bold text-foreground">{kpi.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search BOM code, product, version..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="glass-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead>BOM Code</TableHead>
              <TableHead>Finished Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Batch</TableHead>
              <TableHead className="text-right">Comps</TableHead>
              <TableHead className="text-right">Ops</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead>Shortages</TableHead>
              <TableHead>Effective</TableHead>
              <TableHead className="w-[120px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(b => {
              const cost = bomCost(b, bomsByCode);
              const sh = shortages(b);
              return (
                <TableRow key={b.id} className="border-border/30 hover:bg-secondary/30 cursor-pointer" onClick={() => setDetail(b)}>
                  <TableCell>
                    <div className="font-mono text-xs font-medium text-foreground">{b.code}</div>
                    <div className="text-[10px] text-muted-foreground">{b.version}{b.isDefault && " • default"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">{b.productName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{b.productCode}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{typeLabels[b.type]}</Badge></TableCell>
                  <TableCell><Badge variant={statusConfig[b.status].variant}>{statusConfig[b.status].label}</Badge></TableCell>
                  <TableCell className="text-right font-mono text-xs">{b.batchSize}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{b.components.length}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{b.operations.length}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{b.currency} {money(cost.unitTotal)}</TableCell>
                  <TableCell>
                    {sh.length ? <Badge variant="destructive" className="text-[10px]">{sh.length} short</Badge>
                      : <Badge variant="secondary" className="text-[10px]">OK</Badge>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.effectiveFrom}{b.effectiveTo ? ` → ${b.effectiveTo}` : ""}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-0.5" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => openEdit(b)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="New revision" onClick={() => duplicate(b)}><Copy className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Where used" onClick={() => setWhereUsed(b)}><GitBranch className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Delete" onClick={() => handleDelete(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={11} className="text-center py-12 text-muted-foreground">No bills of material found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Detail / Explosion Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-5xl max-h-[88vh] overflow-y-auto">
          {detail && (() => {
            const cost = bomCost(detail, bomsByCode);
            const sh = shortages(detail);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    {detail.code} <span className="text-muted-foreground text-sm font-normal">{detail.version}</span>
                    <Badge variant={statusConfig[detail.status].variant} className="ml-2">{statusConfig[detail.status].label}</Badge>
                    <Badge variant="outline">{typeLabels[detail.type]}</Badge>
                  </DialogTitle>
                  <DialogDescription>{detail.productName} ({detail.productCode}) • Batch size {detail.batchSize} {detail.uom} • Yield {detail.yieldPercent}%</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ["Material Cost", `${detail.currency} ${money(cost.material)}`],
                    ["Labour / Routing", `${detail.currency} ${money(cost.labour)}`],
                    ["Overhead", `${detail.currency} ${money(cost.overhead)}`],
                    ["Cost per Unit", `${detail.currency} ${money(cost.unitTotal)}`],
                  ].map(([l, v]) => (
                    <Card key={l} className="glass-card"><CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">{l}</p>
                      <p className="text-sm font-bold text-foreground font-mono">{v}</p>
                    </CardContent></Card>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 mt-2">MULTI-LEVEL EXPLOSION (for {detail.batchSize} {detail.uom})</p>
                  <div className="border border-border/50 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/50">
                          <TableHead className="text-xs">Item</TableHead>
                          <TableHead className="text-xs">Description</TableHead>
                          <TableHead className="text-xs">UOM</TableHead>
                          <TableHead className="text-xs text-right">Req. Qty</TableHead>
                          <TableHead className="text-xs text-right">Scrap</TableHead>
                          <TableHead className="text-xs text-right">Ext. Cost</TableHead>
                          <TableHead className="text-xs">Issue</TableHead>
                          <TableHead className="text-xs">On Hand</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>{renderTree(detail, detail.batchSize, 0, detail.id)}</TableBody>
                    </Table>
                  </div>
                </div>

                {detail.operations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">ROUTING / OPERATIONS</p>
                    <div className="border border-border/50 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary/50">
                            <TableHead className="text-xs w-16">Seq</TableHead>
                            <TableHead className="text-xs">Operation</TableHead>
                            <TableHead className="text-xs">Work Center</TableHead>
                            <TableHead className="text-xs text-right">Setup (min)</TableHead>
                            <TableHead className="text-xs text-right">Run/Unit (min)</TableHead>
                            <TableHead className="text-xs text-right">Rate/Hr</TableHead>
                            <TableHead className="text-xs text-right">Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detail.operations.map(o => (
                            <TableRow key={o.id} className="border-border/30">
                              <TableCell className="font-mono text-xs">{o.seq}</TableCell>
                              <TableCell className="text-sm">{o.name}{o.outsourced && <Badge variant="outline" className="ml-2 text-[10px]">Outsourced</Badge>}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{o.workCenter}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{o.setupMins}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{o.runMinsPerUnit}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{money(o.ratePerHour)}</TableCell>
                              <TableCell className="text-right font-mono text-xs">
                                {money(((o.setupMins / Math.max(detail.batchSize, 1)) + o.runMinsPerUnit) / 60 * o.ratePerHour)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {sh.length > 0 && (
                  <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10">
                    <p className="text-xs font-semibold text-destructive flex items-center gap-1 mb-1"><AlertTriangle className="h-3.5 w-3.5" />Stock shortages for this batch</p>
                    <p className="text-xs text-muted-foreground">{sh.map(c => `${c.productCode} (${c.description})`).join(", ")}</p>
                  </div>
                )}

                {detail.notes && <div className="p-3 rounded-lg bg-secondary text-sm"><p className="text-xs text-muted-foreground mb-1">Notes</p><p className="text-foreground">{detail.notes}</p></div>}

                {/* Integrations */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                  <Button variant="outline" size="sm" onClick={() => toast.success(`Production order raised for ${detail.batchSize} ${detail.uom} of ${detail.productCode}`)}>
                    <Factory className="h-4 w-4 mr-1" />Create Production Order
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success(`Stock issue prepared for ${detail.components.length} component lines`)}>
                    <Boxes className="h-4 w-4 mr-1" />Issue Components to Stock Issue
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success(sh.length ? `Purchase requisition drafted for ${sh.length} short item(s)` : "No shortages — nothing to requisition")}>
                    <ShoppingCart className="h-4 w-4 mr-1" />Raise Purchase Requisition
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success(`Standard cost ${detail.currency} ${money(cost.unitTotal)} pushed to Price List Setup`)}>
                    <DollarSign className="h-4 w-4 mr-1" />Update Standard Cost
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setWhereUsed(detail); }}>
                    <GitBranch className="h-4 w-4 mr-1" />Where Used
                  </Button>
                </div>

                <DialogFooter className="gap-2">
                  {detail.status === "draft" && <Button variant="outline" onClick={() => setStatus(detail, "pending")}>Submit for Approval</Button>}
                  {detail.status === "pending" && <Button onClick={() => setStatus(detail, "approved")}>Approve</Button>}
                  {detail.status === "approved" && <Button variant="outline" onClick={() => setStatus(detail, "obsolete")}>Mark Obsolete</Button>}
                  <Button variant="outline" onClick={() => { setDetail(null); openEdit(detail); }}><Edit2 className="h-4 w-4 mr-1" />Edit BOM</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Where Used Dialog */}
      <Dialog open={!!whereUsed} onOpenChange={() => setWhereUsed(null)}>
        <DialogContent className="max-w-2xl">
          {whereUsed && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5 text-primary" />Where Used — {whereUsed.code}</DialogTitle>
                <DialogDescription>Parent BOMs consuming {whereUsed.productCode} / {whereUsed.code}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {[...whereUsedList(whereUsed.code), ...whereUsedList(whereUsed.productCode)]
                  .filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i && b.id !== whereUsed.id)
                  .map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                      <div>
                        <p className="text-sm font-medium text-foreground">{b.code} <span className="text-xs text-muted-foreground">{b.version}</span></p>
                        <p className="text-xs text-muted-foreground">{b.productName}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setWhereUsed(null); setDetail(b); }}>Open <ArrowUpRight className="h-3.5 w-3.5 ml-1" /></Button>
                    </div>
                  ))}
                {[...whereUsedList(whereUsed.code), ...whereUsedList(whereUsed.productCode)].filter(b => b.id !== whereUsed.id).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Not used in any other BOM</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.code}` : "New Bill of Material"}</DialogTitle>
            <DialogDescription>Define the finished product, components, routing and integration behaviour</DialogDescription>
          </DialogHeader>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="components">Components ({form.components.length})</TabsTrigger>
              <TabsTrigger value="routing">Routing ({form.operations.length})</TabsTrigger>
              <TabsTrigger value="costing">Costing & Integration</TabsTrigger>
            </TabsList>

            {/* General */}
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label className="text-xs">BOM Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></div>
                <div><Label className="text-xs">Version</Label><Input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} /></div>
                <div><Label className="text-xs">Revision No</Label><Input type="number" value={form.revisionNo} onChange={e => setForm(f => ({ ...f, revisionNo: +e.target.value }))} /></div>

                <div className="md:col-span-2">
                  <Label className="text-xs">Finished Product *</Label>
                  <Select value={form.productCode} onValueChange={v => {
                    const p = sampleProducts.find(x => x.code === v);
                    setForm(f => ({ ...f, productCode: v, productName: p?.description ?? "", uom: p?.unit ?? f.uom }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select from Product Master" /></SelectTrigger>
                    <SelectContent>
                      {sampleProducts.map(p => <SelectItem key={p.code} value={p.code}>{p.code} — {p.description}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">UOM</Label><Input value={form.uom} onChange={e => setForm(f => ({ ...f, uom: e.target.value }))} /></div>

                <div>
                  <Label className="text-xs">BOM Type</Label>
                  <Select value={form.type} onValueChange={(v: BomType) => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={(v: BomStatus) => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Production Location</Label>
                  <Select value={form.location} onValueChange={v => setForm(f => ({ ...f, location: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div><Label className="text-xs">Batch / Output Size</Label><Input type="number" value={form.batchSize} onChange={e => setForm(f => ({ ...f, batchSize: +e.target.value }))} /></div>
                <div><Label className="text-xs">Yield %</Label><Input type="number" value={form.yieldPercent} onChange={e => setForm(f => ({ ...f, yieldPercent: +e.target.value }))} /></div>
                <div><Label className="text-xs">Currency</Label><Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></div>

                <div><Label className="text-xs">Effective From</Label><Input type="date" value={form.effectiveFrom} onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value }))} /></div>
                <div><Label className="text-xs">Effective To</Label><Input type="date" value={form.effectiveTo} onChange={e => setForm(f => ({ ...f, effectiveTo: e.target.value }))} /></div>
                <div><Label className="text-xs">Approved By</Label><Input value={form.approvedBy} onChange={e => setForm(f => ({ ...f, approvedBy: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Notes</Label><Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </TabsContent>

            {/* Components */}
            <TabsContent value="components" className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Components pull live stock and cost from Product Master. Mark a line as sub-assembly to nest another BOM.</p>
                <Button size="sm" variant="outline" onClick={() => addComponent()}><Plus className="h-4 w-4 mr-1" />Add Component</Button>
              </div>
              <div className="border border-border/50 rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead className="text-xs min-w-[190px]">Item</TableHead>
                      <TableHead className="text-xs w-20">UOM</TableHead>
                      <TableHead className="text-xs w-24">Qty / Unit</TableHead>
                      <TableHead className="text-xs w-20">Scrap %</TableHead>
                      <TableHead className="text-xs w-24">Unit Cost</TableHead>
                      <TableHead className="text-xs w-32">Issue Method</TableHead>
                      <TableHead className="text-xs w-20">Op Seq</TableHead>
                      <TableHead className="text-xs w-24">Sub-BOM</TableHead>
                      <TableHead className="text-xs w-16">Opt.</TableHead>
                      <TableHead className="text-xs w-24 text-right">Ext. Cost</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.components.map(c => (
                      <TableRow key={c.id} className="border-border/30">
                        <TableCell>
                          <Select value={c.productCode} onValueChange={v => {
                            const p = sampleProducts.find(x => x.code === v);
                            const sub = bomsByCode[v];
                            updateComponent(c.id, p
                              ? { productCode: v, description: p.description, uom: p.unit, unitCost: p.avgCost, isSubAssembly: false, subBomCode: undefined }
                              : { productCode: v, description: sub?.productName ?? v, uom: sub?.uom ?? "PCS", isSubAssembly: true, subBomCode: v, unitCost: 0 });
                          }}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select item" /></SelectTrigger>
                            <SelectContent>
                              {sampleProducts.map(p => <SelectItem key={p.code} value={p.code}>{p.code} — {p.description}</SelectItem>)}
                              {boms.filter(b => b.code !== form.code).map(b => <SelectItem key={b.code} value={b.code}>{b.code} (Sub-Assembly)</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input className="h-8 text-xs" value={c.uom} onChange={e => updateComponent(c.id, { uom: e.target.value })} /></TableCell>
                        <TableCell><Input className="h-8 text-xs" type="number" step="0.001" value={c.qtyPer} onChange={e => updateComponent(c.id, { qtyPer: +e.target.value })} /></TableCell>
                        <TableCell><Input className="h-8 text-xs" type="number" value={c.scrapPercent} onChange={e => updateComponent(c.id, { scrapPercent: +e.target.value })} /></TableCell>
                        <TableCell><Input className="h-8 text-xs" type="number" step="0.01" value={c.unitCost} disabled={c.isSubAssembly} onChange={e => updateComponent(c.id, { unitCost: +e.target.value })} /></TableCell>
                        <TableCell>
                          <Select value={c.issueMethod} onValueChange={(v: BomComponent["issueMethod"]) => updateComponent(c.id, { issueMethod: v })}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="backflush">Backflush</SelectItem>
                              <SelectItem value="manual">Manual Issue</SelectItem>
                              <SelectItem value="subcontract">Subcontract</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input className="h-8 text-xs" type="number" value={c.operationSeq} onChange={e => updateComponent(c.id, { operationSeq: +e.target.value })} /></TableCell>
                        <TableCell className="text-xs">{c.isSubAssembly ? <Badge variant="outline" className="text-[10px]">{c.subBomCode}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell><Switch checked={c.optional} onCheckedChange={v => updateComponent(c.id, { optional: v })} /></TableCell>
                        <TableCell className="text-right font-mono text-xs">{money(componentCost(c, bomsByCode))}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeComponent(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                      </TableRow>
                    ))}
                    {form.components.length === 0 && (
                      <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground text-sm">No components added</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Routing */}
            <TabsContent value="routing" className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Operations drive labour cost roll-up and component issue sequencing.</p>
                <Button size="sm" variant="outline" onClick={addOperation}><Plus className="h-4 w-4 mr-1" />Add Operation</Button>
              </div>
              <div className="border border-border/50 rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead className="text-xs w-20">Seq</TableHead>
                      <TableHead className="text-xs">Operation</TableHead>
                      <TableHead className="text-xs w-48">Work Center</TableHead>
                      <TableHead className="text-xs w-28">Setup (min)</TableHead>
                      <TableHead className="text-xs w-28">Run/Unit (min)</TableHead>
                      <TableHead className="text-xs w-28">Rate / Hr</TableHead>
                      <TableHead className="text-xs w-24">Outsourced</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.operations.map(o => (
                      <TableRow key={o.id} className="border-border/30">
                        <TableCell><Input className="h-8 text-xs" type="number" value={o.seq} onChange={e => updateOperation(o.id, { seq: +e.target.value })} /></TableCell>
                        <TableCell><Input className="h-8 text-xs" value={o.name} placeholder="Operation name" onChange={e => updateOperation(o.id, { name: e.target.value })} /></TableCell>
                        <TableCell>
                          <Select value={o.workCenter} onValueChange={v => updateOperation(o.id, { workCenter: v })}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{workCenters.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input className="h-8 text-xs" type="number" value={o.setupMins} onChange={e => updateOperation(o.id, { setupMins: +e.target.value })} /></TableCell>
                        <TableCell><Input className="h-8 text-xs" type="number" value={o.runMinsPerUnit} onChange={e => updateOperation(o.id, { runMinsPerUnit: +e.target.value })} /></TableCell>
                        <TableCell><Input className="h-8 text-xs" type="number" value={o.ratePerHour} onChange={e => updateOperation(o.id, { ratePerHour: +e.target.value })} /></TableCell>
                        <TableCell><Switch checked={o.outsourced} onCheckedChange={v => updateOperation(o.id, { outsourced: v })} /></TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeOperation(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                      </TableRow>
                    ))}
                    {form.operations.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">No operations — BOM will cost material only</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Costing & Integration */}
            <TabsContent value="costing" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Component Costing Method</Label>
                  <Select value={form.costMethod} onValueChange={(v: CostMethod) => setForm(f => ({ ...f, costMethod: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last">Last Purchase Cost</SelectItem>
                      <SelectItem value="average">Weighted Average</SelectItem>
                      <SelectItem value="standard">Standard Cost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Overhead %</Label><Input type="number" value={form.overheadPercent} onChange={e => setForm(f => ({ ...f, overheadPercent: +e.target.value }))} /></div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full" onClick={() => {
                    setForm(f => ({
                      ...f, components: f.components.map(c => {
                        const p = sampleProducts.find(x => x.code === c.productCode);
                        if (!p) return c;
                        return { ...c, unitCost: f.costMethod === "last" ? p.lastCost : p.avgCost };
                      }),
                    }));
                    toast.success("Component costs refreshed from Product Master");
                  }}><Wrench className="h-4 w-4 mr-1" />Refresh Costs</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ["Material", formCost.material], ["Labour", formCost.labour],
                  ["Overhead", formCost.overhead], ["Cost / Unit", formCost.unitTotal],
                ].map(([l, v]) => (
                  <Card key={l as string} className="glass-card"><CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">{l as string}</p>
                    <p className="text-sm font-bold font-mono text-foreground">{form.currency} {money(v as number)}</p>
                  </CardContent></Card>
                ))}
              </div>

              <div className="space-y-3 pt-2 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground">MODULE INTEGRATION</p>
                {[
                  ["isDefault", "Default BOM for this product", "Used automatically by Production, Sales Kits and Costing"],
                  ["allowSubstitutes", "Allow substitute items", "Permits alternate items during stock issue"],
                  ["autoConsumeOnProduction", "Auto-consume components on production", "Backflushes stock via Stock Issue on completion"],
                  ["createSalesKit", "Explode on Sales Invoice / Delivery Note", "Kit components are shipped and relieved individually"],
                  ["routingRequired", "Routing mandatory before approval", "Blocks approval when no operations are defined"],
                ].map(([key, label, help]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div><p className="text-sm text-foreground">{label}</p><p className="text-xs text-muted-foreground">{help}</p></div>
                    <Switch
                      checked={form[key as keyof typeof form] as boolean}
                      onCheckedChange={v => setForm(f => ({ ...f, [key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}><FileText className="h-4 w-4 mr-1" />{editing ? "Update BOM" : "Create BOM"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillOfMaterial;
