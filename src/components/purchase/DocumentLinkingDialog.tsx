import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2, FileText } from "lucide-react";

const linkedDocuments = [
  { id: "PO-2026-00012", type: "PO", date: "2026-03-10", supplier: "Al Futtaim Trading LLC", amount: 12500.00, status: "Approved" },
  { id: "PO-2026-00015", type: "PO", date: "2026-03-12", supplier: "Dubai Steel Industries", amount: 8750.00, status: "Approved" },
  { id: "PI-2026-00008", type: "PI", date: "2026-03-05", supplier: "Global Parts Supply Co.", amount: 5200.00, status: "Posted" },
  { id: "GRN-2026-00003", type: "GRN", date: "2026-03-08", supplier: "Al Futtaim Trading LLC", amount: 12500.00, status: "Received" },
  { id: "PO-2026-00018", type: "PO", date: "2026-03-15", supplier: "Emirates Hardware Dist.", amount: 3200.00, status: "Pending" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docType: string;
  linkedDocTypes: string[];
}

const DocumentLinkingDialog: React.FC<Props> = ({ open, onOpenChange, docType, linkedDocTypes }) => {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>("all");

  const toggleDoc = (id: string) => {
    setSelectedDocs((p) => p.includes(id) ? p.filter((d) => d !== id) : [...p, id]);
  };

  const filtered = linkedDocuments.filter(
    (d) => filterType === "all" || d.type === filterType
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Link Documents
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 mb-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="PO">Purchase Orders</SelectItem>
              <SelectItem value="PI">Purchase Invoices</SelectItem>
              <SelectItem value="GRN">GRN</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {selectedDocs.length} selected
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="text-xs">Doc No.</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Supplier</TableHead>
              <TableHead className="text-xs text-right">Amount</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((doc) => (
              <TableRow key={doc.id} className="cursor-pointer" onClick={() => toggleDoc(doc.id)}>
                <TableCell>
                  <Checkbox checked={selectedDocs.includes(doc.id)} />
                </TableCell>
                <TableCell className="text-xs font-mono">{doc.id}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">{doc.type}</Badge>
                </TableCell>
                <TableCell className="text-xs">{doc.date}</TableCell>
                <TableCell className="text-xs">{doc.supplier}</TableCell>
                <TableCell className="text-xs text-right">{doc.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={doc.status === "Approved" || doc.status === "Received" ? "default" : "secondary"} className="text-[10px]">
                    {doc.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)} disabled={selectedDocs.length === 0}>
            Link {selectedDocs.length} Document{selectedDocs.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentLinkingDialog;
