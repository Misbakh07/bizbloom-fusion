import { useState } from "react";
import { Calculator, Plus, Search, Filter, Download, Upload, Settings, FileText, AlertTriangle, CheckCircle2, Clock, Edit, Trash2, Copy, Eye, ToggleLeft, Percent, ArrowUpDown, Building2, MapPin, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

interface VATRate {
  id: string;
  code: string;
  name: string;
  rate: number;
  type: "standard" | "reduced" | "zero" | "exempt" | "reverse_charge";
  country: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isDefault: boolean;
  status: "active" | "inactive";
  accountOutput: string;
  accountInput: string;
  description: string;
  applyTo: ("sales" | "purchase" | "both")[];
}

interface VATGroup {
  id: string;
  name: string;
  rates: string[];
  description: string;
}

const initialRates: VATRate[] = [
  { id: "1", code: "VAT-STD", name: "Standard VAT", rate: 5, type: "standard", country: "UAE", effectiveFrom: "2024-01-01", isDefault: true, status: "active", accountOutput: "2100-VAT Output", accountInput: "1400-VAT Input", description: "Standard VAT rate for UAE", applyTo: ["both"] },
  { id: "2", code: "VAT-ZR", name: "Zero Rated", rate: 0, type: "zero", country: "UAE", effectiveFrom: "2024-01-01", isDefault: false, status: "active", accountOutput: "2100-VAT Output", accountInput: "1400-VAT Input", description: "Zero rated supplies", applyTo: ["both"] },
  { id: "3", code: "VAT-EX", name: "VAT Exempt", rate: 0, type: "exempt", country: "UAE", effectiveFrom: "2024-01-01", isDefault: false, status: "active", accountOutput: "N/A", accountInput: "N/A", description: "Exempt from VAT", applyTo: ["both"] },
  { id: "4", code: "VAT-RC", name: "Reverse Charge", rate: 5, type: "reverse_charge", country: "UAE", effectiveFrom: "2024-01-01", isDefault: false, status: "active", accountOutput: "2100-VAT Output", accountInput: "1400-VAT Input", description: "Reverse charge mechanism", applyTo: ["purchase"] },
  { id: "5", code: "VAT-KSA", name: "KSA Standard VAT", rate: 15, type: "standard", country: "KSA", effectiveFrom: "2024-01-01", isDefault: false, status: "active", accountOutput: "2100-VAT Output", accountInput: "1400-VAT Input", description: "Standard VAT rate for KSA", applyTo: ["both"] },
  { id: "6", code: "GST-PK", name: "Pakistan GST", rate: 18, type: "standard", country: "Pakistan", effectiveFrom: "2024-01-01", isDefault: false, status: "active", accountOutput: "2100-GST Output", accountInput: "1400-GST Input", description: "General Sales Tax Pakistan", applyTo: ["both"] },
];

const initialGroups: VATGroup[] = [
  { id: "1", name: "UAE Standard", rates: ["1", "2", "3"], description: "UAE VAT rates group" },
  { id: "2", name: "KSA Standard", rates: ["5"], description: "KSA VAT rates group" },
  { id: "3", name: "Pakistan GST", rates: ["6"], description: "Pakistan GST group" },
];

const typeColors: Record<string, string> = {
  standard: "bg-primary/10 text-primary",
  reduced: "bg-chart-2/10 text-chart-2",
  zero: "bg-chart-4/10 text-chart-4",
  exempt: "bg-muted text-muted-foreground",
  reverse_charge: "bg-chart-5/10 text-chart-5",
};

export default function VAT() {
  const [rates, setRates] = useState<VATRate[]>(initialRates);
  const [groups, setGroups] = useState<VATGroup[]>(initialGroups);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<VATRate | null>(null);
  const [editingGroup, setEditingGroup] = useState<VATGroup | null>(null);

  const [form, setForm] = useState<Partial<VATRate>>({
    code: "", name: "", rate: 0, type: "standard", country: "UAE", effectiveFrom: "", isDefault: false, status: "active", accountOutput: "", accountInput: "", description: "", applyTo: ["both"],
  });

  const [groupForm, setGroupForm] = useState<Partial<VATGroup>>({ name: "", rates: [], description: "" });

  const filtered = rates.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase());
    const matchCountry = filterCountry === "all" || r.country === filterCountry;
    const matchType = filterType === "all" || r.type === filterType;
    return matchSearch && matchCountry && matchType;
  });

  const countries = [...new Set(rates.map(r => r.country))];

  const openAdd = () => {
    setEditingRate(null);
    setForm({ code: "", name: "", rate: 0, type: "standard", country: "UAE", effectiveFrom: new Date().toISOString().split("T")[0], isDefault: false, status: "active", accountOutput: "", accountInput: "", description: "", applyTo: ["both"] });
    setDialogOpen(true);
  };

  const openEdit = (r: VATRate) => {
    setEditingRate(r);
    setForm({ ...r });
    setDialogOpen(true);
  };

  const saveRate = () => {
    if (!form.code || !form.name) { toast({ title: "Validation", description: "Code and Name are required", variant: "destructive" }); return; }
    if (editingRate) {
      setRates(prev => prev.map(r => r.id === editingRate.id ? { ...r, ...form } as VATRate : r));
      toast({ title: "Updated", description: `${form.name} updated` });
    } else {
      const newRate: VATRate = { ...form, id: Date.now().toString() } as VATRate;
      setRates(prev => [...prev, newRate]);
      toast({ title: "Created", description: `${form.name} created` });
    }
    setDialogOpen(false);
  };

  const deleteRate = (id: string) => {
    setRates(prev => prev.filter(r => r.id !== id));
    toast({ title: "Deleted", description: "VAT rate deleted" });
  };

  const toggleStatus = (id: string) => {
    setRates(prev => prev.map(r => r.id === id ? { ...r, status: r.status === "active" ? "inactive" : "active" } : r));
  };

  const totalActive = rates.filter(r => r.status === "active").length;
  const countriesCount = countries.length;
  const defaultRate = rates.find(r => r.isDefault);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/80 to-primary">
            <Percent className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">VAT / GST Management</h1>
            <p className="text-sm text-muted-foreground">Configure Value Added Tax & Goods and Services Tax rates</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" />Export</Button>
          <Button variant="outline" size="sm"><Upload className="mr-1 h-4 w-4" />Import</Button>
          <Button size="sm" onClick={openAdd}><Plus className="mr-1 h-4 w-4" />Add Rate</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-muted-foreground">Total Rates</p><p className="text-2xl font-bold">{rates.length}</p></div>
            <Calculator className="h-8 w-8 text-primary/40" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-muted-foreground">Active Rates</p><p className="text-2xl font-bold text-chart-2">{totalActive}</p></div>
            <CheckCircle2 className="h-8 w-8 text-chart-2/40" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-muted-foreground">Countries</p><p className="text-2xl font-bold text-chart-4">{countriesCount}</p></div>
            <Globe className="h-8 w-8 text-chart-4/40" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-muted-foreground">Default Rate</p><p className="text-2xl font-bold text-chart-5">{defaultRate?.rate ?? 0}%</p></div>
            <Percent className="h-8 w-8 text-chart-5/40" />
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="rates">
        <TabsList>
          <TabsTrigger value="rates">Tax Rates</TabsTrigger>
          <TabsTrigger value="groups">Tax Groups</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search rates..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="reduced">Reduced</SelectItem>
                <SelectItem value="zero">Zero Rated</SelectItem>
                <SelectItem value="exempt">Exempt</SelectItem>
                <SelectItem value="reverse_charge">Reverse Charge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rate %</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Apply To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.code}</TableCell>
                    <TableCell className="font-medium">{r.name}{r.isDefault && <Badge variant="outline" className="ml-2 text-[10px]">Default</Badge>}</TableCell>
                    <TableCell className="font-bold">{r.rate}%</TableCell>
                    <TableCell><Badge className={typeColors[r.type]}>{r.type.replace("_", " ")}</Badge></TableCell>
                    <TableCell>{r.country}</TableCell>
                    <TableCell className="text-xs">{r.effectiveFrom}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{r.applyTo.join(", ")}</Badge></TableCell>
                    <TableCell>
                      <Switch checked={r.status === "active"} onCheckedChange={() => toggleStatus(r.id)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Group multiple tax rates for easy assignment to products and transactions</p>
            <Button size="sm" onClick={() => { setEditingGroup(null); setGroupForm({ name: "", rates: [], description: "" }); setGroupDialogOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" />Add Group
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groups.map(g => (
              <Card key={g.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{g.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingGroup(g); setGroupForm({ ...g }); setGroupDialogOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setGroups(prev => prev.filter(x => x.id !== g.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{g.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {g.rates.map(rid => {
                      const rate = rates.find(r => r.id === rid);
                      return rate ? <Badge key={rid} variant="secondary" className="text-xs">{rate.name} ({rate.rate}%)</Badge> : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">VAT Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tax Registration Number (TRN)</Label>
                  <Input placeholder="Enter TRN" defaultValue="100234567890003" />
                </div>
                <div className="space-y-2">
                  <Label>Tax Period</Label>
                  <Select defaultValue="quarterly">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default VAT Account (Output)</Label>
                  <Input defaultValue="2100 - VAT Output Payable" />
                </div>
                <div className="space-y-2">
                  <Label>Default VAT Account (Input)</Label>
                  <Input defaultValue="1400 - VAT Input Receivable" />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label>Auto-calculate VAT on transactions</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Include VAT in price (Inclusive pricing)</Label><Switch /></div>
                <div className="flex items-center justify-between"><Label>Enable Reverse Charge Mechanism</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Enable VAT on Import of Goods</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Enable Input Tax Credit tracking</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Auto-generate VAT Return</Label><Switch defaultChecked /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rate Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingRate ? "Edit" : "Add"} VAT / GST Rate</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Code *</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Rate (%)</Label><Input type="number" value={form.rate} onChange={e => setForm(p => ({ ...p, rate: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="space-y-2"><Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as VATRate["type"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="reduced">Reduced</SelectItem>
                  <SelectItem value="zero">Zero Rated</SelectItem>
                  <SelectItem value="exempt">Exempt</SelectItem>
                  <SelectItem value="reverse_charge">Reverse Charge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Country</Label>
              <Select value={form.country} onValueChange={v => setForm(p => ({ ...p, country: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UAE">UAE</SelectItem>
                  <SelectItem value="KSA">KSA</SelectItem>
                  <SelectItem value="Bahrain">Bahrain</SelectItem>
                  <SelectItem value="Oman">Oman</SelectItem>
                  <SelectItem value="Pakistan">Pakistan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Effective From</Label><Input type="date" value={form.effectiveFrom} onChange={e => setForm(p => ({ ...p, effectiveFrom: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Output Account</Label><Input value={form.accountOutput} onChange={e => setForm(p => ({ ...p, accountOutput: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Input Account</Label><Input value={form.accountInput} onChange={e => setForm(p => ({ ...p, accountInput: e.target.value }))} /></div>
            <div className="col-span-2 space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.isDefault} onCheckedChange={v => setForm(p => ({ ...p, isDefault: v }))} /><Label>Set as Default</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveRate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Dialog */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingGroup ? "Edit" : "Add"} Tax Group</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Group Name</Label><Input value={groupForm.name} onChange={e => setGroupForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={groupForm.description} onChange={e => setGroupForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Select Rates</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {rates.map(r => (
                  <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={groupForm.rates?.includes(r.id)} onChange={e => {
                      setGroupForm(p => ({ ...p, rates: e.target.checked ? [...(p.rates || []), r.id] : (p.rates || []).filter(x => x !== r.id) }));
                    }} />
                    {r.name} ({r.rate}%) - {r.country}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!groupForm.name) return;
              if (editingGroup) {
                setGroups(prev => prev.map(g => g.id === editingGroup.id ? { ...g, ...groupForm } as VATGroup : g));
              } else {
                setGroups(prev => [...prev, { ...groupForm, id: Date.now().toString() } as VATGroup]);
              }
              setGroupDialogOpen(false);
              toast({ title: "Saved", description: "Tax group saved" });
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
