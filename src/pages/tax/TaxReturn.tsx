import { useState } from "react";
import { FileText, Plus, Search, Edit, Trash2, Download, Upload, CheckCircle2, AlertTriangle, Clock, Eye, Send, Calendar, Calculator, Percent, ArrowUpDown } from "lucide-react";
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

interface TaxReturnEntry {
  id: string;
  returnType: "vat" | "sales_tax" | "income_tax" | "withholding";
  period: string;
  taxYear: string;
  dueDate: string;
  filingDate?: string;
  status: "draft" | "prepared" | "reviewed" | "submitted" | "accepted" | "rejected" | "amended";
  taxableAmount: number;
  taxAmount: number;
  inputCredit: number;
  netPayable: number;
  penaltyAmount: number;
  referenceNo?: string;
  preparedBy: string;
  reviewedBy?: string;
  notes: string;
}

interface TaxPayment {
  id: string;
  returnId: string;
  paymentDate: string;
  amount: number;
  method: "bank_transfer" | "cheque" | "online" | "challan";
  referenceNo: string;
  bankName: string;
  status: "pending" | "cleared" | "bounced";
}

const initialReturns: TaxReturnEntry[] = [
  { id: "1", returnType: "vat", period: "Q1 2024", taxYear: "2024", dueDate: "2024-04-28", filingDate: "2024-04-25", status: "submitted", taxableAmount: 5000000, taxAmount: 250000, inputCredit: 180000, netPayable: 70000, penaltyAmount: 0, referenceNo: "VAT-2024-Q1-001", preparedBy: "Ahmad", reviewedBy: "Manager", notes: "" },
  { id: "2", returnType: "vat", period: "Q2 2024", taxYear: "2024", dueDate: "2024-07-28", status: "prepared", taxableAmount: 6200000, taxAmount: 310000, inputCredit: 220000, netPayable: 90000, penaltyAmount: 0, preparedBy: "Ahmad", notes: "" },
  { id: "3", returnType: "sales_tax", period: "Jun 2024", taxYear: "2024", dueDate: "2024-07-15", status: "draft", taxableAmount: 3500000, taxAmount: 595000, inputCredit: 400000, netPayable: 195000, penaltyAmount: 0, preparedBy: "Ali", notes: "" },
  { id: "4", returnType: "income_tax", period: "FY 2023-24", taxYear: "2023-24", dueDate: "2024-09-30", status: "draft", taxableAmount: 15000000, taxAmount: 3500000, inputCredit: 2800000, netPayable: 700000, penaltyAmount: 0, preparedBy: "CFO", notes: "" },
  { id: "5", returnType: "withholding", period: "Jun 2024", taxYear: "2024", dueDate: "2024-07-15", filingDate: "2024-07-12", status: "accepted", taxableAmount: 2000000, taxAmount: 140000, inputCredit: 0, netPayable: 140000, penaltyAmount: 0, referenceNo: "WHT-2024-06-001", preparedBy: "Accounts", reviewedBy: "Manager", notes: "" },
];

const initialPayments: TaxPayment[] = [
  { id: "1", returnId: "1", paymentDate: "2024-04-25", amount: 70000, method: "bank_transfer", referenceNo: "TT-2024-001", bankName: "HBL", status: "cleared" },
  { id: "2", returnId: "5", paymentDate: "2024-07-12", amount: 140000, method: "online", referenceNo: "EP-2024-005", bankName: "UBL", status: "cleared" },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  prepared: "bg-chart-4/10 text-chart-4",
  reviewed: "bg-primary/10 text-primary",
  submitted: "bg-chart-3/10 text-chart-3",
  accepted: "bg-chart-2/10 text-chart-2",
  rejected: "bg-destructive/10 text-destructive",
  amended: "bg-chart-5/10 text-chart-5",
};

const typeLabels: Record<string, string> = {
  vat: "VAT Return",
  sales_tax: "Sales Tax Return",
  income_tax: "Income Tax Return",
  withholding: "WHT Statement",
};

const fmt = (n: number) => n.toLocaleString();

export default function TaxReturn() {
  const [returns, setReturns] = useState<TaxReturnEntry[]>(initialReturns);
  const [payments, setPayments] = useState<TaxPayment[]>(initialPayments);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState<TaxReturnEntry | null>(null);
  const [form, setForm] = useState<Partial<TaxReturnEntry>>({});
  const [paymentForm, setPaymentForm] = useState<Partial<TaxPayment>>({});

  const filtered = returns.filter(r => {
    const matchSearch = r.period.toLowerCase().includes(search.toLowerCase()) || (r.referenceNo || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || r.returnType === filterType;
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totalPayable = returns.filter(r => r.status !== "accepted").reduce((s, r) => s + r.netPayable, 0);
  const totalPaid = payments.filter(p => p.status === "cleared").reduce((s, p) => s + p.amount, 0);
  const pendingReturns = returns.filter(r => ["draft", "prepared"].includes(r.status)).length;
  const overdueReturns = returns.filter(r => r.status !== "accepted" && r.status !== "submitted" && new Date(r.dueDate) < new Date()).length;

  const openAdd = () => {
    setForm({ returnType: "vat", period: "", taxYear: "2024", dueDate: "", status: "draft", taxableAmount: 0, taxAmount: 0, inputCredit: 0, netPayable: 0, penaltyAmount: 0, preparedBy: "", notes: "" });
    setDialogOpen(true);
  };

  const updateStatus = (id: string, status: TaxReturnEntry["status"]) => {
    setReturns(prev => prev.map(r => r.id === id ? { ...r, status, filingDate: status === "submitted" ? new Date().toISOString().split("T")[0] : r.filingDate } : r));
    toast({ title: "Status Updated", description: `Return marked as ${status}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-chart-2/80 to-chart-2">
            <Send className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tax Return Submission</h1>
            <p className="text-sm text-muted-foreground">Prepare, review, file, and track all tax returns</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm" onClick={openAdd}><Plus className="mr-1 h-4 w-4" />New Return</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Total Payable</p><p className="text-2xl font-bold">{fmt(totalPayable)}</p></div><Calculator className="h-8 w-8 text-primary/40" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Total Paid</p><p className="text-2xl font-bold text-chart-2">{fmt(totalPaid)}</p></div><CheckCircle2 className="h-8 w-8 text-chart-2/40" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Pending Returns</p><p className="text-2xl font-bold text-chart-5">{pendingReturns}</p></div><Clock className="h-8 w-8 text-chart-5/40" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Overdue</p><p className="text-2xl font-bold text-destructive">{overdueReturns}</p></div><AlertTriangle className="h-8 w-8 text-destructive/40" /></div></CardContent></Card>
      </div>

      <Tabs defaultValue="returns">
        <TabsList>
          <TabsTrigger value="returns">Tax Returns</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="calendar">Filing Calendar</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="returns" className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search returns..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vat">VAT</SelectItem>
                <SelectItem value="sales_tax">Sales Tax</SelectItem>
                <SelectItem value="income_tax">Income Tax</SelectItem>
                <SelectItem value="withholding">Withholding</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="prepared">Prepared</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Type</TableHead><TableHead>Period</TableHead><TableHead>Due Date</TableHead><TableHead>Taxable Amount</TableHead><TableHead>Tax</TableHead><TableHead>Input Credit</TableHead><TableHead>Net Payable</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell><Badge variant="outline" className="text-[10px]">{typeLabels[r.returnType]}</Badge></TableCell>
                    <TableCell className="font-medium">{r.period}</TableCell>
                    <TableCell className="text-xs">{r.dueDate}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmt(r.taxableAmount)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmt(r.taxAmount)}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-chart-2">{fmt(r.inputCredit)}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-bold">{fmt(r.netPayable)}</TableCell>
                    <TableCell><Badge className={statusColors[r.status]}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailDialog(r)}><Eye className="h-3.5 w-3.5" /></Button>
                        {r.status === "draft" && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => updateStatus(r.id, "prepared")}>Prepare</Button>}
                        {r.status === "prepared" && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => updateStatus(r.id, "reviewed")}>Review</Button>}
                        {r.status === "reviewed" && <Button variant="ghost" size="sm" className="h-7 text-xs text-chart-2" onClick={() => updateStatus(r.id, "submitted")}>Submit</Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Track tax payments against filed returns</p>
            <Button size="sm" onClick={() => { setPaymentForm({ returnId: "", paymentDate: "", amount: 0, method: "bank_transfer", referenceNo: "", bankName: "", status: "pending" }); setPaymentDialogOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" />Record Payment
            </Button>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Return</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Reference</TableHead><TableHead>Bank</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {payments.map(p => {
                  const ret = returns.find(r => r.id === p.returnId);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{ret ? `${typeLabels[ret.returnType]} - ${ret.period}` : p.returnId}</TableCell>
                      <TableCell className="text-xs">{p.paymentDate}</TableCell>
                      <TableCell className="font-bold">{fmt(p.amount)}</TableCell>
                      <TableCell><Badge variant="outline">{p.method.replace("_", " ")}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{p.referenceNo}</TableCell>
                      <TableCell>{p.bankName}</TableCell>
                      <TableCell><Badge className={p.status === "cleared" ? "bg-chart-2/10 text-chart-2" : "bg-chart-5/10 text-chart-5"}>{p.status}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Upcoming Filing Deadlines</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {returns.filter(r => r.status !== "accepted" && r.status !== "submitted").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(r => {
                  const isOverdue = new Date(r.dueDate) < new Date();
                  return (
                    <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${isOverdue ? "border-destructive/50 bg-destructive/5" : "border-border"}`}>
                      <div className="flex items-center gap-3">
                        <Calendar className={`h-5 w-5 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`} />
                        <div>
                          <p className="font-medium text-sm">{typeLabels[r.returnType]} - {r.period}</p>
                          <p className="text-xs text-muted-foreground">Due: {r.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[r.status]}>{r.status}</Badge>
                        {isOverdue && <Badge className="bg-destructive/10 text-destructive">Overdue</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Tax Return Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Default Prepared By</Label><Input defaultValue="Accounts Department" /></div>
                <div className="space-y-2"><Label>Approving Authority</Label><Input defaultValue="Chief Financial Officer" /></div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label>Auto-calculate from transactions</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Send reminder before due date</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Require review before submission</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Generate filing receipts</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Track penalty and interest</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label>Allow amended returns</Label><Switch defaultChecked /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Return Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Tax Return</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Return Type</Label>
              <Select value={form.returnType} onValueChange={v => setForm(p => ({ ...p, returnType: v as TaxReturnEntry["returnType"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vat">VAT Return</SelectItem>
                  <SelectItem value="sales_tax">Sales Tax Return</SelectItem>
                  <SelectItem value="income_tax">Income Tax Return</SelectItem>
                  <SelectItem value="withholding">WHT Statement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Period</Label><Input value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} placeholder="e.g. Q3 2024" /></div>
            <div className="space-y-2"><Label>Tax Year</Label><Input value={form.taxYear} onChange={e => setForm(p => ({ ...p, taxYear: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Taxable Amount</Label><Input type="number" value={form.taxableAmount} onChange={e => setForm(p => ({ ...p, taxableAmount: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="space-y-2"><Label>Tax Amount</Label><Input type="number" value={form.taxAmount} onChange={e => setForm(p => ({ ...p, taxAmount: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="space-y-2"><Label>Input Credit</Label><Input type="number" value={form.inputCredit} onChange={e => setForm(p => ({ ...p, inputCredit: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="space-y-2"><Label>Prepared By</Label><Input value={form.preparedBy} onChange={e => setForm(p => ({ ...p, preparedBy: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!form.period) return;
              const net = (form.taxAmount || 0) - (form.inputCredit || 0);
              setReturns(prev => [...prev, { ...form, id: Date.now().toString(), netPayable: net, penaltyAmount: 0, status: "draft", notes: "" } as TaxReturnEntry]);
              setDialogOpen(false);
              toast({ title: "Created", description: "Tax return created as draft" });
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Tax Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Select Return</Label>
              <Select value={paymentForm.returnId} onValueChange={v => setPaymentForm(p => ({ ...p, returnId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {returns.map(r => <SelectItem key={r.id} value={r.id}>{typeLabels[r.returnType]} - {r.period}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Payment Date</Label><Input type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm(p => ({ ...p, paymentDate: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Amount</Label><Input type="number" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Method</Label>
                <Select value={paymentForm.method} onValueChange={v => setPaymentForm(p => ({ ...p, method: v as TaxPayment["method"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="challan">Challan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Reference No</Label><Input value={paymentForm.referenceNo} onChange={e => setPaymentForm(p => ({ ...p, referenceNo: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Bank Name</Label><Input value={paymentForm.bankName} onChange={e => setPaymentForm(p => ({ ...p, bankName: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!paymentForm.returnId) return;
              setPayments(prev => [...prev, { ...paymentForm, id: Date.now().toString() } as TaxPayment]);
              setPaymentDialogOpen(false);
              toast({ title: "Recorded", description: "Payment recorded" });
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Return Details</DialogTitle></DialogHeader>
          {detailDialog && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{typeLabels[detailDialog.returnType]}</span></div>
                <div><span className="text-muted-foreground">Period:</span> <span className="font-medium">{detailDialog.period}</span></div>
                <div><span className="text-muted-foreground">Due Date:</span> <span className="font-medium">{detailDialog.dueDate}</span></div>
                <div><span className="text-muted-foreground">Filing Date:</span> <span className="font-medium">{detailDialog.filingDate || "Not filed"}</span></div>
                <div><span className="text-muted-foreground">Reference:</span> <span className="font-mono">{detailDialog.referenceNo || "—"}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={statusColors[detailDialog.status]}>{detailDialog.status}</Badge></div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Taxable Amount:</span> <span className="font-bold">{fmt(detailDialog.taxableAmount)}</span></div>
                <div><span className="text-muted-foreground">Tax Amount:</span> <span className="font-bold">{fmt(detailDialog.taxAmount)}</span></div>
                <div><span className="text-muted-foreground">Input Credit:</span> <span className="font-bold text-chart-2">{fmt(detailDialog.inputCredit)}</span></div>
                <div><span className="text-muted-foreground">Net Payable:</span> <span className="font-bold text-primary">{fmt(detailDialog.netPayable)}</span></div>
              </div>
              <Separator />
              <div className="text-sm"><span className="text-muted-foreground">Prepared By:</span> {detailDialog.preparedBy} | <span className="text-muted-foreground">Reviewed By:</span> {detailDialog.reviewedBy || "Pending"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
