import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Plus, ChevronRight, ChevronDown, Warehouse, LayoutGrid, Grid3X3,
  Box, Package, Edit2, Trash2, Copy, MoreHorizontal, MapPin, Layers,
  ArrowUpDown, Filter, Download, Upload, BarChart3, Eye, CheckCircle2, XCircle
} from "lucide-react";

// ─── Types ───
type NodeType = "warehouse" | "zone" | "aisle" | "rack" | "shelf" | "bin";
type Status = "active" | "inactive" | "maintenance" | "full";

interface LocationNode {
  id: string;
  code: string;
  name: string;
  type: NodeType;
  status: Status;
  description?: string;
  capacity?: number;
  currentLoad?: number;
  dimensions?: { length: number; width: number; height: number };
  weightLimit?: number;
  barcode?: string;
  temperature?: string;
  isHazardous?: boolean;
  children: LocationNode[];
}

const typeConfig: Record<NodeType, { label: string; icon: React.ElementType; color: string; childType?: NodeType; childLabel?: string }> = {
  warehouse: { label: "Warehouse", icon: Warehouse, color: "bg-primary/20 text-primary", childType: "zone", childLabel: "Zone" },
  zone: { label: "Zone", icon: LayoutGrid, color: "bg-accent/20 text-accent", childType: "aisle", childLabel: "Aisle" },
  aisle: { label: "Aisle", icon: ArrowUpDown, color: "bg-chart-3/20 text-[hsl(var(--chart-3))]", childType: "rack", childLabel: "Rack" },
  rack: { label: "Rack", icon: Grid3X3, color: "bg-chart-4/20 text-[hsl(var(--chart-4))]", childType: "shelf", childLabel: "Shelf" },
  shelf: { label: "Shelf", icon: Layers, color: "bg-chart-5/20 text-[hsl(var(--chart-5))]", childType: "bin", childLabel: "Bin" },
  bin: { label: "Bin", icon: Box, color: "bg-success/20 text-[hsl(var(--success))]" },
};

const statusConfig: Record<Status, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  maintenance: { label: "Maintenance", variant: "outline" },
  full: { label: "Full", variant: "destructive" },
};

// ─── Sample data ───
const initialData: LocationNode[] = [
  {
    id: "wh1", code: "WH-001", name: "Main Warehouse", type: "warehouse", status: "active",
    description: "Primary storage facility", capacity: 10000, currentLoad: 6500, barcode: "WH001",
    children: [
      {
        id: "z1", code: "WH-001-A", name: "Zone A - Receiving", type: "zone", status: "active",
        capacity: 3000, currentLoad: 1800,
        children: [
          {
            id: "a1", code: "WH-001-A-01", name: "Aisle 01", type: "aisle", status: "active",
            capacity: 500, currentLoad: 320,
            children: [
              {
                id: "r1", code: "WH-001-A-01-R1", name: "Rack R1", type: "rack", status: "active",
                capacity: 100, currentLoad: 75, dimensions: { length: 200, width: 60, height: 300 }, weightLimit: 500,
                children: [
                  {
                    id: "s1", code: "WH-001-A-01-R1-S1", name: "Shelf 1 (Top)", type: "shelf", status: "active",
                    capacity: 25, currentLoad: 18,
                    children: [
                      { id: "b1", code: "BIN-001", name: "Bin 001", type: "bin", status: "active", capacity: 10, currentLoad: 7, barcode: "BIN001", children: [] },
                      { id: "b2", code: "BIN-002", name: "Bin 002", type: "bin", status: "active", capacity: 10, currentLoad: 5, barcode: "BIN002", children: [] },
                      { id: "b3", code: "BIN-003", name: "Bin 003", type: "bin", status: "full", capacity: 5, currentLoad: 5, barcode: "BIN003", children: [] },
                    ],
                  },
                  {
                    id: "s2", code: "WH-001-A-01-R1-S2", name: "Shelf 2 (Middle)", type: "shelf", status: "active",
                    capacity: 30, currentLoad: 22,
                    children: [
                      { id: "b4", code: "BIN-004", name: "Bin 004", type: "bin", status: "active", capacity: 15, currentLoad: 10, barcode: "BIN004", children: [] },
                      { id: "b5", code: "BIN-005", name: "Bin 005", type: "bin", status: "maintenance", capacity: 15, currentLoad: 0, barcode: "BIN005", children: [] },
                    ],
                  },
                  {
                    id: "s3", code: "WH-001-A-01-R1-S3", name: "Shelf 3 (Bottom)", type: "shelf", status: "active",
                    capacity: 45, currentLoad: 35, children: [],
                  },
                ],
              },
              {
                id: "r2", code: "WH-001-A-01-R2", name: "Rack R2", type: "rack", status: "active",
                capacity: 100, currentLoad: 60, dimensions: { length: 200, width: 60, height: 300 }, weightLimit: 750,
                children: [],
              },
            ],
          },
          {
            id: "a2", code: "WH-001-A-02", name: "Aisle 02", type: "aisle", status: "active",
            capacity: 500, currentLoad: 200, children: [],
          },
        ],
      },
      {
        id: "z2", code: "WH-001-B", name: "Zone B - Bulk Storage", type: "zone", status: "active",
        capacity: 5000, currentLoad: 3200, children: [],
      },
      {
        id: "z3", code: "WH-001-C", name: "Zone C - Cold Storage", type: "zone", status: "maintenance",
        capacity: 2000, currentLoad: 0, temperature: "2-8°C", children: [],
      },
    ],
  },
  {
    id: "wh2", code: "WH-002", name: "Secondary Warehouse", type: "warehouse", status: "active",
    description: "Overflow and seasonal storage", capacity: 5000, currentLoad: 1200, barcode: "WH002",
    children: [],
  },
];

let nextId = 100;
const genId = () => `node-${nextId++}`;

// ─── Helpers ───
function flatCount(nodes: LocationNode[], type?: NodeType): number {
  let count = 0;
  for (const n of nodes) {
    if (!type || n.type === type) count++;
    count += flatCount(n.children, type);
  }
  return count;
}

function searchNodes(nodes: LocationNode[], q: string): LocationNode[] {
  if (!q) return nodes;
  const lower = q.toLowerCase();
  const result: LocationNode[] = [];
  for (const n of nodes) {
    const children = searchNodes(n.children, q);
    if (n.name.toLowerCase().includes(lower) || n.code.toLowerCase().includes(lower) || children.length > 0) {
      result.push({ ...n, children });
    }
  }
  return result;
}

function addChild(nodes: LocationNode[], parentId: string, child: LocationNode): LocationNode[] {
  return nodes.map(n => {
    if (n.id === parentId) return { ...n, children: [...n.children, child] };
    return { ...n, children: addChild(n.children, parentId, child) };
  });
}

function updateNode(nodes: LocationNode[], id: string, updates: Partial<LocationNode>): LocationNode[] {
  return nodes.map(n => {
    if (n.id === id) return { ...n, ...updates };
    return { ...n, children: updateNode(n.children, id, updates) };
  });
}

function deleteNode(nodes: LocationNode[], id: string): LocationNode[] {
  return nodes.filter(n => n.id !== id).map(n => ({ ...n, children: deleteNode(n.children, id) }));
}

function findNode(nodes: LocationNode[], id: string): LocationNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}

// ─── Tree Row ───
function TreeRow({
  node, depth, expanded, onToggle, onAddChild, onEdit, onDelete, onDuplicate,
}: {
  node: LocationNode; depth: number; expanded: Set<string>;
  onToggle: (id: string) => void; onAddChild: (parentId: string, type: NodeType) => void;
  onEdit: (node: LocationNode) => void; onDelete: (id: string) => void; onDuplicate: (node: LocationNode) => void;
}) {
  const isOpen = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const cfg = typeConfig[node.type];
  const Icon = cfg.icon;
  const stCfg = statusConfig[node.status];
  const util = node.capacity ? Math.round(((node.currentLoad || 0) / node.capacity) * 100) : 0;

  return (
    <>
      <TableRow className="group hover:bg-secondary/40 transition-colors">
        <TableCell className="py-2">
          <div className="flex items-center gap-1" style={{ paddingLeft: depth * 24 }}>
            {hasChildren || cfg.childType ? (
              <button onClick={() => onToggle(node.id)} className="p-0.5 rounded hover:bg-secondary/60 text-muted-foreground">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : <span className="w-5" />}
            <div className={`p-1.5 rounded-md ${cfg.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="ml-2">
              <span className="font-medium text-foreground text-sm">{node.name}</span>
              <span className="ml-2 text-xs text-muted-foreground font-mono">{node.code}</span>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={stCfg.variant} className="text-xs">{stCfg.label}</Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">{cfg.label}</TableCell>
        <TableCell>
          {node.capacity ? (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${util >= 90 ? "bg-destructive" : util >= 70 ? "bg-[hsl(var(--warning))]" : "bg-primary"}`}
                  style={{ width: `${util}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{util}%</span>
            </div>
          ) : <span className="text-xs text-muted-foreground">—</span>}
        </TableCell>
        <TableCell className="text-xs font-mono text-muted-foreground">
          {node.capacity ? `${node.currentLoad || 0} / ${node.capacity}` : "—"}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {cfg.childType && (
              <Button variant="ghost" size="icon" className="h-7 w-7" title={`Add ${cfg.childLabel}`}
                onClick={() => onAddChild(node.id, cfg.childType!)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(node)}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDuplicate(node)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(node.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isOpen && node.children.map(child => (
        <TreeRow key={child.id} node={child} depth={depth + 1} expanded={expanded}
          onToggle={onToggle} onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
      ))}
    </>
  );
}

// ─── Form Dialog ───
function LocationFormDialog({
  open, onClose, onSave, initial, mode, nodeType,
}: {
  open: boolean; onClose: () => void; onSave: (data: Partial<LocationNode>) => void;
  initial?: LocationNode | null; mode: "add" | "edit"; nodeType: NodeType;
}) {
  const [form, setForm] = useState<Partial<LocationNode>>(
    initial || { code: "", name: "", type: nodeType, status: "active", description: "", capacity: undefined, currentLoad: 0, barcode: "", weightLimit: undefined, temperature: "", isHazardous: false }
  );

  React.useEffect(() => {
    if (initial) setForm(initial);
    else setForm({ code: "", name: "", type: nodeType, status: "active", description: "", capacity: undefined, currentLoad: 0, barcode: "", weightLimit: undefined, temperature: "", isHazardous: false });
  }, [initial, nodeType, open]);

  const cfg = typeConfig[nodeType];
  const Icon = cfg.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${cfg.color}`}><Icon className="h-5 w-5" /></div>
            {mode === "add" ? `Add ${cfg.label}` : `Edit ${cfg.label}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" ? `Create a new ${cfg.label.toLowerCase()} location.` : `Update ${cfg.label.toLowerCase()} details.`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="capacity" className="flex-1">Capacity</TabsTrigger>
            <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code <span className="text-destructive">*</span></Label>
                <Input value={form.code || ""} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder={`e.g. ${nodeType === "bin" ? "BIN-010" : "WH-001-A"}`} className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status || "active"} onValueChange={v => setForm(f => ({ ...f, status: v as Status }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={`${cfg.label} name`} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional description..." />
            </div>
            <div className="space-y-2">
              <Label>Barcode</Label>
              <Input value={form.barcode || ""} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="Barcode / QR code" className="font-mono" />
            </div>
          </TabsContent>

          <TabsContent value="capacity" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Capacity (units)</Label>
                <Input type="number" value={form.capacity ?? ""} onChange={e => setForm(f => ({ ...f, capacity: e.target.value ? Number(e.target.value) : undefined }))} />
              </div>
              <div className="space-y-2">
                <Label>Current Load</Label>
                <Input type="number" value={form.currentLoad ?? ""} onChange={e => setForm(f => ({ ...f, currentLoad: e.target.value ? Number(e.target.value) : 0 }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Weight Limit (kg)</Label>
              <Input type="number" value={form.weightLimit ?? ""} onChange={e => setForm(f => ({ ...f, weightLimit: e.target.value ? Number(e.target.value) : undefined }))} />
            </div>
            <div className="space-y-2">
              <Label>Dimensions (cm) — L × W × H</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input type="number" placeholder="Length" value={form.dimensions?.length ?? ""}
                  onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions || { length: 0, width: 0, height: 0 }, length: Number(e.target.value) } }))} />
                <Input type="number" placeholder="Width" value={form.dimensions?.width ?? ""}
                  onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions || { length: 0, width: 0, height: 0 }, width: Number(e.target.value) } }))} />
                <Input type="number" placeholder="Height" value={form.dimensions?.height ?? ""}
                  onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions || { length: 0, width: 0, height: 0 }, height: Number(e.target.value) } }))} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Temperature Range</Label>
              <Input value={form.temperature || ""} onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))} placeholder="e.g. 2-8°C, Ambient" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label>Hazardous Material Zone</Label>
                <p className="text-xs text-muted-foreground mt-1">Mark if this location stores hazardous goods</p>
              </div>
              <Switch checked={form.isHazardous || false} onCheckedChange={v => setForm(f => ({ ...f, isHazardous: v }))} />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (form.code && form.name) onSave(form); }}
            disabled={!form.code || !form.name}>
            {mode === "add" ? "Create" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───
export default function ShelvesRacksBins() {
  const [data, setData] = useState<LocationNode[]>(initialData);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["wh1", "z1", "a1", "r1", "s1"]));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [dialogNodeType, setDialogNodeType] = useState<NodeType>("warehouse");
  const [dialogParentId, setDialogParentId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<LocationNode | null>(null);
  const [viewMode, setViewMode] = useState<"tree" | "flat">("tree");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = searchNodes(data, search);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const ids = new Set<string>();
    const collect = (nodes: LocationNode[]) => { nodes.forEach(n => { ids.add(n.id); collect(n.children); }); };
    collect(data);
    setExpanded(ids);
  };

  const collapseAll = () => setExpanded(new Set());

  const handleAddChild = (parentId: string, type: NodeType) => {
    setDialogMode("add");
    setDialogNodeType(type);
    setDialogParentId(parentId);
    setEditingNode(null);
    setDialogOpen(true);
    setExpanded(prev => new Set(prev).add(parentId));
  };

  const handleAddRoot = () => {
    setDialogMode("add");
    setDialogNodeType("warehouse");
    setDialogParentId(null);
    setEditingNode(null);
    setDialogOpen(true);
  };

  const handleEdit = (node: LocationNode) => {
    setDialogMode("edit");
    setDialogNodeType(node.type);
    setEditingNode(node);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => setData(prev => deleteNode(prev, id));

  const handleDuplicate = (node: LocationNode) => {
    const dup: LocationNode = { ...node, id: genId(), code: node.code + "-COPY", name: node.name + " (Copy)", children: [] };
    // find parent and add
    const addToParent = (nodes: LocationNode[]): LocationNode[] => {
      return nodes.map(n => {
        const childIdx = n.children.findIndex(c => c.id === node.id);
        if (childIdx >= 0) return { ...n, children: [...n.children, dup] };
        return { ...n, children: addToParent(n.children) };
      });
    };
    // check root level
    if (data.some(n => n.id === node.id)) {
      setData(prev => [...prev, dup]);
    } else {
      setData(prev => addToParent(prev));
    }
  };

  const handleSave = (formData: Partial<LocationNode>) => {
    if (dialogMode === "add") {
      const newNode: LocationNode = {
        id: genId(), code: formData.code || "", name: formData.name || "",
        type: dialogNodeType, status: (formData.status as Status) || "active",
        description: formData.description, capacity: formData.capacity, currentLoad: formData.currentLoad || 0,
        barcode: formData.barcode, weightLimit: formData.weightLimit, dimensions: formData.dimensions,
        temperature: formData.temperature, isHazardous: formData.isHazardous, children: [],
      };
      if (dialogParentId) {
        setData(prev => addChild(prev, dialogParentId!, newNode));
      } else {
        setData(prev => [...prev, newNode]);
      }
    } else if (editingNode) {
      setData(prev => updateNode(prev, editingNode.id, formData));
    }
    setDialogOpen(false);
  };

  // Flat view collector
  const flatNodes: (LocationNode & { path: string })[] = [];
  const collectFlat = (nodes: LocationNode[], path: string) => {
    nodes.forEach(n => {
      flatNodes.push({ ...n, path: path ? `${path} > ${n.name}` : n.name });
      collectFlat(n.children, path ? `${path} > ${n.name}` : n.name);
    });
  };
  collectFlat(filtered, "");
  const filteredFlat = filterStatus === "all" ? flatNodes : flatNodes.filter(n => n.status === filterStatus);

  // Stats
  const totalWarehouses = flatCount(data, "warehouse");
  const totalZones = flatCount(data, "zone");
  const totalRacks = flatCount(data, "rack");
  const totalBins = flatCount(data, "bin");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shelves, Racks & Bins</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage warehouse storage locations hierarchy</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" /> Import</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
          <Button size="sm" onClick={handleAddRoot}><Plus className="h-4 w-4 mr-1" /> Add Warehouse</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Warehouses", count: totalWarehouses, icon: Warehouse, cls: "kpi-card-primary" },
          { label: "Zones", count: totalZones, icon: LayoutGrid, cls: "kpi-card-success" },
          { label: "Racks", count: totalRacks, icon: Grid3X3, cls: "kpi-card-warning" },
          { label: "Bins", count: totalBins, icon: Box, cls: "kpi-card-destructive" },
        ].map(s => (
          <div key={s.label} className={`kpi-card ${s.cls}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.count}</p>
              </div>
              <s.icon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or code..." className="pl-9" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
              <Button variant={viewMode === "tree" ? "secondary" : "ghost"} size="sm" className="h-8 px-3" onClick={() => setViewMode("tree")}>
                <Layers className="h-4 w-4 mr-1" /> Tree
              </Button>
              <Button variant={viewMode === "flat" ? "secondary" : "ghost"} size="sm" className="h-8 px-3" onClick={() => setViewMode("flat")}>
                <LayoutGrid className="h-4 w-4 mr-1" /> Flat
              </Button>
            </div>
            {viewMode === "tree" && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={expandAll}>Expand All</Button>
                <Button variant="ghost" size="sm" onClick={collapseAll}>Collapse All</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="min-w-[350px]">Location</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[90px]">Type</TableHead>
                <TableHead className="w-[160px]">Utilization</TableHead>
                <TableHead className="w-[120px]">Load / Cap</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewMode === "tree" ? (
                filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No locations found</TableCell></TableRow>
                ) : (
                  filtered.map(node => (
                    <TreeRow key={node.id} node={node} depth={0} expanded={expanded}
                      onToggle={toggleExpand} onAddChild={handleAddChild} onEdit={handleEdit}
                      onDelete={handleDelete} onDuplicate={handleDuplicate} />
                  ))
                )
              ) : (
                filteredFlat.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No locations found</TableCell></TableRow>
                ) : (
                  filteredFlat.map(node => {
                    const cfg = typeConfig[node.type];
                    const Icon = cfg.icon;
                    const stCfg = statusConfig[node.status];
                    const util = node.capacity ? Math.round(((node.currentLoad || 0) / node.capacity) * 100) : 0;
                    return (
                      <TableRow key={node.id} className="hover:bg-secondary/40">
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md ${cfg.color}`}><Icon className="h-4 w-4" /></div>
                            <div>
                              <span className="font-medium text-foreground text-sm">{node.name}</span>
                              <span className="ml-2 text-xs text-muted-foreground font-mono">{node.code}</span>
                              <p className="text-xs text-muted-foreground">{node.path}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={stCfg.variant} className="text-xs">{stCfg.label}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{cfg.label}</TableCell>
                        <TableCell>
                          {node.capacity ? (
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${util >= 90 ? "bg-destructive" : util >= 70 ? "bg-[hsl(var(--warning))]" : "bg-primary"}`} style={{ width: `${util}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{util}%</span>
                            </div>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {node.capacity ? `${node.currentLoad || 0} / ${node.capacity}` : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(node)}><Edit2 className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(node.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Form Dialog */}
      <LocationFormDialog
        open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave}
        initial={editingNode} mode={dialogMode} nodeType={dialogNodeType}
      />
    </div>
  );
}
