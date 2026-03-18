import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Download, AlertCircle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: any[]) => void;
}

const ExcelUploadDialog: React.FC<Props> = ({ open, onOpenChange, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" /> Import from Excel
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <Label htmlFor="excel-file" className="cursor-pointer">
              <span className="text-sm text-primary hover:underline">Choose file</span>
              <span className="text-sm text-muted-foreground"> or drag and drop</span>
            </Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFile}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Supports .xlsx, .xls, .csv
            </p>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-xs flex-1">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full">
            <Download className="h-3.5 w-3.5 mr-1" /> Download Template
          </Button>

          <div className="flex items-start gap-2 p-2 rounded-md bg-secondary/30">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Template columns: Location, Product Code, Description, Unit, Qty, Rate, Bin No, VAT%
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!file} onClick={() => {
            onImport([]);
            onOpenChange(false);
          }}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelUploadDialog;
