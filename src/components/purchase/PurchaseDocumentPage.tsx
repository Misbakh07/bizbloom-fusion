import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, Printer, FileText, Link2, Send, ArrowLeft, ChevronDown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import DocumentHeader, { type DocumentHeaderData, getDefaultHeaderData } from "./DocumentHeader";
import ItemEntryGrid from "./ItemEntryGrid";
import { type LineItem, type AdditionalCharge, createEmptyLineItem } from "./purchaseData";

interface Props {
  title: string;
  docType: string;
  docPrefix: string;
  icon: React.ReactNode;
  color: string;
  linkedDocuments?: { type: string; label: string; prefix: string }[];
  showRecurring?: boolean;
  showImportFields?: boolean;
  showServiceFields?: boolean;
  showReturnFields?: boolean;
  showGRNFields?: boolean;
}

const linkedDocSamples = [
  { docNo: "PO-2024-1001", date: "2024-12-10", supplier: "Al Futtaim Trading LLC", amount: 35200, status: "Approved" },
  { docNo: "PO-2024-0998", date: "2024-12-05", supplier: "Emirates Industrial", amount: 18400, status: "Partial" },
  { docNo: "PO-2024-0985", date: "2024-11-28", supplier: "Gulf Steel Industries", amount: 52100, status: "Open" },
];

export default function PurchaseDocumentPage({
  title, docType, docPrefix, icon, color,
  linkedDocuments = [], showRecurring, showImportFields, showServiceFields, showReturnFields, showGRNFields,
}: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [header, setHeader] = useState<DocumentHeaderData>(getDefaultHeaderData(docType, docPrefix));
  const [items, setItems] = useState<LineItem[]>([createEmptyLineItem(header.location)]);
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([]);
  const [activeTab, setActiveTab] = useState("entry");
  const [remarks, setRemarks] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  // recurring fields
  const [recurFrequency, setRecurFrequency] = useState("monthly");
  const [recurCount, setRecurCount] = useState(12);
  // import fields
  const [importLCNo, setImportLCNo] = useState("");
  const [importShipmentNo, setImportShipmentNo] = useState("");
  const [importBLNo, setImportBLNo] = useState("");
  // return fields
  const [returnReason, setReturnReason] = useState("");
  const [originalDocNo, setOriginalDocNo] = useState("");
  // GRN
  const [grnPORef, setGrnPORef] = useState("");
  const [grnInspectionStatus, setGrnInspectionStatus] = useState("pending");

  const handleSave = (status: string) => {
    toast({ title: `${docType} ${status}`, description: `${header.documentNumber} has been ${status.toLowerCase()} successfully.` });
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>{icon}</div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">{header.documentNumber} • {header.transactionMode === "cash" ? "Cash" : "Credit"} Transaction</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Draft</Badge>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Eye className="h-3.5 w-3.5" /> Preview</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Printer className="h-3.5 w-3.5" /> Print</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => handleSave("Saved")}><Save className="h-3.5 w-3.5" /> Save Draft</Button>
          <Button size="sm" className="h-8 text-xs gap-1" onClick={() => handleSave("Submitted")}><Send className="h-3.5 w-3.5" /> Submit</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="entry" className="text-xs">Document Entry</TabsTrigger>
          {linkedDocuments.length > 0 && <TabsTrigger value="linked" className="text-xs">Linked Documents</TabsTrigger>}
          {showRecurring && <TabsTrigger value="recurring" className="text-xs">Recurring Setup</TabsTrigger>}
          {showImportFields && <TabsTrigger value="import" className="text-xs">Import Details</TabsTrigger>}
          {showReturnFields && <TabsTrigger value="return" className="text-xs">Return Details</TabsTrigger>}
          {showGRNFields && <TabsTrigger value="grn" className="text-xs">GRN Details</TabsTrigger>}
          <TabsTrigger value="notes" className="text-xs">Notes & Remarks</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-4 mt-3">
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <DocumentHeader data={header} onChange={setHeader} documentType={docType} />
            </CardContent>
          </Card>

          {showServiceFields && (
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-foreground mb-3">Service Details</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Service Period From</Label>
                    <Input type="date" className="h-9 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Service Period To</Label>
                    <Input type="date" className="h-9 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Service Category</Label>
                    <Select defaultValue="maintenance">
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="installation">Installation</SelectItem>
                        <SelectItem value="rental">Rental</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold text-foreground mb-3">Line Items</h3>
              <ItemEntryGrid
                items={items}
                onChange={setItems}
                additionalCharges={additionalCharges}
                onAdditionalChargesChange={setAdditionalCharges}
                currency={header.currency}
                location={header.location}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {linkedDocuments.length > 0 && (
          <TabsContent value="linked" className="mt-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Link from Existing Document</h3>
                </div>
                <div className="flex gap-2 mb-3">
                  {linkedDocuments.map((ld) => (
                    <Badge key={ld.type} variant="outline" className="cursor-pointer hover:bg-primary/10 text-xs">{ld.label}</Badge>
                  ))}
                </div>
                <div className="border border-border rounded-lg overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead className="text-xs font-semibold w-8 text-center">Select</TableHead>
                        <TableHead className="text-xs font-semibold">Doc No.</TableHead>
                        <TableHead className="text-xs font-semibold">Date</TableHead>
                        <TableHead className="text-xs font-semibold">Supplier</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                        <TableHead className="text-xs font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {linkedDocSamples.map((doc) => (
                        <TableRow key={doc.docNo} className="cursor-pointer hover:bg-primary/5">
                          <TableCell className="text-center"><input type="checkbox" className="rounded" /></TableCell>
                          <TableCell className="text-xs font-mono text-primary">{doc.docNo}</TableCell>
                          <TableCell className="text-xs">{doc.date}</TableCell>
                          <TableCell className="text-xs">{doc.supplier}</TableCell>
                          <TableCell className="text-xs text-right">{doc.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{doc.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button size="sm" className="h-8 text-xs gap-1"><Link2 className="h-3.5 w-3.5" /> Import Selected Items</Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showRecurring && (
          <TabsContent value="recurring" className="mt-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Recurring Purchase Setup</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Frequency</Label>
                    <Select value={recurFrequency} onValueChange={setRecurFrequency}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Number of Occurrences</Label>
                    <Input type="number" value={recurCount} onChange={(e) => setRecurCount(parseInt(e.target.value) || 0)} className="h-9 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Next Generation Date</Label>
                    <Input type="date" className="h-9 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Start Date</Label>
                    <Input type="date" className="h-9 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">End Date</Label>
                    <Input type="date" className="h-9 text-xs" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showImportFields && (
          <TabsContent value="import" className="mt-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Import Purchase Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">LC Number</Label>
                    <Input value={importLCNo} onChange={(e) => setImportLCNo(e.target.value)} className="h-9 text-xs" placeholder="LC-2024-..." />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Shipment Number</Label>
                    <Input value={importShipmentNo} onChange={(e) => setImportShipmentNo(e.target.value)} className="h-9 text-xs" placeholder="SHIP-..." />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Bill of Lading No.</Label>
                    <Input value={importBLNo} onChange={(e) => setImportBLNo(e.target.value)} className="h-9 text-xs" placeholder="BL-..." />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Port of Loading</Label>
                    <Input className="h-9 text-xs" placeholder="Enter port..." />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Port of Discharge</Label>
                    <Input className="h-9 text-xs" placeholder="Enter port..." />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">ETA</Label>
                    <Input type="date" className="h-9 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Country of Origin</Label>
                    <Input className="h-9 text-xs" placeholder="Enter country..." />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Incoterms</Label>
                    <Select defaultValue="cif">
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fob">FOB</SelectItem>
                        <SelectItem value="cif">CIF</SelectItem>
                        <SelectItem value="cfr">CFR</SelectItem>
                        <SelectItem value="exw">EXW</SelectItem>
                        <SelectItem value="dap">DAP</SelectItem>
                        <SelectItem value="ddp">DDP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Container Number</Label>
                    <Input className="h-9 text-xs" placeholder="CNTR-..." />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showReturnFields && (
          <TabsContent value="return" className="mt-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Return Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Original Document No.</Label>
                    <Input value={originalDocNo} onChange={(e) => setOriginalDocNo(e.target.value)} className="h-9 text-xs" placeholder="PI-2024-..." />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Return Reason</Label>
                    <Select value={returnReason} onValueChange={setReturnReason}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select reason" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="defective">Defective/Damaged</SelectItem>
                        <SelectItem value="wrong-item">Wrong Item Received</SelectItem>
                        <SelectItem value="excess">Excess Quantity</SelectItem>
                        <SelectItem value="quality">Quality Issues</SelectItem>
                        <SelectItem value="expired">Expired Items</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showGRNFields && (
          <TabsContent value="grn" className="mt-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Good Receipt Note Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">PO Reference</Label>
                    <Input value={grnPORef} onChange={(e) => setGrnPORef(e.target.value)} className="h-9 text-xs" placeholder="PO-2024-..." />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Inspection Status</Label>
                    <Select value={grnInspectionStatus} onValueChange={setGrnInspectionStatus}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending Inspection</SelectItem>
                        <SelectItem value="passed">Passed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="partial">Partial Acceptance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Received By</Label>
                    <Input className="h-9 text-xs" placeholder="Enter name..." />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Vehicle Number</Label>
                    <Input className="h-9 text-xs" placeholder="Enter vehicle no..." />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Driver Name</Label>
                    <Input className="h-9 text-xs" placeholder="Enter driver name..." />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Gate Entry No.</Label>
                    <Input className="h-9 text-xs" placeholder="GE-..." />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="notes" className="mt-3">
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Remarks (printed on document)</Label>
                <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="text-xs min-h-[80px]" placeholder="Enter remarks..." />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Internal Notes (not printed)</Label>
                <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} className="text-xs min-h-[80px]" placeholder="Enter internal notes..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
