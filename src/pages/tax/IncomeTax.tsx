import { useState } from "react";
import { DollarSign, Plus, Search, Edit, Trash2, Download, CheckCircle2, AlertTriangle, Users, Building2, Percent, Calculator, FileText } from "lucide-react";
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

interface TaxSlab {
  id: string;
  name: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fixedAmount: number;
  category: "individual" | "company" | "aop" | "salaried" | "non_salaried";
  taxYear: string;
  status: "active" | "inactive";
}

interface WithholdingRate {
  id: string;
  section: string;
  description: string;
  filerRate: number;
  nonFilerRate: number;
  threshold: number;
  applicableTo: string;
  status: "active" | "inactive";
}

interface TaxDeduction {
  id: string;
  code: string;
  name: string;
  maxLimit: number;
  percentage: number;
  category: "investment" | "donation" | "medical" | "education" | "pension" | "other";
  status: "active" | "inactive";
}

const initialSlabs: TaxSlab[] = [
  { id: "1", name: "Slab 1", fromAmount: 0, toAmount: 600000, rate: 0, fixedAmount: 0, category: "salaried", taxYear: "2024-25", status: "active" },
  { id: "2", name: "Slab 2", fromAmount: 600001, toAmount: 1200000, rate: 2.5, fixedAmount: 0, category: "salaried", taxYear: "2024-25", status: "active" },
  { id: "3", name: "Slab 3", fromAmount: 1200001, toAmount: 2400000, rate: 12.5, fixedAmount: 15000, category: "salaried", taxYear: "2024-25", status: "active" },
  { id: "4", name: "Slab 4", fromAmount: 2400001, toAmount: 3600000, rate: 22.5, fixedAmount: 165000, category: "salaried", taxYear: "2024-25", status: "active" },
  { id: "5", name: "Slab 5", fromAmount: 3600001, toAmount: 6000000, rate: 27.5, fixedAmount: 435000, category: "salaried", taxYear: "2024-25", status: "active" },
  { id: "6", name: "Slab 6", fromAmount: 6000001, toAmount: 999999999, rate: 35, fixedAmount: 1095000, category: "salaried", taxYear: "2024-25", status: "active" },
];

const initialWithholding: WithholdingRate[] = [
  { id: "1", section: "149", description: "Salary", filerRate: 0, nonFilerRate: 0, threshold: 0, applicableTo: "Employees", status: "active" },
  { id: "2", section: "153(1)(a)", description: "Supply of Goods", filerRate: 4.5, nonFilerRate: 9, threshold: 75000, applicableTo: "Suppliers", status: "active" },
  { id: "3", section: "153(1)(b)", description: "Rendering of Services", filerRate: 8, nonFilerRate: 16, threshold: 30000, applicableTo: "Service Providers", status: "active" },
  { id: "4", section: "153(1)(c)", description: "Execution of Contracts", filerRate: 7, nonFilerRate: 14, threshold: 75000, applicableTo: "Contractors", status: "active" },
  { id: "5", section: "231A", description: "Cash Withdrawal from Bank", filerRate: 0.6, nonFilerRate: 1.2, threshold: 50000, applicableTo: "All", status: "active" },
  { id: "6", section: "236G", description: "Sale of Motor Vehicle", filerRate: 0, nonFilerRate: 3, threshold: 0, applicableTo: "Buyers", status: "active" },
];

const initialDeductions: TaxDeduction[] = [
  { id: "1", code: "D-INV", name: "Investment in Shares", maxLimit: 2000000, percentage: 20, category: "investment", status: "active" },
  { id: "2", code: "D-DON", name: "Charitable Donations", maxLimit: 0, percentage: 30, category: "donation", status: "active" },
  { id: "3", code: "D-MED", name: "Medical Expenses", maxLimit: 1000000, percentage: 10, category: "medical", status: "active" },
  { id: "4", code: "D-EDU", name: "Education Expenses", maxLimit: 1500000, percentage: 25, category: "education", status: "active" },
  { id: "5", code: "D-PEN", name: "Voluntary Pension", maxLimit: 0, percentage: 20, category: "pension", status: "active" },
];

const fmt = (n: number) => n.toLocaleString();

export default function IncomeTax() {
  const [slabs, setSlabs] = useState<TaxSlab[]>(initialSlabs);
  const [withholding, setWithholding] = useState<WithholdingRate[]>(initialWithholding);
  const [deductions, setDeductions] = useState<TaxDeduction[]>(initialDeductions);
  const [slabDialogOpen, setSlabDialogOpen] = useState(false);
  const [whtDialogOpen, setWhtDialogOpen] = useState(false);
  const [dedDialogOpen, setDedDialogOpen] = useState(false);
  const [slabForm, setSlabForm] = useState<Partial<TaxSlab>>({});
  const [whtForm, setWhtForm] = useState<Partial<WithholdingRate>>({});
  const [dedForm, setDedForm] = useState<Partial<TaxDeduction>>({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-chart-5/80 to-chart-5">
            <DollarSign className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Income Tax Management</h1>
            <p className="text-sm text-muted-foreground">Tax slabs, withholding rates, deductions & advance tax</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" />Export</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Tax Slabs</p><p className="text-2xl font-bold">{slabs.length}</p></div><Calculator className="h-8 w-8 text-primary/40" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">WHT Sections</p><p className="text-2xl font-bold text-chart-3">{withholding.length}</p></div><FileText className="h-8 w-8 text-chart-3/40" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Max Slab Rate</p><p className="text-2xl font-bold text-chart-5">{Math.max(...slabs.map(s => s.rate))}%</p></div><Percent className="h-8 w-8 text-chart-5/40" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Deductions Available</p><p className="text-2xl font-bold text-chart-2">{deductions.length}</p></div><CheckCircle2 className="h-8 w-8 text-chart-2/40" /></div></CardContent></Card>
      </div>

      <Tabs defaultValue="slabs">
        <TabsList>
          <TabsTrigger value="slabs">Tax Slabs</TabsTrigger>
          <TabsTrigger value="withholding">Withholding Tax</TabsTrigger>
          <TabsTrigger value="deductions">Deductions & Credits</TabsTrigger>
          <TabsTrigger value="advance">Advance Tax</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="slabs" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Select defaultValue="salaried">
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="non_salaried">Non-Salaried</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="aop">AOP</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="2024-25">
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="2024-25">2024-25</SelectItem><SelectItem value="2023-24">2023-24</SelectItem></SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={() => { setSlabForm({ name: "", fromAmount: 0, toAmount: 0, rate: 0, fixedAmount: 0, category: "salaried", taxYear: "2024-25", status: "active" }); setSlabDialogOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" />Add Slab
            </Button>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Income Range</TableHead><TableHead>Fixed Amount</TableHead><TableHead>Rate on Excess</TableHead><TableHead>Category</TableHead><TableHead>Tax Year</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {slabs.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">{fmt(s.fromAmount)} - {s.toAmount >= 999999999 ? "Above" : fmt(s.toAmount)}</TableCell>
                    <TableCell className="font-medium">{fmt(s.fixedAmount)}</TableCell>
                    <TableCell className="font-bold">{s.rate}%</TableCell>
                    <TableCell><Badge variant="outline">{s.category.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="text-xs">{s.taxYear}</TableCell>
                    <TableCell><Switch checked={s.status === "active"} onCheckedChange={() => setSlabs(prev => prev.map(x => x.id === s.id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x))} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setSlabs(prev => prev.filter(x => x.id !== s.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="withholding" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Withholding tax rates for different sections</p>
            <Button size="sm" onClick={() => { setWhtForm({ section: "", description: "", filerRate: 0, nonFilerRate: 0, threshold: 0, applicableTo: "", status: "active" }); setWhtDialogOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" />Add Section
            </Button>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Section</TableHead><TableHead>Description</TableHead><TableHead>Filer Rate</TableHead><TableHead>Non-Filer Rate</TableHead><TableHead>Threshold</TableHead><TableHead>Applicable To</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {withholding.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-xs font-bold">{w.section}</TableCell>
                    <TableCell className="font-medium">{w.description}</TableCell>
                    <TableCell className="text-chart-2 font-bold">{w.filerRate}%</TableCell>
                    <TableCell className="text-destructive font-bold">{w.nonFilerRate}%</TableCell>
                    <TableCell>{fmt(w.threshold)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{w.applicableTo}</Badge></TableCell>
                    <TableCell><Switch checked={w.status === "active"} onCheckedChange={() => setWithholding(prev => prev.map(x => x.id === w.id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x))} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setWithholding(prev => prev.filter(x => x.id !== w.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Allowable deductions and tax credits</p>
            <Button size="sm" onClick={() => { setDedForm({ code: "", name: "", maxLimit: 0, percentage: 0, category: "investment", status: "active" }); setDedDialogOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" />Add Deduction
            </Button>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Max Limit</TableHead><TableHead>% of Income</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {deductions.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.code}</TableCell>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.maxLimit > 0 ? fmt(d.maxLimit) : "No Limit"}</TableCell>
                    <TableCell className="font-bold">{d.percentage}%</TableCell>
                    <TableCell><Badge variant="outline">{d.category}</Badge></TableCell>
                    <TableCell><Switch checked={d.status === "active"} onCheckedChange={() => setDeductions(prev => prev.map(x => x.id === d.id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x))} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeductions(prev => prev.filter(x => x.id !== d.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="advance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Advance Tax Configuration</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Quarter</TableHead><TableHead>Due Date</TableHead><TableHead>% of Tax</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[
                    { q: "Q1 (Jul-Sep)", due: "Sep 15", pct: "25%", status: "Due" },
                    { q: "Q2 (Oct-Dec)", due: "Dec 15", pct: "25%", status: "Upcoming" },
                    { q: "Q3 (Jan-Mar)", due: "Mar 15", pct: "25%", status: "Upcoming" },
                    { q: "Q4 (Apr-Jun)", due: "Jun 15", pct: "25%", status: "Upcoming" },
                  ].map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{a.q}</TableCell>
                      <TableCell>{a.due}</TableCell>
                      <TableCell className="font-bold">{a.pct}</TableCell>
                      <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Income Tax Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>NTN (National Tax Number)</Label><Input defaultValue="1234567-8" /></div>
                <div className="space-y-2"><Label>Tax Year</Label>
                  <Select defaultValue="2024-25"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2024-25">2024-25</SelectItem><SelectItem value="2023-24">2023-24</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2"><Label>Filer Status</Label>
                  <Select defaultValue="filer"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="filer">Active Tax Filer</SelectItem><SelectItem value="non_filer">Non-Filer</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2"><Label>Income Tax Expense Account</Label><Input defaultValue="7100 - Income Tax Expense" /></div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label>Auto-calculate WHT on transactions</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Apply different rates for filers/non-filers</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Track advance tax payments</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Generate WHT certificates</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Minimum tax regime</Label><Switch /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Slab Dialog */}
      <Dialog open={slabDialogOpen} onOpenChange={setSlabDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Tax Slab</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>From Amount</Label><Input type="number" value={slabForm.fromAmount} onChange={e => setSlabForm(p => ({ ...p, fromAmount: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="space-y-2"><Label>To Amount</Label><Input type="number" value={slabForm.toAmount} onChange={e => setSlabForm(p => ({ ...p, toAmount: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="space-y-2"><Label>Fixed Amount</Label><Input type="number" value={slabForm.fixedAmount} onChange={e => setSlabForm(p => ({ ...p, fixedAmount: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="space-y-2"><Label>Rate (%)</Label><Input type="number" value={slabForm.rate} onChange={e => setSlabForm(p => ({ ...p, rate: parseFloat(e.target.value) || 0 }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlabDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { setSlabs(prev => [...prev, { ...slabForm, id: Date.now().toString(), name: `Slab ${prev.length + 1}` } as TaxSlab]); setSlabDialogOpen(false); toast({ title: "Saved" }); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WHT Dialog */}
      <Dialog open={whtDialogOpen} onOpenChange={setWhtDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Withholding Section</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Section</Label><Input value={whtForm.section} onChange={e => setWhtForm(p => ({ ...p, section: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Applicable To</Label><Input value={whtForm.applicableTo} onChange={e => setWhtForm(p => ({ ...p, applicableTo: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Input value={whtForm.description} onChange={e => setWhtForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Filer Rate</Label><Input type="number" value={whtForm.filerRate} onChange={e => setWhtForm(p => ({ ...p, filerRate: parseFloat(e.target.value) || 0 }))} /></div>
              <div className="space-y-2"><Label>Non-Filer Rate</Label><Input type="number" value={whtForm.nonFilerRate} onChange={e => setWhtForm(p => ({ ...p, nonFilerRate: parseFloat(e.target.value) || 0 }))} /></div>
              <div className="space-y-2"><Label>Threshold</Label><Input type="number" value={whtForm.threshold} onChange={e => setWhtForm(p => ({ ...p, threshold: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWhtDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { setWithholding(prev => [...prev, { ...whtForm, id: Date.now().toString() } as WithholdingRate]); setWhtDialogOpen(false); toast({ title: "Saved" }); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deduction Dialog */}
      <Dialog open={dedDialogOpen} onOpenChange={setDedDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Tax Deduction</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Code</Label><Input value={dedForm.code} onChange={e => setDedForm(p => ({ ...p, code: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Name</Label><Input value={dedForm.name} onChange={e => setDedForm(p => ({ ...p, name: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Max Limit (0 = no limit)</Label><Input type="number" value={dedForm.maxLimit} onChange={e => setDedForm(p => ({ ...p, maxLimit: parseFloat(e.target.value) || 0 }))} /></div>
              <div className="space-y-2"><Label>% of Income</Label><Input type="number" value={dedForm.percentage} onChange={e => setDedForm(p => ({ ...p, percentage: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
            <div className="space-y-2"><Label>Category</Label>
              <Select value={dedForm.category} onValueChange={v => setDedForm(p => ({ ...p, category: v as TaxDeduction["category"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="investment">Investment</SelectItem><SelectItem value="donation">Donation</SelectItem><SelectItem value="medical">Medical</SelectItem><SelectItem value="education">Education</SelectItem><SelectItem value="pension">Pension</SelectItem><SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDedDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { setDeductions(prev => [...prev, { ...dedForm, id: Date.now().toString() } as TaxDeduction]); setDedDialogOpen(false); toast({ title: "Saved" }); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
