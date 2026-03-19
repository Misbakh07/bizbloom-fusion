import { Package } from "lucide-react";
import PurchaseDocumentPage from "@/components/purchase/PurchaseDocumentPage";

export default function GoodReceipt() {
  return (
    <PurchaseDocumentPage
      title="Good Receipt / GRN"
      docType="GRN"
      docPrefix="GRN"
      icon={<Package className="h-5 w-5 text-primary-foreground" />}
      color="from-chart-2/80 to-chart-2"
      showGRNFields
      linkedDocuments={[
        { type: "po", label: "From Purchase Order", prefix: "PO" },
      ]}
    />
  );
}
