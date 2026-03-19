import { FileText } from "lucide-react";
import PurchaseDocumentPage from "@/components/purchase/PurchaseDocumentPage";

export default function DebitNote() {
  return (
    <PurchaseDocumentPage
      title="Debit Note"
      docType="Debit Note"
      docPrefix="DN"
      icon={<FileText className="h-5 w-5 text-primary-foreground" />}
      color="from-chart-5/80 to-chart-5"
      linkedDocuments={[
        { type: "pi", label: "From Purchase Invoice", prefix: "PI" },
        { type: "pr", label: "From Purchase Return", prefix: "PR" },
      ]}
    />
  );
}
