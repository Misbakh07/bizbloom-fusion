import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Plus, Edit2, Trash2, ChevronRight, ChevronDown, FolderOpen,
  Folder, Package, Layers, BarChart3, Download, Upload, Copy,
  ChevronsDownUp, ChevronsUpDown, GripVertical
} from "lucide-react";

// ─── Types ───
type GroupStatus = "active" | "inactive";

interface InventoryGroup {
  id: string;
  code: string;
  name: string;
  description: string;
  parentId: string | null;
  status: GroupStatus;
  sortOrder: number;
  taxCategory: string;
  defaultUom: string;
  marginPercent: number;
  costingMethod: string;
  trackBatch: boolean;
  trackSerial: boolean;
  children: InventoryGroup[];
}

const initialGroups: InventoryGroup[] = [
  {
    id: "1", code: "AUTO", name: "Automotive Parts", description: "All automotive parts and accessories",
    parentId: null, status: "active", sortOrder: 1, taxCategory: "Standard 5%", defaultUom: "Piece",
    marginPercent: 35, costingMethod: "FIFO", trackBatch: false, trackSerial: true,
    children: [
      {
        id: "1-1", code: "AUTO-ENG", name: "Engine Parts", description: "Engine components and assemblies",
        parentId: "1", status: "active", sortOrder: 1, taxCategory: "Standard 5%", defaultUom: "Piece",
        marginPercent: 30, costingMethod: "FIFO", trackBatch: false, trackSerial: true,
        children: [
          { id: "1-1-1", code: "AUTO-ENG-FIL", name: "Filters", description: "Oil, air, fuel filters", parentId: "1-1", status: "active", sortOrder: 1, taxCategory: "Standard 5%", defaultUom: "Piece", marginPercent: 40, costingMethod: "FIFO", trackBatch: true, trackSerial: false, children: [] },
          { id: "1-1-2", code: "AUTO-ENG-BLT", name: "Belts & Hoses", description: "Timing belts, serpentine belts, radiator hoses", parentId: "1-1", status: "active", sortOrder: 2, taxCategory: "Standard 5%", defaultUom: "Piece", marginPercent: 38, costingMethod: "FIFO", trackBatch: false, trackSerial: false, children: [] },
          { id: "1-1-3", code: "AUTO-ENG-GSK", name: "Gaskets & Seals", description: "Head gaskets, valve seals", parentId: "1-1", status: "active", sortOrder: 3, taxCategory: "Standard 5%", defaultUom: "Piece", marginPercent: 45, costingMethod: "FIFO", trackBatch: false, trackSerial: false, children: [] },
        ]
      },
      {
        id: "1-2", code: "AUTO-BRK", name: "Braking System", description: "Brake pads, rotors, calipers",
        parentId: "1", status: "active", sortOrder: 2, taxCategory: "Standard 5%", defaultUom: "Set",
        marginPercent: 32, costingMethod: "FIFO", trackBatch: true, trackSerial: true,
        children: [
          { id: "1-2-1", code: "AUTO-BRK-PAD", name: "Brake Pads", description: "Front and rear brake pads", parentId: "1-2", status: "active", sortOrder: 1, taxCategory: "Standard 5%", defaultUom: "Set", marginPercent: 35, costingMethod: "FIFO", trackBatch: true, trackSerial: false, children: [] },
          { id: "1-2-2", code: "AUTO-BRK-ROT", name: "Rotors & Discs", description: "Brake rotors and discs", parentId: "1-2", status: "active", sortOrder: 2, taxCategory: "Standard 5%", defaultUom: "Piece", marginPercent: 30, costingMethod: "FIFO", trackBatch: false, trackSerial: true, children: [] },
        ]
      },
      {
        id: "1-3", code: "AUTO-SUS", name: "Suspension & Steering", description: "Shocks, struts, tie rods",
        parentId: "1", status: "active", sortOrder: 3, taxCategory: "Standard 5%", defaultUom: "Piece",
        marginPercent: 28, costingMethod: "FIFO", trackBatch: false, trackSerial: true, children: []
      },
    ]
  },
  {
    id: "2", code: "PHARMA", name: "Pharmaceuticals", description: "Medicines and healthcare products",
    parentId: null, status: "active", sortOrder: 2, taxCategory: "Zero Rated", defaultUom: "Box",
    marginPercent: 25, costingMethod: "FEFO", trackBatch: true, trackSerial: false,
    children: [
      { id: "2-1", code: "PHARMA-OTC", name: "Over the Counter", description: "Non-prescription medicines", parentId: "2", status: "active", sortOrder: 1, taxCategory: "Zero Rated", defaultUom: "Box", marginPercent: 30, costingMethod: "FEFO", trackBatch: true, trackSerial: false, children: [] },
      { id: "2-2", code: "PHARMA-RX", name: "Prescription Drugs", description: "Prescription-only medicines", parentId: "2", status: "active", sortOrder: 2, taxCategory: "Zero Rated", defaultUom: "Box", marginPercent: 20, costingMethod: "FEFO", trackBatch: true, trackSerial: true, children: [] },
      { id: "2-3", code: "PHARMA-SUP", name: "Supplements", description: "Vitamins and dietary supplements", parentId: "2", status: "active", sortOrder: 3, taxCategory: "Standard 5%", defaultUom: "Bottle", marginPercent: 40, costingMethod: "FEFO", trackBatch: true, trackSerial: false, children: [] },
    ]
  },
  {
    id: "3", code: "ELEC", name: "Electronics", description: "Electronic devices and components",
    parentId: null, status: "active", sortOrder: 3, taxCategory: "Standard 5%", defaultUom: "Piece",
    marginPercent: 22, costingMethod: "Weighted Avg", trackBatch: false, trackSerial: true,
    children: [
      { id: "3-1", code: "ELEC-MOB", name: "Mobile & Tablets", description: "Smartphones and tablets", parentId: "3", status: "active", sortOrder: 1, taxCategory: "Standard 5%", defaultUom: "Piece", marginPercent: 18, costingMethod: "Weighted Avg", trackBatch: false, trackSerial: true, children: [] },
      { id: "3-2", code: "ELEC-ACC", name: "Accessories", description: "Chargers, cases, cables", parentId: "3", status: "active", sortOrder: 2, taxCategory: "Standard 5%", defaultUom: "Piece", marginPercent: 50, costingMethod: "Weighted Avg", trackBatch: false, trackSerial: false, children: [] },
    ]
  },
  {
    id: "4", code: "FMCG", name: "FMCG", description: "Fast-moving consumer goods",
    parentId: null, status: "active", sortOrder: 4, taxCategory: "Standard 5%", defaultUom: "Unit",
    marginPercent: 15, costingMethod: "FIFO", trackBatch: true, trackSerial: false,
    children: []
  },
  {
    id: "5", code: "RAW", name: "Raw Materials", description: "Raw materials for manufacturing",
    parentId: null, status: "inactive", sortOrder: 5, taxCategory: "Standard 5%", defaultUom: "KG",
    marginPercent: 10, costingMethod: "Standard", trackBatch: true, trackSerial: false,
    children: []
  },
];

const emptyGroup: Omit<InventoryGroup, "id" | "children"> = {
  code: "", name: "", description: "", parentId: null, status: "active", sortOrder: 0,
  taxCategory: "Standard 5%", defaultUom: "Piece", marginPercent: 0, costingMethod: "FIFO",
  trackBatch: false, trackSerial: false,
};

// ─── Helpers ───
const countAll = (groups: InventoryGroup[]): number =>
  groups.reduce((s, g) => s + 1 + countAll(g.children), 0);

const countActive = (groups: InventoryGroup[]): number =>
  groups.reduce((s, g) => s + (g.status === "active" ? 1 : 0) + countActive(g.children), 0);

const maxDepth = (groups: InventoryGroup[], d = 1): number =>
  groups.reduce((m, g) => Math.max(m, g.children.length ? maxDepth(g.children, d + 1) : d), 0);

const flattenGroups = (groups: InventoryGroup[], depth = 0): { group: InventoryGroup; depth: number; path: string }[] =>
  groups.flatMap(g => [
    { group: g, depth, path: g.code },
    ...flattenGroups(g.children, depth + 1).map(c => ({ ...c, path: `${g.code} > ${c.path}` })),
  ]);

const filterTree = (groups: InventoryGroup[], q: string): InventoryGroup[] => {
  if (!q) return groups;
  const lq = q.toLowerCase();
  return groups.reduce<InventoryGroup[]>((acc, g) => {
    const childMatches = filterTree(g.children, q);
    const selfMatch = [g.code, g.name, g.description].some(f => f.toLowerCase().includes(lq));
    if (selfMatch || childMatches.length) acc.push({ ...g, children: selfMatch ? g.children : childMatches });
    return acc;
  }, []);
};

const addChild = (groups: InventoryGroup[], parentId: string, child: InventoryGroup): InventoryGroup[] =>
  groups.map(g => g.id === parentId ? { ...g, children: [...g.children, child] } : { ...g, children: addChild(g.children, parentId, child) });

const updateNode = (groups: InventoryGroup[], id: string, data: Partial<InventoryGroup>): InventoryGroup[] =>
  groups.map(g => g.id === id ? { ...g, ...data } : { ...g, children: updateNode(g.children, id, data) });

const removeNode = (groups: InventoryGroup[], id: string): InventoryGroup[] =>
  groups.filter(g => g.id !== id).map(g => ({ ...g, children: removeNode(g.children, id) }));

const duplicateNode = (groups: InventoryGroup[], id: string): InventoryGroup[] => {
  const found = flattenGroups(groups).find(f => f.group.id === id);
  if (!found) return groups;
  const dup: InventoryGroup = { ...found.group, id: crypto.randomUUID(), code: found.group.code + "-COPY", name: found.group.name + " (Copy)", children: [] };
  if (found.group.parentId) return addChild(groups, found.group.parentId, dup);
  return [...groups, dup];
};

const InventoryGroups: React.FC = () => {
  const [groups, setGroups] = useState<InventoryGroup[]>(initialGroups);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["1", "1-1", "2"]));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<InventoryGroup | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<InventoryGroup, "id" | "children">>(emptyGroup);

  const tree = filterTree(groups, search);
  const flat = flattenGroups(groups);
  const stats = { total: countAll(groups), active: countActive(groups), rootGroups: groups.length, depth: maxDepth(groups) };

  const toggle = (id: string) => setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const expandAll = () => setExpanded(new Set(flat.map(f => f.group.id)));
  const collapseAll = () => setExpanded(new Set());

  const openAdd = (pid: string | null) => {
    setEditingGroup(null);
    setParentId(pid);
    setFormData({ ...emptyGroup, parentId: pid });
    setDialogOpen(true);
  };
  const openEdit = (g: InventoryGroup) => {
    setEditingGroup(g);
    setParentId(g.parentId);
    const { id, children, ...rest } = g;
    setFormData(rest);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;
    if (editingGroup) {
      setGroups(prev => updateNode(prev, editingGroup.id, formData));
    } else {
      const newGroup: InventoryGroup = { ...formData, id: crypto.randomUUID(), children: [] };
      if (parentId) {
        setGroups(prev => addChild(prev, parentId, newGroup));
        setExpanded(prev => new Set([...prev, parentId]));
      } else {
        setGroups(prev => [...prev, newGroup]);
      }
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => setGroups(prev => removeNode(prev, id));
  const handleDuplicate = (id: string) => setGroups(prev => duplicateNode(prev, id));

  // ─── Tree Row ───
  const TreeRow: React.FC<{ group: InventoryGroup; depth: number }> = ({ group, depth }) => {
    const hasChildren = group.children.length > 0;
    const isExpanded = expanded.has(group.id);
    const [hovered, setHovered] = useState(false);

    return (
      <>
        <div
          className="flex items-center gap-2 py-2 px-3 border-b border-border/20 hover:bg-secondary/40 transition-colors group"
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />

          {hasChildren ? (
            <button onClick={() => toggle(group.id)} className="p-0.5 rounded hover:bg-secondary">
              {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>
          ) : (
            <span className="w-5" />
          )}

          {hasChildren ? (
            isExpanded ? <FolderOpen className="h-4 w-4 text-primary" /> : <Folder className="h-4 w-4 text-primary/70" />
          ) : (
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
          )}

          <span className="font-mono text-xs text-muted-foreground w-[120px] shrink-0">{group.code}</span>
          <span className="font-medium text-sm text-foreground flex-1">{group.name}</span>

          <span className="text-xs text-muted-foreground w-[80px] hidden lg:block">{group.defaultUom}</span>
          <span className="text-xs text-muted-foreground w-[80px] hidden lg:block">{group.costingMethod}</span>
          <span className="text-xs font-mono text-muted-foreground w-[50px] text-right hidden md:block">{group.marginPercent}%</span>

          <div className="flex items-center gap-1 w-[60px] hidden sm:flex">
            {group.trackBatch && <Badge variant="outline" className="text-[9px] px-1 py-0">Batch</Badge>}
            {group.trackSerial && <Badge variant="outline" className="text-[9px] px-1 py-0">Serial</Badge>}
          </div>

          <Badge variant={group.status === "active" ? "default" : "secondary"} className="text-[10px] w-[60px] justify-center">
            {group.status === "active" ? "Active" : "Inactive"}
          </Badge>

          <div className={`flex items-center gap-0.5 transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`}>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Add Sub-Group" onClick={() => openAdd(group.id)}><Plus className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(group)}><Edit2 className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(group.id)}><Copy className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(group.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
        {isExpanded && group.children.map(child => <TreeRow key={child.id} group={child} depth={depth + 1} />)}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Groups</h1>
          <p className="text-sm text-muted-foreground">Organize products into hierarchical categories and sub-groups</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" />Import</Button>
          <Button size="sm" onClick={() => openAdd(null)}><Plus className="h-4 w-4 mr-1" />Add Root Group</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Groups", value: stats.total, icon: Layers, accent: "border-l-primary" },
          { title: "Active Groups", value: stats.active, icon: Folder, accent: "border-l-[hsl(var(--success))]" },
          { title: "Root Categories", value: stats.rootGroups, icon: FolderOpen, accent: "border-l-[hsl(var(--chart-3))]" },
          { title: "Max Depth", value: `${stats.depth} levels`, icon: BarChart3, accent: "border-l-[hsl(var(--chart-4))]" },
        ].map(kpi => (
          <Card key={kpi.title} className={`glass-card border-l-4 ${kpi.accent}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary"><kpi.icon className="h-5 w-5 text-muted-foreground" /></div>
              <div><p className="text-xs text-muted-foreground">{kpi.title}</p><p className="text-xl font-bold text-foreground">{kpi.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={expandAll}><ChevronsUpDown className="h-4 w-4 mr-1" />Expand All</Button>
        <Button variant="outline" size="sm" onClick={collapseAll}><ChevronsDownUp className="h-4 w-4 mr-1" />Collapse All</Button>
      </div>

      {/* Tree */}
      <Card className="glass-card overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-2 py-2.5 px-3 bg-secondary/50 border-b border-border/40 text-xs font-medium text-muted-foreground">
          <span style={{ width: 36 }} />
          <span className="w-5" />
          <span className="w-4" />
          <span className="w-[120px] shrink-0">Code</span>
          <span className="flex-1">Name</span>
          <span className="w-[80px] hidden lg:block">UOM</span>
          <span className="w-[80px] hidden lg:block">Costing</span>
          <span className="w-[50px] text-right hidden md:block">Margin</span>
          <span className="w-[60px] hidden sm:block">Tracking</span>
          <span className="w-[60px] text-center">Status</span>
          <span className="w-[120px]" />
        </div>
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
          {tree.length > 0 ? (
            tree.map(g => <TreeRow key={g.id} group={g} depth={0} />)
          ) : (
            <div className="py-16 text-center text-muted-foreground">No groups found</div>
          )}
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edit Group" : parentId ? "Add Sub-Group" : "Add Root Group"}</DialogTitle>
            <DialogDescription>
              {parentId && !editingGroup
                ? `Adding under: ${flat.find(f => f.group.id === parentId)?.group.name || ""}`
                : "Fill in the group details below"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Group Code *</Label><Input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} placeholder="AUTO-ENG" /></div>
              <div><Label>Group Name *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Engine Parts" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v as GroupStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Sort Order</Label><Input type="number" value={formData.sortOrder} onChange={e => setFormData(p => ({ ...p, sortOrder: +e.target.value }))} /></div>
              <div><Label>Tax Category</Label><Input value={formData.taxCategory} onChange={e => setFormData(p => ({ ...p, taxCategory: e.target.value }))} /></div>
              <div><Label>Default UOM</Label><Input value={formData.defaultUom} onChange={e => setFormData(p => ({ ...p, defaultUom: e.target.value }))} /></div>
              <div><Label>Margin %</Label><Input type="number" value={formData.marginPercent} onChange={e => setFormData(p => ({ ...p, marginPercent: +e.target.value }))} /></div>
              <div>
                <Label>Costing Method</Label>
                <Select value={formData.costingMethod} onValueChange={v => setFormData(p => ({ ...p, costingMethod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIFO">FIFO</SelectItem>
                    <SelectItem value="LIFO">LIFO</SelectItem>
                    <SelectItem value="FEFO">FEFO</SelectItem>
                    <SelectItem value="Weighted Avg">Weighted Avg</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={formData.trackBatch} onCheckedChange={v => setFormData(p => ({ ...p, trackBatch: v }))} />
                <Label>Track Batch</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.trackSerial} onCheckedChange={v => setFormData(p => ({ ...p, trackSerial: v }))} />
                <Label>Track Serial</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingGroup ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryGroups;
