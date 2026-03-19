import { Receipt } from "lucide-react";
import PurchaseDocumentPage from "@/components/purchase/PurchaseDocumentPage";

export default function RecurringPurchase() {
  return (
    <PurchaseDocumentPage
      title="Recurring Purchase"
      docType="Recurring Purchase"
      docPrefix="RPI"
      icon={<Receipt className="h-5 w-5 text-primary-foreground" />}
      color="from-chart-3/80 to-chart-3"
      showRecurring
      linkedDocuments={[]}
    />
  );
}
