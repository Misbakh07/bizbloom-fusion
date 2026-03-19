import { Briefcase } from "lucide-react";
import PurchaseDocumentPage from "@/components/purchase/PurchaseDocumentPage";

export default function ServicePurchase() {
  return (
    <PurchaseDocumentPage
      title="Service Purchase"
      docType="Service Purchase"
      docPrefix="SPI"
      icon={<Briefcase className="h-5 w-5 text-primary-foreground" />}
      color="from-chart-4/80 to-chart-4"
      showServiceFields
      linkedDocuments={[
        { type: "po", label: "From Purchase Order", prefix: "PO" },
      ]}
    />
  );
}
