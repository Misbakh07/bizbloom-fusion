import { ShoppingCart } from "lucide-react";
import PurchaseDocumentPage from "@/components/purchase/PurchaseDocumentPage";

export default function PurchaseOrder() {
  return (
    <PurchaseDocumentPage
      title="Purchase Order"
      docType="Purchase Order"
      docPrefix="PO"
      icon={<ShoppingCart className="h-5 w-5 text-primary-foreground" />}
      color="from-primary/80 to-primary"
      linkedDocuments={[]}
    />
  );
}
