import PurchaseDocumentForm from "@/components/purchase/PurchaseDocumentForm";

const PurchaseInvoice = () => (
  <PurchaseDocumentForm
    config={{
      title: "Purchase Invoice",
      docType: "PI",
      linkedDocTypes: ["PO", "GRN"],
    }}
  />
);

export default PurchaseInvoice;
