import PurchaseDocumentForm from "@/components/purchase/PurchaseDocumentForm";

const ServicePurchase = () => (
  <PurchaseDocumentForm
    config={{
      title: "Service Purchase",
      docType: "SP",
      showServiceFields: true,
      linkedDocTypes: ["PO", "PI"],
    }}
  />
);

export default ServicePurchase;
