import PurchaseDocumentForm from "@/components/purchase/PurchaseDocumentForm";

const PurchaseReturn = () => (
  <PurchaseDocumentForm
    config={{
      title: "Purchase Return",
      docType: "PR",
      showReturnFields: true,
      linkedDocTypes: ["PI", "GRN"],
    }}
  />
);

export default PurchaseReturn;
