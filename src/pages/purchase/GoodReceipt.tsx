import PurchaseDocumentForm from "@/components/purchase/PurchaseDocumentForm";

const GoodReceipt = () => (
  <PurchaseDocumentForm
    config={{
      title: "Good Receipt / GRN",
      docType: "GRN",
      showGRNFields: true,
      linkedDocTypes: ["PO", "PI"],
    }}
  />
);

export default GoodReceipt;
