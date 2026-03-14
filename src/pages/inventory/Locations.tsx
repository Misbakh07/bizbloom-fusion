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
  Search, Plus, Edit2, Trash2, MapPin, Building2, Warehouse, Globe,
  Phone, Mail, Clock, Users, Package, BarChart3, Eye, CheckCircle2,
  XCircle, Copy, MoreHorizontal, Filter, Download, Upload, Navigation
} from "lucide-react";

// ─── Types ───
type LocationType = "headquarters" | "warehouse" | "branch" | "store" | "distribution-center" | "factory";
type LocationStatus = "active" | "inactive" | "under-construction" | "closed";

interface Contact {
  name: string;
  phone: string;
  email: string;
  role: string;
}

interface Location {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  status: LocationStatus;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  manager: string;
  timezone: string;
  currency: string;
  taxId: string;
  operatingHours: string;
  totalArea: number;
  storageCapacity: number;
  currentUtilization: number;
  employeeCount: number;
  contacts: Contact[];
  notes: string;
  isDefault: boolean;
  latitude?: string;
  longitude?: string;
}

const typeConfig: Record<LocationType, { label: string; icon: React.ElementType; color: string }> = {
  headquarters: { label: "Headquarters", icon: Building2, color: "bg-primary/20 text-primary" },
  warehouse: { label: "Warehouse", icon: Warehouse, color: "bg-accent/20 text-accent" },
  branch: { label: "Branch", icon: MapPin, color: "bg-[hsl(var(--chart-3))]/20 text-[hsl(var(--chart-3))]" },
  store: { label: "Retail Store", icon: Package, color: "bg-[hsl(var(--chart-4))]/20 text-[hsl(var(--chart-4))]" },
  "distribution-center": { label: "Distribution Center", icon: Navigation, color: "bg-[hsl(var(--chart-5))]/20 text-[hsl(var(--chart-5))]" },
  factory: { label: "Factory", icon: Building2, color: "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]" },
};

const statusConfig: Record<LocationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  "under-construction": { label: "Under Construction", variant: "outline" },
  closed: { label: "Closed", variant: "destructive" },
};

const initialLocations: Location[] = [
  {
    id: "1", code: "HQ-001", name: "Main Headquarters", type: "headquarters", status: "active",
    address: "123 Business Park, Tower A", city: "Dubai", state: "Dubai", country: "UAE",
    postalCode: "00000", phone: "+971-4-123-4567", email: "hq@company.com", manager: "Ahmed Al-Rashid",
    timezone: "GMT+4", currency: "AED", taxId: "TRN-100234567890003", operatingHours: "Sun-Thu 8:00-17:00",
    totalArea: 5000, storageCapacity: 0, currentUtilization: 85, employeeCount: 120,
    contacts: [{ name: "Ahmed Al-Rashid", phone: "+971-50-123-4567", email: "ahmed@company.com", role: "General Manager" }],
    notes: "Main corporate office", isDefault: true, latitude: "25.2048", longitude: "55.2708"
  },
  {
    id: "2", code: "WH-001", name: "Central Warehouse", type: "warehouse", status: "active",
    address: "Jebel Ali Free Zone, Plot 45", city: "Dubai", state: "Dubai", country: "UAE",
    postalCode: "00000", phone: "+971-4-234-5678", email: "warehouse@company.com", manager: "Raj Patel",
    timezone: "GMT+4", currency: "AED", taxId: "TRN-100234567890003", operatingHours: "24/7",
    totalArea: 25000, storageCapacity: 15000, currentUtilization: 72, employeeCount: 45,
    contacts: [{ name: "Raj Patel", phone: "+971-50-234-5678", email: "raj@company.com", role: "Warehouse Manager" }],
    notes: "Main storage facility with cold storage", isDefault: false, latitude: "25.0657", longitude: "55.1713"
  },
  {
    id: "3", code: "BR-001", name: "Abu Dhabi Branch", type: "branch", status: "active",
    address: "Corniche Road, Office 302", city: "Abu Dhabi", state: "Abu Dhabi", country: "UAE",
    postalCode: "00000", phone: "+971-2-345-6789", email: "abudhabi@company.com", manager: "Sara Ahmed",
    timezone: "GMT+4", currency: "AED", taxId: "TRN-100234567890003", operatingHours: "Sun-Thu 9:00-18:00",
    totalArea: 1200, storageCapacity: 200, currentUtilization: 60, employeeCount: 25,
    contacts: [{ name: "Sara Ahmed", phone: "+971-50-345-6789", email: "sara@company.com", role: "Branch Manager" }],
    notes: "Regional branch office", isDefault: false
  },
  {
    id: "4", code: "ST-001", name: "Mall of Emirates Store", type: "store", status: "active",
    address: "Mall of Emirates, Unit G-45", city: "Dubai", state: "Dubai", country: "UAE",
    postalCode: "00000", phone: "+971-4-456-7890", email: "moe@company.com", manager: "Fatima Hassan",
    timezone: "GMT+4", currency: "AED", taxId: "TRN-100234567890003", operatingHours: "Daily 10:00-22:00",
    totalArea: 350, storageCapacity: 50, currentUtilization: 90, employeeCount: 12,
    contacts: [{ name: "Fatima Hassan", phone: "+971-50-456-7890", email: "fatima@company.com", role: "Store Manager" }],
    notes: "High-traffic retail location", isDefault: false
  },
  {
    id: "5", code: "DC-001", name: "Sharjah Distribution Center", type: "distribution-center", status: "under-construction",
    address: "Industrial Area 15, Block C", city: "Sharjah", state: "Sharjah", country: "UAE",
    postalCode: "00000", phone: "+971-6-567-8901", email: "sharjah@company.com", manager: "TBD",
    timezone: "GMT+4", currency: "AED", taxId: "TRN-100234567890003", operatingHours: "TBD",
    totalArea: 18000, storageCapacity: 12000, currentUtilization: 0, employeeCount: 0,
    contacts: [], notes: "Expected completion Q3 2026", isDefault: false
  },
];

const emptyLocation: Omit<Location, "id"> = {
  code: "", name: "", type: "warehouse", status: "active", address: "", city: "", state: "",
  country: "", postalCode: "", phone: "", email: "", manager: "", timezone: "GMT+4",
  currency: "AED", taxId: "", operatingHours: "", totalArea: 0, storageCapacity: 0,
  currentUtilization: 0, employeeCount: 0, contacts: [], notes: "", isDefault: false,
};

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<Omit<Location, "id">>(emptyLocation);
  const [activeTab, setActiveTab] = useState("general");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [detailLocation, setDetailLocation] = useState<Location | null>(null);

  const filtered = locations.filter((loc) => {
    const matchesSearch = !search || [loc.code, loc.name, loc.city, loc.manager].some(f => f.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === "all" || loc.type === filterType;
    const matchesStatus = filterStatus === "all" || loc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: locations.length,
    active: locations.filter(l => l.status === "active").length,
    totalArea: locations.reduce((s, l) => s + l.totalArea, 0),
    totalEmployees: locations.reduce((s, l) => s + l.employeeCount, 0),
  };

  const openAdd = () => { setEditingLocation(null); setFormData({ ...emptyLocation }); setActiveTab("general"); setDialogOpen(true); };
  const openEdit = (loc: Location) => { setEditingLocation(loc); const { id, ...rest } = loc; setFormData(rest); setActiveTab("general"); setDialogOpen(true); };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;
    if (editingLocation) {
      setLocations(prev => prev.map(l => l.id === editingLocation.id ? { ...formData, id: editingLocation.id } : l));
    } else {
      setLocations(prev => [...prev, { ...formData, id: crypto.randomUUID() }]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => setLocations(prev => prev.filter(l => l.id !== id));
  const handleDuplicate = (loc: Location) => {
    const dup = { ...loc, id: crypto.randomUUID(), code: loc.code + "-COPY", name: loc.name + " (Copy)", isDefault: false };
    setLocations(prev => [...prev, dup]);
  };

  const utilizationColor = (pct: number) => pct >= 90 ? "text-destructive" : pct >= 70 ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--success))]";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Locations Master</h1>
          <p className="text-sm text-muted-foreground">Manage warehouses, branches, stores and distribution centers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" />Import</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Location</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Locations", value: stats.total, icon: MapPin, accent: "border-l-primary" },
          { title: "Active Locations", value: stats.active, icon: CheckCircle2, accent: "border-l-[hsl(var(--success))]" },
          { title: "Total Area (sqm)", value: stats.totalArea.toLocaleString(), icon: Building2, accent: "border-l-[hsl(var(--chart-3))]" },
          { title: "Total Employees", value: stats.totalEmployees, icon: Users, accent: "border-l-[hsl(var(--chart-4))]" },
        ].map(kpi => (
          <Card key={kpi.title} className={`glass-card border-l-4 ${kpi.accent}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary"><kpi.icon className="h-5 w-5 text-muted-foreground" /></div>
              <div><p className="text-xs text-muted-foreground">{kpi.title}</p><p className="text-xl font-bold text-foreground">{kpi.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search locations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex border border-border rounded-md">
          <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("table")}>Table</Button>
          <Button variant={viewMode === "cards" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("cards")}>Cards</Button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" ? (
        <Card className="glass-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="w-[100px]">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Area (sqm)</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
                <TableHead className="text-right">Employees</TableHead>
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(loc => {
                const tc = typeConfig[loc.type];
                const TypeIcon = tc.icon;
                return (
                  <TableRow key={loc.id} className="border-border/30 hover:bg-secondary/30 cursor-pointer" onClick={() => setDetailLocation(loc)}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{loc.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${tc.color}`}><TypeIcon className="h-3.5 w-3.5" /></div>
                        <span className="font-medium text-foreground">{loc.name}</span>
                        {loc.isDefault && <Badge variant="outline" className="text-[10px] px-1">Default</Badge>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{tc.label}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{loc.city}</TableCell>
                    <TableCell className="text-muted-foreground">{loc.manager}</TableCell>
                    <TableCell><Badge variant={statusConfig[loc.status].variant}>{statusConfig[loc.status].label}</Badge></TableCell>
                    <TableCell className="text-right font-mono">{loc.totalArea.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono ${utilizationColor(loc.currentUtilization)}`}>{loc.currentUtilization}%</TableCell>
                    <TableCell className="text-right font-mono">{loc.employeeCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(loc)}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(loc)}><Copy className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(loc.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">No locations found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(loc => {
            const tc = typeConfig[loc.type];
            const TypeIcon = tc.icon;
            return (
              <Card key={loc.id} className="glass-card-hover cursor-pointer" onClick={() => setDetailLocation(loc)}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tc.color}`}><TypeIcon className="h-5 w-5" /></div>
                      <div>
                        <p className="font-semibold text-foreground">{loc.name}</p>
                        <p className="text-xs font-mono text-muted-foreground">{loc.code}</p>
                      </div>
                    </div>
                    <Badge variant={statusConfig[loc.status].variant}>{statusConfig[loc.status].label}</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{loc.city}, {loc.country}</div>
                    <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5" />{loc.manager}</div>
                    <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" />{loc.operatingHours}</div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Utilization</span>
                    <span className={`font-mono font-medium ${utilizationColor(loc.currentUtilization)}`}>{loc.currentUtilization}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${loc.currentUtilization >= 90 ? "bg-destructive" : loc.currentUtilization >= 70 ? "bg-[hsl(var(--warning))]" : "bg-[hsl(var(--success))]"}`} style={{ width: `${loc.currentUtilization}%` }} />
                  </div>
                  <div className="flex gap-1 pt-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => openEdit(loc)}><Edit2 className="h-3 w-3 mr-1" />Edit</Button>
                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => handleDuplicate(loc)}><Copy className="h-3 w-3 mr-1" />Clone</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive" onClick={() => handleDelete(loc.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailLocation} onOpenChange={() => setDetailLocation(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {detailLocation && (() => {
            const tc = typeConfig[detailLocation.type];
            const TypeIcon = tc.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${tc.color}`}><TypeIcon className="h-5 w-5" /></div>
                    {detailLocation.name}
                    <Badge variant={statusConfig[detailLocation.status].variant} className="ml-2">{statusConfig[detailLocation.status].label}</Badge>
                  </DialogTitle>
                  <DialogDescription>Location details for {detailLocation.code}</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Code", detailLocation.code], ["Type", tc.label], ["Address", detailLocation.address],
                    ["City", `${detailLocation.city}, ${detailLocation.state}`], ["Country", detailLocation.country],
                    ["Phone", detailLocation.phone], ["Email", detailLocation.email], ["Manager", detailLocation.manager],
                    ["Operating Hours", detailLocation.operatingHours], ["Timezone", detailLocation.timezone],
                    ["Total Area", `${detailLocation.totalArea.toLocaleString()} sqm`],
                    ["Storage Capacity", `${detailLocation.storageCapacity.toLocaleString()} sqm`],
                    ["Utilization", `${detailLocation.currentUtilization}%`],
                    ["Employees", detailLocation.employeeCount.toString()],
                    ["Tax ID", detailLocation.taxId], ["Currency", detailLocation.currency],
                  ].map(([label, value]) => (
                    <div key={label}><p className="text-muted-foreground text-xs">{label}</p><p className="font-medium text-foreground">{value}</p></div>
                  ))}
                </div>
                {detailLocation.notes && <div className="mt-4 p-3 rounded-lg bg-secondary text-sm"><p className="text-xs text-muted-foreground mb-1">Notes</p><p className="text-foreground">{detailLocation.notes}</p></div>}
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setDetailLocation(null); openEdit(detailLocation); }}>Edit Location</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLocation ? "Edit Location" : "Add Location"}</DialogTitle>
            <DialogDescription>Fill in the location details below</DialogDescription>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
              <TabsTrigger value="address" className="flex-1">Address</TabsTrigger>
              <TabsTrigger value="operations" className="flex-1">Operations</TabsTrigger>
              <TabsTrigger value="contacts" className="flex-1">Contacts</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Location Code *</Label><Input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} placeholder="WH-002" /></div>
                <div><Label>Location Name *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="New Warehouse" /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v as LocationType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v as LocationStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Manager</Label><Input value={formData.manager} onChange={e => setFormData(p => ({ ...p, manager: e.target.value }))} /></div>
                <div><Label>Tax ID</Label><Input value={formData.taxId} onChange={e => setFormData(p => ({ ...p, taxId: e.target.value }))} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.isDefault} onCheckedChange={v => setFormData(p => ({ ...p, isDefault: v }))} />
                <Label>Set as Default Location</Label>
              </div>
              <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3} /></div>
            </TabsContent>
            <TabsContent value="address" className="space-y-4 mt-4">
              <div><Label>Address</Label><Textarea value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City</Label><Input value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} /></div>
                <div><Label>State / Province</Label><Input value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} /></div>
                <div><Label>Country</Label><Input value={formData.country} onChange={e => setFormData(p => ({ ...p, country: e.target.value }))} /></div>
                <div><Label>Postal Code</Label><Input value={formData.postalCode} onChange={e => setFormData(p => ({ ...p, postalCode: e.target.value }))} /></div>
                <div><Label>Latitude</Label><Input value={formData.latitude || ""} onChange={e => setFormData(p => ({ ...p, latitude: e.target.value }))} /></div>
                <div><Label>Longitude</Label><Input value={formData.longitude || ""} onChange={e => setFormData(p => ({ ...p, longitude: e.target.value }))} /></div>
              </div>
            </TabsContent>
            <TabsContent value="operations" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><Label>Email</Label><Input value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
                <div><Label>Operating Hours</Label><Input value={formData.operatingHours} onChange={e => setFormData(p => ({ ...p, operatingHours: e.target.value }))} /></div>
                <div><Label>Timezone</Label><Input value={formData.timezone} onChange={e => setFormData(p => ({ ...p, timezone: e.target.value }))} /></div>
                <div><Label>Currency</Label><Input value={formData.currency} onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))} /></div>
                <div><Label>Total Area (sqm)</Label><Input type="number" value={formData.totalArea} onChange={e => setFormData(p => ({ ...p, totalArea: +e.target.value }))} /></div>
                <div><Label>Storage Capacity (sqm)</Label><Input type="number" value={formData.storageCapacity} onChange={e => setFormData(p => ({ ...p, storageCapacity: +e.target.value }))} /></div>
                <div><Label>Employee Count</Label><Input type="number" value={formData.employeeCount} onChange={e => setFormData(p => ({ ...p, employeeCount: +e.target.value }))} /></div>
              </div>
            </TabsContent>
            <TabsContent value="contacts" className="space-y-4 mt-4">
              {formData.contacts.map((c, i) => (
                <Card key={i} className="bg-secondary/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">Contact {i + 1}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setFormData(p => ({ ...p, contacts: p.contacts.filter((_, idx) => idx !== i) }))}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">Name</Label><Input value={c.name} onChange={e => { const nc = [...formData.contacts]; nc[i] = { ...nc[i], name: e.target.value }; setFormData(p => ({ ...p, contacts: nc })); }} /></div>
                      <div><Label className="text-xs">Role</Label><Input value={c.role} onChange={e => { const nc = [...formData.contacts]; nc[i] = { ...nc[i], role: e.target.value }; setFormData(p => ({ ...p, contacts: nc })); }} /></div>
                      <div><Label className="text-xs">Phone</Label><Input value={c.phone} onChange={e => { const nc = [...formData.contacts]; nc[i] = { ...nc[i], phone: e.target.value }; setFormData(p => ({ ...p, contacts: nc })); }} /></div>
                      <div><Label className="text-xs">Email</Label><Input value={c.email} onChange={e => { const nc = [...formData.contacts]; nc[i] = { ...nc[i], email: e.target.value }; setFormData(p => ({ ...p, contacts: nc })); }} /></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" size="sm" onClick={() => setFormData(p => ({ ...p, contacts: [...p.contacts, { name: "", phone: "", email: "", role: "" }] }))}><Plus className="h-4 w-4 mr-1" />Add Contact</Button>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingLocation ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Locations;
