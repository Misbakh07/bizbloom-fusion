import PurchaseDocumentForm from "@/components/purchase/PurchaseDocumentForm";

const RecurringPurchase = () => (
  <PurchaseDocumentForm
    config={{
      title: "Recurring Purchase",
      docType: "RP",
      showRecurringFields: true,
      linkedDocTypes: ["PO", "PI"],
    }}
  />
);

export default RecurringPurchase;
