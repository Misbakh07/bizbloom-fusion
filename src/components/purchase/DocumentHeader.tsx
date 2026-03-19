import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, History } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface DocumentHeaderData {
  branch: string;
  division: string;
  location: string;
  documentNumber: string;
  documentDate: Date;
  purchaseDate: Date;
  creditDays: number;
  supplierName: string;
  deliveryAddress: string;
  taxNumber: string;
  currency: string;
  jobNumber: string;
  refDocNo: string;
  refDocDate: Date | null;
  pInvoiceNo: string;
  paymentTerms: string;
  transactionMode: "cash" | "credit";
}

interface Props {
  data: DocumentHeaderData;
  onChange: (data: DocumentHeaderData) => void;
  documentType: string;
  showPreviousTransaction?: boolean;
}

const branches = ["Main Branch", "Branch A", "Branch B", "Branch C"];
const divisions = ["General", "Division 1", "Division 2", "Division 3"];
const locations = ["Warehouse A", "Warehouse B", "Store 1", "Store 2"];
const currencies = ["AED", "USD", "EUR", "GBP", "INR", "SAR"];
const paymentTermsList = ["Net 15", "Net 30", "Net 45", "Net 60", "Net 90", "Immediate"];
const suppliers = [
  { id: "SUP001", name: "Al Futtaim Trading LLC", taxNo: "TRN100234567890" },
  { id: "SUP002", name: "Emirates Industrial Supplies", taxNo: "TRN100345678901" },
  { id: "SUP003", name: "Gulf Steel Industries", taxNo: "TRN100456789012" },
  { id: "SUP004", name: "National Hardware Co.", taxNo: "TRN100567890123" },
  { id: "SUP005", name: "Dubai Auto Parts Trading", taxNo: "TRN100678901234" },
];

const previousTransactions = [
  { docNo: "PI-2024-0089", date: "2024-12-15", amount: 45200 },
  { docNo: "PI-2024-0076", date: "2024-11-28", amount: 32800 },
  { docNo: "PI-2024-0061", date: "2024-10-10", amount: 18900 },
];

export default function DocumentHeader({ data, onChange, documentType, showPreviousTransaction = true }: Props) {
  const [showPrevTxn, setShowPrevTxn] = useState(false);

  const update = (partial: Partial<DocumentHeaderData>) => onChange({ ...data, ...partial });

  const DatePicker = ({ value, onSelect, label }: { value: Date | null; onSelect: (d: Date) => void; label: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-xs bg-background border-border", !value && "text-muted-foreground")}>
          <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
          {value ? format(value, "dd/MM/yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value || undefined} onSelect={(d) => d && onSelect(d)} initialFocus />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-3">
      {/* Transaction Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Transaction Mode:</span>
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              onClick={() => update({ transactionMode: "cash" })}
              className={cn("px-3 py-1 text-xs font-medium transition-colors", data.transactionMode === "cash" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary")}
            >
              Cash
            </button>
            <button
              onClick={() => update({ transactionMode: "credit" })}
              className={cn("px-3 py-1 text-xs font-medium transition-colors", data.transactionMode === "credit" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary")}
            >
              Credit
            </button>
          </div>
        </div>
        {showPreviousTransaction && (
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowPrevTxn(!showPrevTxn)}>
            <History className="h-3.5 w-3.5" /> Previous Transactions
          </Button>
        )}
      </div>

      {/* Previous Transactions Panel */}
      {showPrevTxn && (
        <div className="border border-border rounded-lg p-3 bg-secondary/30">
          <h4 className="text-xs font-semibold text-foreground mb-2">Previous Transactions with Supplier</h4>
          <div className="space-y-1.5">
            {previousTransactions.map((txn) => (
              <div key={txn.docNo} className="flex items-center justify-between text-xs p-1.5 rounded bg-background/50 hover:bg-background cursor-pointer">
                <span className="text-primary font-medium">{txn.docNo}</span>
                <span className="text-muted-foreground">{txn.date}</span>
                <span className="font-medium text-foreground">{txn.amount.toLocaleString()} AED</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 1: Branch, Division, Location, Doc No, Doc Date */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Branch</Label>
          <Select value={data.branch} onValueChange={(v) => update({ branch: v })}>
            <SelectTrigger className="h-9 text-xs bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {branches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Division</Label>
          <Select value={data.division} onValueChange={(v) => update({ division: v })}>
            <SelectTrigger className="h-9 text-xs bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {divisions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Location</Label>
          <Select value={data.location} onValueChange={(v) => update({ location: v })}>
            <SelectTrigger className="h-9 text-xs bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">{documentType} No.</Label>
          <Input value={data.documentNumber} onChange={(e) => update({ documentNumber: e.target.value })} className="h-9 text-xs" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">{documentType} Date</Label>
          <DatePicker value={data.documentDate} onSelect={(d) => update({ documentDate: d })} label="Select date" />
        </div>
      </div>

      {/* Row 2: Supplier, Tax, Currency, Purchase Date, Credit Days */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <Label className="text-xs text-muted-foreground mb-1 block">Supplier Name</Label>
          <Select value={data.supplierName} onValueChange={(v) => {
            const sup = suppliers.find((s) => s.name === v);
            update({ supplierName: v, taxNumber: sup?.taxNo || data.taxNumber });
          }}>
            <SelectTrigger className="h-9 text-xs bg-background"><SelectValue placeholder="Select supplier" /></SelectTrigger>
            <SelectContent>
              {suppliers.map((s) => <SelectItem key={s.id} value={s.name}>{s.id} - {s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Tax Number (TRN)</Label>
          <Input value={data.taxNumber} onChange={(e) => update({ taxNumber: e.target.value })} className="h-9 text-xs" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Currency</Label>
          <Select value={data.currency} onValueChange={(v) => update({ currency: v })}>
            <SelectTrigger className="h-9 text-xs bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Purchase Date</Label>
          <DatePicker value={data.purchaseDate} onSelect={(d) => update({ purchaseDate: d })} label="Select date" />
        </div>
      </div>

      {/* Row 3: Credit Days, Delivery Address, Job No, Ref Doc, Payment Terms */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Credit Days</Label>
          <Input type="number" value={data.creditDays} onChange={(e) => update({ creditDays: parseInt(e.target.value) || 0 })} className="h-9 text-xs" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Job Number</Label>
          <Input value={data.jobNumber} onChange={(e) => update({ jobNumber: e.target.value })} className="h-9 text-xs" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Ref Doc No.</Label>
          <Input value={data.refDocNo} onChange={(e) => update({ refDocNo: e.target.value })} className="h-9 text-xs" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Ref Doc Date</Label>
          <DatePicker value={data.refDocDate} onSelect={(d) => update({ refDocDate: d })} label="Select date" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">P.Invoice No.</Label>
          <Input value={data.pInvoiceNo} onChange={(e) => update({ pInvoiceNo: e.target.value })} className="h-9 text-xs" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Payment Terms</Label>
          <Select value={data.paymentTerms} onValueChange={(v) => update({ paymentTerms: v })}>
            <SelectTrigger className="h-9 text-xs bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {paymentTermsList.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Delivery Address */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">Delivery Address</Label>
        <Input value={data.deliveryAddress} onChange={(e) => update({ deliveryAddress: e.target.value })} className="h-9 text-xs" placeholder="Enter delivery address..." />
      </div>
    </div>
  );
}

export function getDefaultHeaderData(docType: string, docPrefix: string): DocumentHeaderData {
  return {
    branch: "Main Branch",
    division: "General",
    location: "Warehouse A",
    documentNumber: `${docPrefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    documentDate: new Date(),
    purchaseDate: new Date(),
    creditDays: 30,
    supplierName: "",
    deliveryAddress: "",
    taxNumber: "",
    currency: "AED",
    jobNumber: "",
    refDocNo: "",
    refDocDate: null,
    pInvoiceNo: "",
    paymentTerms: "Net 30",
    transactionMode: "credit",
  };
}
