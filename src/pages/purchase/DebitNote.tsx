import PurchaseDocumentForm from "@/components/purchase/PurchaseDocumentForm";

const DebitNote = () => (
  <PurchaseDocumentForm
    config={{
      title: "Debit Note",
      docType: "DN",
      showDebitNoteFields: true,
      linkedDocTypes: ["PI", "PR"],
    }}
  />
);

export default DebitNote;
