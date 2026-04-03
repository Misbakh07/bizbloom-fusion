import { useState } from "react";
import { Receipt, Plus, Search, Edit, Trash2, Download, Upload, CheckCircle2, AlertTriangle, Globe, Building2, Percent, MapPin, FileText, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

interface SalesTaxRate {
  id: string;
  code: string;
  name: string;
  rate: number;
  category: "general" | "reduced" | "luxury" | "essential" | "service" | "exempt";
  jurisdiction: string;
  state: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: "active" | "inactive";
  collectFromBuyer: boolean;
  includeInPrice: boolean;
  accountPayable: string;
  accountReceivable: string;
  description: string;
  appliesTo: string[];
}

interface TaxExemption {
  id: string;
  name: string;
  certificateNo: string;
  entityName: string;
  entityType: "customer" | "product_category" | "region";
  validFrom: string;
  validTo: string;
  status: "active" | "expired" | "pending";
  reason: string;
}

const initialRates: SalesTaxRate[] = [
  { id: "1", code: "ST-GEN", name: "General Sales Tax", rate: 17, category: "general", jurisdiction: "Federal", state: "All", effectiveFrom: "2024-01-01", status: "active", collectFromBuyer: true, includeInPrice: false, accountPayable: "2200-ST Payable", accountReceivable: "1500-ST Receivable", description: "General federal sales tax", appliesTo: ["Goods", "Manufacturing"] },
  { id: "2", code: "ST-SRV", name: "Service Sales Tax", rate: 16, category: "service", jurisdiction: "Provincial", state: "Sindh", effectiveFrom: "2024-01-01", status: "active", collectFromBuyer: true, includeInPrice: false, accountPayable: "2200-ST Payable", accountReceivable: "1500-ST Receivable", description: "Provincial service tax", appliesTo: ["Services"] },
  { id: "3", code: "ST-RED", name: "Reduced Rate", rate: 10, category: "reduced", jurisdiction: "Federal", state: "All", effectiveFrom: "2024-01-01", status: "active", collectFromBuyer: true, includeInPrice: false, accountPayable: "2200-ST Payable", accountReceivable: "1500-ST Receivable", description: "Reduced rate for essential goods", appliesTo: ["Essential Goods"] },
  { id: "4", code: "ST-LUX", name: "Luxury Tax", rate: 25, category: "luxury", jurisdiction: "Federal", state: "All", effectiveFrom: "2024-01-01", status: "active", collectFromBuyer: true, includeInPrice: false, accountPayable: "2200-ST Payable", accountReceivable: "1500-ST Receivable", description: "Higher rate for luxury items", appliesTo: ["Luxury Goods"] },
  { id: "5", code: "ST-EX", name: "Tax Exempt", rate: 0, category: "exempt", jurisdiction: "Federal", state: "All", effectiveFrom: "2024-01-01", status: "active", collectFromBuyer: false, includeInPrice: false, accountPayable: "N/A", accountReceivable: "N/A", description: "Exempt from sales tax", appliesTo: ["Exempt Items"] },
];

const initialExemptions: TaxExemption[] = [
  { id: "1", name: "Government Supply", certificateNo: "EXM-2024-001", entityName: "Ministry of Finance", entityType: "customer", validFrom: "2024-01-01", validTo: "2025-12-31", status: "active", reason: "Government entity exemption" },
  { id: "2", name: "Medical Supplies", certificateNo: "EXM-2024-002", entityName: "Pharmaceutical Products", entityType: "product_category", validFrom: "2024-01-01", validTo: "2024-12-31", status: "active", reason: "Essential medical supplies" },
  { id: "3", name: "Export Zone", certificateNo: "EXM-2024-003", entityName: "Free Trade Zone A", entityType: "region", validFrom: "2023-01-01", validTo: "2023-12-31", status: "expired", reason: "Free trade zone exemption" },
];

const catColors: Record<string, string> = {
  general: "bg-primary/10 text-primary",
  reduced: "bg-chart-2/10 text-chart-2",
  luxury: "bg-chart-5/10 text-chart-5",
  essential: "bg-chart-4/10 text-chart-4",
  service: "bg-chart-3/10 text-chart-3",
  exempt: "bg-muted text-muted-foreground",
};

export default function SalesTax() {
  const [rates, setRates] = useState<SalesTaxRate[]>(initialRates);
  const [exemptions, setExemptions] = useState<TaxExemption[]>(initialExemptions);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exemptionDialogOpen, setExemptionDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<SalesTaxRate | null>(null);
  const [form, setForm] = useState<Partial<SalesTaxRate>>({});

  const [exemptForm, setExemptForm] = useState<Partial<TaxExemption>>({});

  const filtered = rates.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditingRate(null);
    setForm({ code: "", name: "", rate: 0, category: "general", jurisdiction: "Federal", state: "", effectiveFrom: new Date().toISOString().split("T")[0], status: "active", collectFromBuyer: true, includeInPrice: false, accountPayable: "", accountReceivable: "", description: "", appliesTo: [] });
    setDialogOpen(true);
  };

  const saveRate = () => {
    if (!form.code || !form.name) { toast({ title: "Validation Error", description: "Code and Name required", variant: "destructive" }); return; }
    if (editingRate) {
      setRates(prev => prev.map(r => r.id === editingRate.id ? { ...r, ...form } as SalesTaxRate : r));
    } else {
      setRates(prev => [...prev, { ...form, id: Date.now().toString() } as SalesTaxRate]);
    }
    setDialogOpen(false);
    toast({ title: "Saved", description: "Sales tax rate saved" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-chart-3/80 to-chart-3">
            <Receipt className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sales Tax Management</h1>
            <p className="text-sm text-muted-foreground">Configure sales tax rates, exemptions, and compliance rules</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm" onClick={openAdd}><Plus className="mr-1 h-4 w-4" />Add Rate</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Total Rates</p><p className="text-2xl font-bold">{rates.length}</p></div><Receipt className="h-8 w-8 text-primary/40" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Active Exemptions</p><p className="text-2xl font-bold text-chart-2">{exemptions.filter(e => e.status === "active").length}</p></div><CheckCircle2 className="h-8 w-8 text-chart-2/40" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Max Rate</p><p className="text-2xl font-bold text-chart-5">{Math.max(...rates.map(r => r.rate))}%</p></div><Percent className="h-8 w-8 text-chart-5/40" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Expired Exemptions</p><p className="text-2xl font-bold text-destructive">{exemptions.filter(e => e.status === "expired").length}</p></div><AlertTriangle className="h-8 w-8 text-destructive/40" /></div></CardContent></Card>
      </div>

      <Tabs defaultValue="rates">
        <TabsList>
          <TabsTrigger value="rates">Tax Rates</TabsTrigger>
          <TabsTrigger value="exemptions">Exemptions</TabsTrigger>
          <TabsTrigger value="slabs">Tax Slabs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Jurisdiction</TableHead>
                  <TableHead>Applies To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.code}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="font-bold">{r.rate}%</TableCell>
                    <TableCell><Badge className={catColors[r.category]}>{r.category}</Badge></TableCell>
                    <TableCell className="text-xs">{r.jurisdiction} - {r.state}</TableCell>
                    <TableCell><div className="flex flex-wrap gap-1">{r.appliesTo.map(a => <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>)}</div></TableCell>
                    <TableCell><Switch checked={r.status === "active"} onCheckedChange={() => setRates(prev => prev.map(x => x.id === r.id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x))} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingRate(r); setForm({ ...r }); setDialogOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setRates(prev => prev.filter(x => x.id !== r.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="exemptions" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Manage tax exemption certificates and special allowances</p>
            <Button size="sm" onClick={() => { setExemptForm({ name: "", certificateNo: "", entityName: "", entityType: "customer", validFrom: "", validTo: "", status: "active", reason: "" }); setExemptionDialogOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" />Add Exemption
            </Button>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Certificate No</TableHead><TableHead>Name</TableHead><TableHead>Entity</TableHead><TableHead>Type</TableHead><TableHead>Valid From</TableHead><TableHead>Valid To</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {exemptions.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs">{e.certificateNo}</TableCell>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.entityName}</TableCell>
                    <TableCell><Badge variant="outline">{e.entityType.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="text-xs">{e.validFrom}</TableCell>
                    <TableCell className="text-xs">{e.validTo}</TableCell>
                    <TableCell>
                      <Badge className={e.status === "active" ? "bg-chart-2/10 text-chart-2" : e.status === "expired" ? "bg-destructive/10 text-destructive" : "bg-chart-5/10 text-chart-5"}>{e.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setExemptions(prev => prev.filter(x => x.id !== e.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="slabs" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Tax Slabs Configuration</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Slab Range</TableHead><TableHead>Rate</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[
                    { range: "0 - 600,000", rate: "0%", type: "Exempt", status: "active" },
                    { range: "600,001 - 1,200,000", rate: "2.5%", type: "Reduced", status: "active" },
                    { range: "1,200,001 - 2,400,000", rate: "12.5%", type: "Standard", status: "active" },
                    { range: "2,400,001 - 3,600,000", rate: "17.5%", type: "Higher", status: "active" },
                    { range: "3,600,001+", rate: "22.5%", type: "Super Tax", status: "active" },
                  ].map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-sm">{s.range}</TableCell>
                      <TableCell className="font-bold">{s.rate}</TableCell>
                      <TableCell><Badge variant="outline">{s.type}</Badge></TableCell>
                      <TableCell><Badge className="bg-chart-2/10 text-chart-2">{s.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Sales Tax Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Sales Tax Registration Number</Label><Input defaultValue="STN-2024-00001" /></div>
                <div className="space-y-2"><Label>Filing Frequency</Label>
                  <Select defaultValue="monthly"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2"><Label>Tax Payable Account</Label><Input defaultValue="2200 - Sales Tax Payable" /></div>
                <div className="space-y-2"><Label>Tax Receivable Account</Label><Input defaultValue="1500 - Sales Tax Receivable" /></div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label>Withholding Tax on Services</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Further Tax on non-filers</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Auto-apply exemptions</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Track input tax adjustments</Label><Switch defaultChecked /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rate Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingRate ? "Edit" : "Add"} Sales Tax Rate</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Code *</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Rate (%)</Label><Input type="number" value={form.rate} onChange={e => setForm(p => ({ ...p, rate: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="space-y-2"><Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v as SalesTaxRate["category"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="reduced">Reduced</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="essential">Essential</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="exempt">Exempt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Jurisdiction</Label>
              <Select value={form.jurisdiction} onValueChange={v => setForm(p => ({ ...p, jurisdiction: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Federal">Federal</SelectItem><SelectItem value="Provincial">Provincial</SelectItem><SelectItem value="Municipal">Municipal</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>State/Region</Label><Input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Effective From</Label><Input type="date" value={form.effectiveFrom} onChange={e => setForm(p => ({ ...p, effectiveFrom: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Account Payable</Label><Input value={form.accountPayable} onChange={e => setForm(p => ({ ...p, accountPayable: e.target.value }))} /></div>
            <div className="col-span-2 space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.collectFromBuyer} onCheckedChange={v => setForm(p => ({ ...p, collectFromBuyer: v }))} /><Label>Collect from Buyer</Label></div>
            <div className="flex items-center gap-2"><Switch checked={form.includeInPrice} onCheckedChange={v => setForm(p => ({ ...p, includeInPrice: v }))} /><Label>Include in Price</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveRate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exemption Dialog */}
      <Dialog open={exemptionDialogOpen} onOpenChange={setExemptionDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Tax Exemption</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Exemption Name</Label><Input value={exemptForm.name} onChange={e => setExemptForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Certificate Number</Label><Input value={exemptForm.certificateNo} onChange={e => setExemptForm(p => ({ ...p, certificateNo: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Entity Name</Label><Input value={exemptForm.entityName} onChange={e => setExemptForm(p => ({ ...p, entityName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Valid From</Label><Input type="date" value={exemptForm.validFrom} onChange={e => setExemptForm(p => ({ ...p, validFrom: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Valid To</Label><Input type="date" value={exemptForm.validTo} onChange={e => setExemptForm(p => ({ ...p, validTo: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Reason</Label><Input value={exemptForm.reason} onChange={e => setExemptForm(p => ({ ...p, reason: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExemptionDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!exemptForm.name) return;
              setExemptions(prev => [...prev, { ...exemptForm, id: Date.now().toString() } as TaxExemption]);
              setExemptionDialogOpen(false);
              toast({ title: "Saved", description: "Exemption added" });
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
