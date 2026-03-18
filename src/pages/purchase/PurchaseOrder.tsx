import PurchaseDocumentForm from "@/components/purchase/PurchaseDocumentForm";

const PurchaseOrder = () => (
  <PurchaseDocumentForm
    config={{
      title: "Purchase Order",
      docType: "PO",
      linkedDocTypes: ["PI", "GRN"],
    }}
  />
);

export default PurchaseOrder;
