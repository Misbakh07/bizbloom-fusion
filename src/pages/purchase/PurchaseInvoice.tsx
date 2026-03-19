import { FileText } from "lucide-react";
import PurchaseDocumentPage from "@/components/purchase/PurchaseDocumentPage";

export default function PurchaseInvoice() {
  return (
    <PurchaseDocumentPage
      title="Purchase Invoice"
      docType="Purchase Invoice"
      docPrefix="PI"
      icon={<FileText className="h-5 w-5 text-primary-foreground" />}
      color="from-primary/80 to-primary"
      linkedDocuments={[
        { type: "po", label: "From Purchase Order", prefix: "PO" },
        { type: "grn", label: "From GRN", prefix: "GRN" },
      ]}
    />
  );
}
