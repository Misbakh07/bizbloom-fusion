import { ArrowLeftRight } from "lucide-react";
import PurchaseDocumentPage from "@/components/purchase/PurchaseDocumentPage";

export default function PurchaseReturn() {
  return (
    <PurchaseDocumentPage
      title="Purchase Return"
      docType="Purchase Return"
      docPrefix="PR"
      icon={<ArrowLeftRight className="h-5 w-5 text-primary-foreground" />}
      color="from-destructive/80 to-destructive"
      showReturnFields
      linkedDocuments={[
        { type: "pi", label: "From Purchase Invoice", prefix: "PI" },
        { type: "grn", label: "From GRN", prefix: "GRN" },
      ]}
    />
  );
}
