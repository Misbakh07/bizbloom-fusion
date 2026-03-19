import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { type AdditionalCharge, additionalChargesMaster } from "./purchaseData";

interface Props {
  open: boolean;
  onClose: () => void;
  charges: AdditionalCharge[];
  onChange: (charges: AdditionalCharge[]) => void;
  subtotal: number;
}

export default function AdditionalAmountsDialog({ open, onClose, charges, onChange, subtotal }: Props) {
  const [local, setLocal] = useState<AdditionalCharge[]>(charges);

  const addCharge = () => {
    setLocal([...local, { id: crypto.randomUUID(), name: "", type: "fixed", value: 0, amount: 0, taxable: false }]);
  };

  const updateCharge = (index: number, field: string, value: string | number | boolean) => {
    const next = [...local];
    const row = { ...next[index], [field]: value };
    if (field === "name") {
      const master = additionalChargesMaster.find((m) => m.name === value);
      if (master) row.type = master.type;
    }
    row.amount = row.type === "percentage" ? (subtotal * row.value) / 100 : row.value;
    next[index] = row;
    setLocal(next);
  };

  const removeCharge = (index: number) => setLocal(local.filter((_, i) => i !== index));

  const save = () => { onChange(local); onClose(); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base">Additional Amounts / Charges</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="border border-border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-xs font-semibold">Charge Name</TableHead>
                  <TableHead className="text-xs font-semibold w-24">Type</TableHead>
                  <TableHead className="text-xs font-semibold w-24 text-right">Value</TableHead>
                  <TableHead className="text-xs font-semibold w-24 text-right">Amount</TableHead>
                  <TableHead className="text-xs font-semibold w-16 text-center">Taxable</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {local.map((charge, idx) => (
                  <TableRow key={charge.id}>
                    <TableCell className="p-1">
                      <Select value={charge.name} onValueChange={(v) => updateCharge(idx, "name", v)}>
                        <SelectTrigger className="h-8 text-xs border-0 bg-transparent"><SelectValue placeholder="Select charge" /></SelectTrigger>
                        <SelectContent>
                          {additionalChargesMaster.map((m) => <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-center capitalize">{charge.type}</TableCell>
                    <TableCell className="p-1">
                      <Input type="number" value={charge.value || ""} onChange={(e) => updateCharge(idx, "value", parseFloat(e.target.value) || 0)} className="h-8 text-xs text-right border-0 bg-transparent" />
                    </TableCell>
                    <TableCell className="text-xs text-right font-medium">{charge.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Checkbox checked={charge.taxable} onCheckedChange={(v) => updateCharge(idx, "taxable", !!v)} />
                    </TableCell>
                    <TableCell className="p-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeCharge(idx)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {local.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">No additional charges added</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={addCharge}>
            <Plus className="h-3.5 w-3.5" /> Add Charge
          </Button>
          <div className="flex justify-end text-sm font-semibold">
            Total Additional: {local.reduce((s, c) => s + c.amount, 0).toFixed(2)}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Apply Charges</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
