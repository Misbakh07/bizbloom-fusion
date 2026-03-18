import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

const additionalAmountMaster = [
  { id: "freight", name: "Freight Charges" },
  { id: "insurance", name: "Insurance" },
  { id: "customs", name: "Customs Duty" },
  { id: "handling", name: "Handling Charges" },
  { id: "packaging", name: "Packaging" },
  { id: "clearance", name: "Clearance Charges" },
  { id: "inspection", name: "Inspection Fees" },
  { id: "other", name: "Other Charges" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineId: string | null;
  currentDetails: { name: string; amount: number }[];
  onSave: (lineId: string, details: { name: string; amount: number }[]) => void;
}

const AdditionalAmountDialog: React.FC<Props> = ({
  open, onOpenChange, lineId, currentDetails, onSave,
}) => {
  const [details, setDetails] = useState<{ name: string; amount: number }[]>([]);

  useEffect(() => {
    if (open) {
      setDetails(currentDetails.length > 0 ? [...currentDetails] : [{ name: "", amount: 0 }]);
    }
  }, [open, currentDetails]);

  const addRow = () => setDetails((p) => [...p, { name: "", amount: 0 }]);

  const removeRow = (idx: number) => {
    if (details.length === 1) return;
    setDetails((p) => p.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: "name" | "amount", value: any) => {
    setDetails((p) => p.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const total = details.reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Additional Amounts</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Charge Type</TableHead>
              <TableHead className="text-xs text-right">Amount</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((d, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Select value={d.name} onValueChange={(v) => updateRow(i, "name", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {additionalAmountMaster.map((a) => (
                        <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="h-8 text-xs text-right"
                    value={d.amount || ""}
                    onChange={(e) => updateRow(i, "amount", Number(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeRow(i)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Charge
          </Button>
          <span className="text-sm font-semibold">Total: {total.toFixed(2)}</span>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            if (lineId) onSave(lineId, details.filter((d) => d.name && d.amount));
            onOpenChange(false);
          }}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdditionalAmountDialog;
