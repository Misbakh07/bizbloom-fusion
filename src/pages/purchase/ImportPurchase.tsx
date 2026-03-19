import { Globe } from "lucide-react";
import PurchaseDocumentPage from "@/components/purchase/PurchaseDocumentPage";

export default function ImportPurchase() {
  return (
    <PurchaseDocumentPage
      title="Import Purchase Invoice"
      docType="Import Purchase"
      docPrefix="IMP"
      icon={<Globe className="h-5 w-5 text-primary-foreground" />}
      color="from-chart-2/80 to-chart-2"
      showImportFields
      linkedDocuments={[
        { type: "po", label: "From Purchase Order", prefix: "PO" },
      ]}
    />
  );
}
