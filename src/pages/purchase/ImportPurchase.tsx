import PurchaseDocumentForm from "@/components/purchase/PurchaseDocumentForm";

const ImportPurchase = () => (
  <PurchaseDocumentForm
    config={{
      title: "Import Purchase Invoice",
      docType: "IMP",
      showImportFields: true,
      linkedDocTypes: ["PO", "GRN"],
    }}
  />
);

export default ImportPurchase;
