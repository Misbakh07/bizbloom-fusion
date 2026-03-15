import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Plus, Search, MoreHorizontal, Edit2, Trash2, Copy, GripVertical,
  Tag, Palette, Ruler, Factory, Award, Layers, Settings2, Filter,
  ChevronDown, ChevronRight, X, Check, AlertCircle, List, LayoutGrid,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ──────────────────────────────────────────────────────────
interface AttributeValue {
  id: string;
  value: string;
  code: string;
  colorHex?: string;
  sortOrder: number;
  isActive: boolean;
}

interface Attribute {
  id: string;
  name: string;
  code: string;
  type: "text" | "number" | "select" | "multi-select" | "color" | "boolean" | "range";
  category: string;
  description: string;
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  showOnPDP: boolean;
  isActive: boolean;
  values: AttributeValue[];
  unit?: string;
  validationRegex?: string;
  createdAt: string;
}

interface AttributeGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  attributeIds: string[];
}

// ─── Seed Data ──────────────────────────────────────────────────────
const defaultAttributes: Attribute[] = [
  {
    id: "attr-1", name: "Brand", code: "BRAND", type: "select", category: "General",
    description: "Product brand or manufacturer brand name",
    isRequired: true, isFilterable: true, isSearchable: true, showOnPDP: true, isActive: true,
    values: [
      { id: "v1", value: "Samsung", code: "SAMSUNG", sortOrder: 1, isActive: true },
      { id: "v2", value: "Apple", code: "APPLE", sortOrder: 2, isActive: true },
      { id: "v3", value: "Sony", code: "SONY", sortOrder: 3, isActive: true },
      { id: "v4", value: "LG", code: "LG", sortOrder: 4, isActive: true },
      { id: "v5", value: "Dell", code: "DELL", sortOrder: 5, isActive: true },
    ],
    createdAt: "2025-01-15",
  },
  {
    id: "attr-2", name: "Color", code: "COLOR", type: "color", category: "Appearance",
    description: "Product color with visual swatch",
    isRequired: false, isFilterable: true, isSearchable: false, showOnPDP: true, isActive: true,
    values: [
      { id: "c1", value: "Black", code: "BLK", colorHex: "#000000", sortOrder: 1, isActive: true },
      { id: "c2", value: "White", code: "WHT", colorHex: "#FFFFFF", sortOrder: 2, isActive: true },
      { id: "c3", value: "Red", code: "RED", colorHex: "#EF4444", sortOrder: 3, isActive: true },
      { id: "c4", value: "Blue", code: "BLU", colorHex: "#3B82F6", sortOrder: 4, isActive: true },
      { id: "c5", value: "Green", code: "GRN", colorHex: "#22C55E", sortOrder: 5, isActive: true },
      { id: "c6", value: "Silver", code: "SLV", colorHex: "#C0C0C0", sortOrder: 6, isActive: true },
    ],
    createdAt: "2025-01-15",
  },
  {
    id: "attr-3", name: "Size", code: "SIZE", type: "select", category: "Dimensions",
    description: "Standard product sizing",
    isRequired: false, isFilterable: true, isSearchable: false, showOnPDP: true, isActive: true,
    values: [
      { id: "s1", value: "XS", code: "XS", sortOrder: 1, isActive: true },
      { id: "s2", value: "S", code: "S", sortOrder: 2, isActive: true },
      { id: "s3", value: "M", code: "M", sortOrder: 3, isActive: true },
      { id: "s4", value: "L", code: "L", sortOrder: 4, isActive: true },
      { id: "s5", value: "XL", code: "XL", sortOrder: 5, isActive: true },
      { id: "s6", value: "XXL", code: "XXL", sortOrder: 6, isActive: true },
    ],
    createdAt: "2025-01-16",
  },
  {
    id: "attr-4", name: "Manufacturer", code: "MFR", type: "select", category: "General",
    description: "Product manufacturer / OEM",
    isRequired: false, isFilterable: true, isSearchable: true, showOnPDP: true, isActive: true,
    values: [
      { id: "m1", value: "Foxconn", code: "FOXCONN", sortOrder: 1, isActive: true },
      { id: "m2", value: "Flex Ltd", code: "FLEX", sortOrder: 2, isActive: true },
      { id: "m3", value: "Jabil", code: "JABIL", sortOrder: 3, isActive: true },
    ],
    createdAt: "2025-01-17",
  },
  {
    id: "attr-5", name: "Material", code: "MAT", type: "multi-select", category: "Specifications",
    description: "Primary material composition",
    isRequired: false, isFilterable: true, isSearchable: false, showOnPDP: true, isActive: true,
    values: [
      { id: "mt1", value: "Steel", code: "STEEL", sortOrder: 1, isActive: true },
      { id: "mt2", value: "Aluminum", code: "ALUM", sortOrder: 2, isActive: true },
      { id: "mt3", value: "Plastic", code: "PLSTC", sortOrder: 3, isActive: true },
      { id: "mt4", value: "Glass", code: "GLASS", sortOrder: 4, isActive: true },
      { id: "mt5", value: "Wood", code: "WOOD", sortOrder: 5, isActive: true },
    ],
    createdAt: "2025-01-18",
  },
  {
    id: "attr-6", name: "Weight", code: "WEIGHT", type: "number", category: "Dimensions",
    description: "Product weight", unit: "kg",
    isRequired: false, isFilterable: false, isSearchable: false, showOnPDP: true, isActive: true,
    values: [], createdAt: "2025-01-18",
  },
  {
    id: "attr-7", name: "Warranty", code: "WARRANTY", type: "select", category: "General",
    description: "Warranty period",
    isRequired: false, isFilterable: true, isSearchable: false, showOnPDP: true, isActive: true,
    values: [
      { id: "w1", value: "No Warranty", code: "NONE", sortOrder: 1, isActive: true },
      { id: "w2", value: "6 Months", code: "6M", sortOrder: 2, isActive: true },
      { id: "w3", value: "1 Year", code: "1Y", sortOrder: 3, isActive: true },
      { id: "w4", value: "2 Years", code: "2Y", sortOrder: 4, isActive: true },
      { id: "w5", value: "3 Years", code: "3Y", sortOrder: 5, isActive: true },
    ],
    createdAt: "2025-01-19",
  },
  {
    id: "attr-8", name: "Is Fragile", code: "FRAGILE", type: "boolean", category: "Handling",
    description: "Indicates if the product requires fragile handling",
    isRequired: false, isFilterable: true, isSearchable: false, showOnPDP: false, isActive: true,
    values: [], createdAt: "2025-01-20",
  },
];

const defaultGroups: AttributeGroup[] = [
  { id: "grp-1", name: "General Information", code: "GEN", description: "Basic product attributes", sortOrder: 1, isActive: true, attributeIds: ["attr-1", "attr-4", "attr-7"] },
  { id: "grp-2", name: "Physical Properties", code: "PHYS", description: "Size, weight, material attributes", sortOrder: 2, isActive: true, attributeIds: ["attr-3", "attr-5", "attr-6", "attr-8"] },
  { id: "grp-3", name: "Visual Properties", code: "VIS", description: "Color and appearance attributes", sortOrder: 3, isActive: true, attributeIds: ["attr-2"] },
];

const categories = ["General", "Appearance", "Dimensions", "Specifications", "Handling", "Compliance", "Custom"];
const attrTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Single Select" },
  { value: "multi-select", label: "Multi Select" },
  { value: "color", label: "Color Swatch" },
  { value: "boolean", label: "Yes / No" },
  { value: "range", label: "Range" },
];

const typeIcons: Record<string, React.ReactNode> = {
  text: <Tag className="h-3.5 w-3.5" />,
  number: <Ruler className="h-3.5 w-3.5" />,
  select: <List className="h-3.5 w-3.5" />,
  "multi-select": <Layers className="h-3.5 w-3.5" />,
  color: <Palette className="h-3.5 w-3.5" />,
  boolean: <Check className="h-3.5 w-3.5" />,
  range: <Ruler className="h-3.5 w-3.5" />,
};

// ─── Component ──────────────────────────────────────────────────────
const ProductAttributes: React.FC = () => {
  const { toast } = useToast();
  const [attributes, setAttributes] = useState<Attribute[]>(defaultAttributes);
  const [groups, setGroups] = useState<AttributeGroup[]>(defaultGroups);
  const [mainTab, setMainTab] = useState("attributes");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showValueDialog, setShowValueDialog] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [editingGroup, setEditingGroup] = useState<AttributeGroup | null>(null);
  const [expandedAttr, setExpandedAttr] = useState<string | null>(null);

  // ─── Attribute form state
  const emptyAttr: Omit<Attribute, "id" | "createdAt"> = {
    name: "", code: "", type: "text", category: "General", description: "",
    isRequired: false, isFilterable: false, isSearchable: false, showOnPDP: true,
    isActive: true, values: [], unit: "",
  };
  const [formData, setFormData] = useState<Omit<Attribute, "id" | "createdAt">>(emptyAttr);
  const [formTab, setFormTab] = useState("general");

  // ─── Value form state
  const [valueForm, setValueForm] = useState<Omit<AttributeValue, "id">>({ value: "", code: "", sortOrder: 0, isActive: true });
  const [editingValueId, setEditingValueId] = useState<string | null>(null);

  // ─── Group form state
  const emptyGroup: Omit<AttributeGroup, "id"> = { name: "", code: "", description: "", sortOrder: 0, isActive: true, attributeIds: [] };
  const [groupForm, setGroupForm] = useState<Omit<AttributeGroup, "id">>(emptyGroup);

  // ─── Filters
  const filtered = attributes.filter((a) => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || a.category === filterCategory;
    const matchType = filterType === "all" || a.type === filterType;
    return matchSearch && matchCat && matchType;
  });

  // ─── KPI
  const totalAttrs = attributes.length;
  const activeAttrs = attributes.filter((a) => a.isActive).length;
  const totalValues = attributes.reduce((s, a) => s + a.values.length, 0);
  const filterableCount = attributes.filter((a) => a.isFilterable).length;

  // ─── Handlers
  const openAddAttr = () => {
    setEditingAttr(null);
    setFormData(emptyAttr);
    setFormTab("general");
    setShowDialog(true);
  };

  const openEditAttr = (attr: Attribute) => {
    setEditingAttr(attr);
    setFormData({ name: attr.name, code: attr.code, type: attr.type, category: attr.category, description: attr.description, isRequired: attr.isRequired, isFilterable: attr.isFilterable, isSearchable: attr.isSearchable, showOnPDP: attr.showOnPDP, isActive: attr.isActive, values: [...attr.values], unit: attr.unit });
    setFormTab("general");
    setShowDialog(true);
  };

  const saveAttr = () => {
    if (!formData.name || !formData.code) {
      toast({ title: "Validation Error", description: "Name and Code are required", variant: "destructive" });
      return;
    }
    if (editingAttr) {
      setAttributes((prev) => prev.map((a) => a.id === editingAttr.id ? { ...a, ...formData } : a));
      toast({ title: "Attribute Updated", description: `"${formData.name}" has been updated` });
    } else {
      const newAttr: Attribute = { ...formData, id: `attr-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) };
      setAttributes((prev) => [...prev, newAttr]);
      toast({ title: "Attribute Created", description: `"${formData.name}" has been created` });
    }
    setShowDialog(false);
  };

  const deleteAttr = (id: string) => {
    setAttributes((prev) => prev.filter((a) => a.id !== id));
    setGroups((prev) => prev.map((g) => ({ ...g, attributeIds: g.attributeIds.filter((aid) => aid !== id) })));
    toast({ title: "Attribute Deleted" });
  };

  const duplicateAttr = (attr: Attribute) => {
    const dup: Attribute = { ...attr, id: `attr-${Date.now()}`, name: `${attr.name} (Copy)`, code: `${attr.code}_COPY`, values: attr.values.map((v) => ({ ...v, id: `v-${Date.now()}-${Math.random()}` })) };
    setAttributes((prev) => [...prev, dup]);
    toast({ title: "Attribute Duplicated" });
  };

  // ─── Value handlers
  const openAddValue = () => {
    setEditingValueId(null);
    setValueForm({ value: "", code: "", sortOrder: formData.values.length + 1, isActive: true });
    setShowValueDialog(true);
  };

  const openEditValue = (v: AttributeValue) => {
    setEditingValueId(v.id);
    setValueForm({ value: v.value, code: v.code, colorHex: v.colorHex, sortOrder: v.sortOrder, isActive: v.isActive });
    setShowValueDialog(true);
  };

  const saveValue = () => {
    if (!valueForm.value || !valueForm.code) {
      toast({ title: "Validation Error", description: "Value and Code are required", variant: "destructive" });
      return;
    }
    if (editingValueId) {
      setFormData((prev) => ({ ...prev, values: prev.values.map((v) => v.id === editingValueId ? { ...v, ...valueForm } : v) }));
    } else {
      setFormData((prev) => ({ ...prev, values: [...prev.values, { ...valueForm, id: `v-${Date.now()}` }] }));
    }
    setShowValueDialog(false);
  };

  const deleteValue = (vid: string) => {
    setFormData((prev) => ({ ...prev, values: prev.values.filter((v) => v.id !== vid) }));
  };

  // ─── Group handlers
  const openAddGroup = () => {
    setEditingGroup(null);
    setGroupForm(emptyGroup);
    setShowGroupDialog(true);
  };

  const openEditGroup = (g: AttributeGroup) => {
    setEditingGroup(g);
    setGroupForm({ name: g.name, code: g.code, description: g.description, sortOrder: g.sortOrder, isActive: g.isActive, attributeIds: [...g.attributeIds] });
    setShowGroupDialog(true);
  };

  const saveGroup = () => {
    if (!groupForm.name || !groupForm.code) {
      toast({ title: "Validation Error", description: "Name and Code are required", variant: "destructive" });
      return;
    }
    if (editingGroup) {
      setGroups((prev) => prev.map((g) => g.id === editingGroup.id ? { ...g, ...groupForm } : g));
      toast({ title: "Group Updated" });
    } else {
      setGroups((prev) => [...prev, { ...groupForm, id: `grp-${Date.now()}` }]);
      toast({ title: "Group Created" });
    }
    setShowGroupDialog(false);
  };

  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    toast({ title: "Group Deleted" });
  };

  const toggleGroupAttr = (attrId: string) => {
    setGroupForm((prev) => ({
      ...prev,
      attributeIds: prev.attributeIds.includes(attrId)
        ? prev.attributeIds.filter((id) => id !== attrId)
        : [...prev.attributeIds, attrId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Product Attributes</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage attributes, values, and attribute groups for your products</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Attributes", value: totalAttrs, icon: <Tag className="h-4 w-4" />, color: "text-primary" },
          { label: "Active", value: activeAttrs, icon: <Check className="h-4 w-4" />, color: "text-accent" },
          { label: "Total Values", value: totalValues, icon: <Layers className="h-4 w-4" />, color: "text-warning" },
          { label: "Filterable", value: filterableCount, icon: <Filter className="h-4 w-4" />, color: "text-primary" },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-secondary ${kpi.color}`}>{kpi.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="attributes" className="gap-1.5"><Tag className="h-3.5 w-3.5" />Attributes</TabsTrigger>
          <TabsTrigger value="groups" className="gap-1.5"><Layers className="h-3.5 w-3.5" />Attribute Groups</TabsTrigger>
        </TabsList>

        {/* ─── ATTRIBUTES TAB ─── */}
        <TabsContent value="attributes" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search attributes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64 bg-secondary border-border" />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40 bg-secondary border-border"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 bg-secondary border-border"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {attrTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={openAddAttr} className="gap-1.5"><Plus className="h-4 w-4" />Add Attribute</Button>
          </div>

          {/* Attributes List */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No attributes found</CardContent></Card>
            ) : (
              filtered.map((attr) => (
                <Card key={attr.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-0">
                    {/* Attribute Header Row */}
                    <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpandedAttr(expandedAttr === attr.id ? null : attr.id)}>
                      <div className="text-muted-foreground">
                        {expandedAttr === attr.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                      <div className="p-1.5 rounded bg-secondary text-muted-foreground">{typeIcons[attr.type]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{attr.name}</span>
                          <Badge variant="outline" className="text-xs font-mono border-border">{attr.code}</Badge>
                          <Badge variant="secondary" className="text-xs">{attr.category}</Badge>
                          {attr.isRequired && <Badge className="text-xs bg-destructive/20 text-destructive border-0">Required</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{attr.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-1.5">
                          {attr.isFilterable && (
                            <Tooltip><TooltipTrigger><Badge variant="outline" className="text-xs border-border"><Filter className="h-3 w-3 mr-1" />Filterable</Badge></TooltipTrigger><TooltipContent>Can be used as a product filter</TooltipContent></Tooltip>
                          )}
                          {attr.isSearchable && (
                            <Badge variant="outline" className="text-xs border-border"><Search className="h-3 w-3 mr-1" />Searchable</Badge>
                          )}
                          {attr.values.length > 0 && (
                            <Badge variant="secondary" className="text-xs">{attr.values.length} values</Badge>
                          )}
                        </div>
                        <Badge variant={attr.isActive ? "default" : "secondary"} className={`text-xs ${attr.isActive ? "bg-accent/20 text-accent border-0" : ""}`}>
                          {attr.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditAttr(attr)}><Edit2 className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateAttr(attr)}><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteAttr(attr.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Expanded Values */}
                    {expandedAttr === attr.id && attr.values.length > 0 && (
                      <div className="border-t border-border px-4 py-3 bg-secondary/30">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Attribute Values</p>
                        <div className="flex flex-wrap gap-2">
                          {attr.values.filter((v) => v.isActive).map((v) => (
                            <Badge key={v.id} variant="outline" className="gap-1.5 border-border py-1 px-2.5">
                              {attr.type === "color" && v.colorHex && (
                                <span className="h-3 w-3 rounded-full border border-border inline-block" style={{ backgroundColor: v.colorHex }} />
                              )}
                              {v.value}
                              <span className="text-muted-foreground font-mono text-[10px]">({v.code})</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {expandedAttr === attr.id && attr.type === "boolean" && (
                      <div className="border-t border-border px-4 py-3 bg-secondary/30">
                        <p className="text-xs text-muted-foreground">Boolean attribute — values: <span className="text-foreground font-medium">Yes / No</span></p>
                      </div>
                    )}
                    {expandedAttr === attr.id && attr.type === "number" && (
                      <div className="border-t border-border px-4 py-3 bg-secondary/30">
                        <p className="text-xs text-muted-foreground">Numeric input{attr.unit ? <> — Unit: <span className="text-foreground font-medium">{attr.unit}</span></> : null}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ─── GROUPS TAB ─── */}
        <TabsContent value="groups" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Organize attributes into logical groups for product forms</p>
            <Button onClick={openAddGroup} className="gap-1.5"><Plus className="h-4 w-4" />Add Group</Button>
          </div>

          <div className="space-y-3">
            {groups.map((grp) => {
              const grpAttrs = attributes.filter((a) => grp.attributeIds.includes(a.id));
              return (
                <Card key={grp.id} className="bg-card border-border">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {grp.name}
                        <Badge variant="outline" className="font-mono text-xs border-border">{grp.code}</Badge>
                        <Badge variant={grp.isActive ? "default" : "secondary"} className={`text-xs ${grp.isActive ? "bg-accent/20 text-accent border-0" : ""}`}>
                          {grp.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      {grp.description && <p className="text-xs text-muted-foreground mt-1">{grp.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditGroup(grp)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteGroup(grp.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {grpAttrs.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No attributes assigned</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {grpAttrs.map((a) => (
                          <Badge key={a.id} variant="secondary" className="gap-1.5 py-1">
                            {typeIcons[a.type]}
                            {a.name}
                            {a.values.length > 0 && <span className="text-muted-foreground text-[10px]">({a.values.length})</span>}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── ATTRIBUTE DIALOG ─── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingAttr ? "Edit Attribute" : "New Attribute"}</DialogTitle>
          </DialogHeader>
          <Tabs value={formTab} onValueChange={setFormTab}>
            <TabsList className="bg-secondary w-full justify-start">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="values">Values ({formData.values.length})</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Name <span className="text-destructive">*</span></Label>
                  <Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value, code: !editingAttr ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 10) : p.code }))} className="bg-secondary border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label>Code <span className="text-destructive">*</span></Label>
                  <Input value={formData.code} onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))} className="bg-secondary border-border font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v: Attribute["type"]) => setFormData((p) => ({ ...p, type: v }))}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {attrTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.type === "number" && (
                <div className="space-y-1.5">
                  <Label>Unit (optional)</Label>
                  <Input value={formData.unit || ""} onChange={(e) => setFormData((p) => ({ ...p, unit: e.target.value }))} placeholder="e.g. kg, cm, pcs" className="bg-secondary border-border" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} className="bg-secondary border-border resize-none" rows={2} />
              </div>
            </TabsContent>

            <TabsContent value="values" className="space-y-4 mt-4">
              {["select", "multi-select", "color"].includes(formData.type) ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Define the allowed values for this attribute</p>
                    <Button size="sm" onClick={openAddValue} className="gap-1"><Plus className="h-3.5 w-3.5" />Add Value</Button>
                  </div>
                  {formData.values.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">No values defined yet</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="w-8">#</TableHead>
                          {formData.type === "color" && <TableHead className="w-10">Swatch</TableHead>}
                          <TableHead>Value</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead className="w-16">Active</TableHead>
                          <TableHead className="w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.values.sort((a, b) => a.sortOrder - b.sortOrder).map((v, i) => (
                          <TableRow key={v.id} className="border-border">
                            <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                            {formData.type === "color" && (
                              <TableCell>
                                {v.colorHex && <span className="h-5 w-5 rounded-full border border-border inline-block" style={{ backgroundColor: v.colorHex }} />}
                              </TableCell>
                            )}
                            <TableCell className="font-medium text-foreground">{v.value}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">{v.code}</TableCell>
                            <TableCell>{v.isActive ? <Check className="h-4 w-4 text-accent" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditValue(v)}><Edit2 className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteValue(v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Values are only applicable for <strong>Select</strong>, <strong>Multi Select</strong>, and <strong>Color</strong> attribute types.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              {[
                { key: "isRequired" as const, label: "Required", desc: "This attribute must be filled when creating a product" },
                { key: "isFilterable" as const, label: "Filterable", desc: "Allow customers to filter products by this attribute" },
                { key: "isSearchable" as const, label: "Searchable", desc: "Include this attribute in search indexes" },
                { key: "showOnPDP" as const, label: "Show on Product Page", desc: "Display this attribute on the product detail page" },
                { key: "isActive" as const, label: "Active", desc: "Only active attributes are available for product assignment" },
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <Switch checked={formData[s.key]} onCheckedChange={(v) => setFormData((p) => ({ ...p, [s.key]: v }))} />
                </div>
              ))}
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={saveAttr}>{editingAttr ? "Update" : "Create"} Attribute</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── VALUE DIALOG ─── */}
      <Dialog open={showValueDialog} onOpenChange={setShowValueDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingValueId ? "Edit Value" : "Add Value"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Value <span className="text-destructive">*</span></Label>
              <Input value={valueForm.value} onChange={(e) => setValueForm((p) => ({ ...p, value: e.target.value, code: !editingValueId ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) : p.code }))} className="bg-secondary border-border" />
            </div>
            <div className="space-y-1.5">
              <Label>Code <span className="text-destructive">*</span></Label>
              <Input value={valueForm.code} onChange={(e) => setValueForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} className="bg-secondary border-border font-mono" />
            </div>
            {formData.type === "color" && (
              <div className="space-y-1.5">
                <Label>Color Hex</Label>
                <div className="flex gap-2">
                  <Input type="color" value={valueForm.colorHex || "#000000"} onChange={(e) => setValueForm((p) => ({ ...p, colorHex: e.target.value }))} className="w-12 h-10 p-1 bg-secondary border-border" />
                  <Input value={valueForm.colorHex || ""} onChange={(e) => setValueForm((p) => ({ ...p, colorHex: e.target.value }))} placeholder="#000000" className="bg-secondary border-border font-mono" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" value={valueForm.sortOrder} onChange={(e) => setValueForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} className="bg-secondary border-border" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={valueForm.isActive} onCheckedChange={(v) => setValueForm((p) => ({ ...p, isActive: v }))} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValueDialog(false)}>Cancel</Button>
            <Button onClick={saveValue}>{editingValueId ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── GROUP DIALOG ─── */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edit Group" : "New Attribute Group"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Group Name <span className="text-destructive">*</span></Label>
                <Input value={groupForm.name} onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value, code: !editingGroup ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) : p.code }))} className="bg-secondary border-border" />
              </div>
              <div className="space-y-1.5">
                <Label>Code <span className="text-destructive">*</span></Label>
                <Input value={groupForm.code} onChange={(e) => setGroupForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} className="bg-secondary border-border font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={groupForm.description} onChange={(e) => setGroupForm((p) => ({ ...p, description: e.target.value }))} className="bg-secondary border-border resize-none" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" value={groupForm.sortOrder} onChange={(e) => setGroupForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} className="bg-secondary border-border" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={groupForm.isActive} onCheckedChange={(v) => setGroupForm((p) => ({ ...p, isActive: v }))} />
                <Label>Active</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assign Attributes</Label>
              <div className="border border-border rounded-lg divide-y divide-border max-h-52 overflow-y-auto">
                {attributes.map((a) => (
                  <label key={a.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={groupForm.attributeIds.includes(a.id)}
                      onChange={() => toggleGroupAttr(a.id)}
                      className="rounded border-border"
                    />
                    <div className="p-1 rounded bg-secondary text-muted-foreground">{typeIcons[a.type]}</div>
                    <span className="text-sm text-foreground">{a.name}</span>
                    <Badge variant="outline" className="ml-auto text-[10px] font-mono border-border">{a.code}</Badge>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupDialog(false)}>Cancel</Button>
            <Button onClick={saveGroup}>{editingGroup ? "Update" : "Create"} Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductAttributes;
