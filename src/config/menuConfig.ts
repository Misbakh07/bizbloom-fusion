import {
  LayoutDashboard, ShoppingCart, Package, Receipt, CreditCard,
  FileText, BarChart3, Users, Building2, Wallet, ArrowLeftRight,
  ClipboardList, Settings, Layers, Truck, DollarSign, Calculator,
  FolderOpen, Upload, Shield, Clock, Bell, MessageSquare, Briefcase,
  Target, Globe, Landmark, BookOpen, UserCheck, TrendingUp, Boxes,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  id: string;
  title: string;
  icon?: LucideIcon;
  url?: string;
  children?: MenuItem[];
}

export interface MenuGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
}

export const menuGroups: MenuGroup[] = [
  {
    id: "dashboards",
    label: "Dashboards",
    icon: LayoutDashboard,
    items: [
      { id: "sales-dashboard", title: "Sales Dashboard", url: "/dashboard/sales" },
      { id: "purchase-dashboard", title: "Purchase Dashboard", url: "/dashboard/purchase" },
      { id: "financial-dashboard", title: "Financial Dashboard", url: "/dashboard/financial" },
      { id: "hr-dashboard", title: "HR Dashboard", url: "/dashboard/hr" },
      { id: "inventory-dashboard", title: "Inventory Dashboard", url: "/dashboard/inventory" },
      { id: "payroll-dashboard", title: "Payroll Dashboard", url: "/dashboard/payroll" },
      { id: "approval-dashboard", title: "Approval Dashboard", url: "/dashboard/approval" },
    ],
  },
  {
    id: "masters",
    label: "Masters",
    icon: Settings,
    items: [
      { id: "company-master", title: "Company Master", url: "/masters/company" },
      { id: "branch-master", title: "Branch Master", url: "/masters/branch" },
      { id: "division-master", title: "Division Master", url: "/masters/division" },
      { id: "currency-master", title: "Currency Master", url: "/masters/currency" },
      { id: "currency-exchange", title: "Currency Exchange Rate", url: "/masters/exchange-rate" },
      { id: "country-master", title: "Country", url: "/masters/country" },
      { id: "city-master", title: "City", url: "/masters/city" },
      { id: "uom-master", title: "Unit of Measure", url: "/masters/uom" },
      { id: "payment-terms", title: "Payment Terms", url: "/masters/payment-terms" },
      { id: "user-master", title: "User Master", url: "/masters/users" },
      { id: "user-access", title: "User Access Level", url: "/masters/access-levels" },
    ],
  },
  {
    id: "accounts",
    label: "Accounts",
    icon: BookOpen,
    items: [
      { id: "chart-of-accounts", title: "Chart of Accounts", url: "/accounts/chart" },
      { id: "account-types", title: "Account Types", url: "/accounts/types" },
      { id: "customers", title: "Customers", url: "/accounts/customers" },
      { id: "vendors", title: "Vendors", url: "/accounts/vendors" },
      { id: "expenses", title: "Expenses", url: "/accounts/expenses" },
      { id: "sub-ledger-groups", title: "Sub Ledger Groups", url: "/accounts/sub-ledger" },
      { id: "cost-centers", title: "Cost Centers", url: "/accounts/cost-centers" },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Boxes,
    items: [
      { id: "inventory-master", title: "Product Master", url: "/inventory/products" },
      { id: "inventory-groups", title: "Inventory Groups", url: "/inventory/groups" },
      { id: "locations", title: "Locations", url: "/inventory/locations" },
      { id: "shelves-racks", title: "Shelves / Racks / Bins", url: "/inventory/shelves" },
      { id: "batch-numbers", title: "Batch Numbers", url: "/inventory/batches" },
      { id: "barcode-master", title: "Barcode Master", url: "/inventory/barcodes" },
      { id: "brands", title: "Brands", url: "/inventory/brands" },
      { id: "price-list", title: "Price List Setup", url: "/inventory/price-list" },
      { id: "bill-of-material", title: "Bill of Material", url: "/inventory/bom" },
      { id: "services", title: "Services", url: "/inventory/services" },
    ],
  },
  {
    id: "purchase",
    label: "Purchase",
    icon: ShoppingCart,
    items: [
      { id: "purchase-order", title: "Purchase Order", url: "/purchase/order" },
      { id: "purchase-invoice", title: "Purchase Invoice", url: "/purchase/invoice" },
      { id: "purchase-return", title: "Purchase Return", url: "/purchase/return" },
      { id: "grn", title: "Good Receipts / GRN", url: "/purchase/grn" },
      { id: "import-purchase", title: "Import Purchase", url: "/purchase/import" },
      { id: "debit-note", title: "Debit Note", url: "/purchase/debit-note" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: TrendingUp,
    items: [
      { id: "sales-enquiry", title: "Sales Enquiry", url: "/sales/enquiry" },
      { id: "sales-quotation", title: "Sales Quotation", url: "/sales/quotation" },
      { id: "sales-order", title: "Sales Order", url: "/sales/order" },
      { id: "delivery-note", title: "Delivery Note", url: "/sales/delivery" },
      { id: "sales-invoice", title: "Sales Invoice", url: "/sales/invoice" },
      { id: "proforma-invoice", title: "Proforma Invoice", url: "/sales/proforma" },
      { id: "sales-return", title: "Sales Return", url: "/sales/return" },
      { id: "credit-note", title: "Credit Note", url: "/sales/credit-note" },
    ],
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: ArrowLeftRight,
    items: [
      { id: "journal-voucher", title: "Journal Voucher", url: "/transactions/journal" },
      { id: "cash-payment", title: "Cash Payment", url: "/transactions/cash-payment" },
      { id: "bank-payment", title: "Bank Payment", url: "/transactions/bank-payment" },
      { id: "cash-receipt", title: "Cash Receipt", url: "/transactions/cash-receipt" },
      { id: "bank-receipt", title: "Bank Receipt", url: "/transactions/bank-receipt" },
      { id: "company-expense", title: "Company Expense", url: "/transactions/expense" },
      { id: "contra-entry", title: "Contra Entry", url: "/transactions/contra" },
      { id: "allocation", title: "Transaction Allocation", url: "/transactions/allocation" },
    ],
  },
  {
    id: "banking",
    label: "Banking & PDC",
    icon: Landmark,
    items: [
      { id: "bank-reconciliation", title: "Bank Reconciliation", url: "/banking/reconciliation" },
      { id: "banks-master", title: "Banks Master", url: "/banking/banks" },
      { id: "pdc-matured", title: "Matured PDC", url: "/banking/pdc-matured" },
      { id: "pdc-maturing", title: "PDC Maturing", url: "/banking/pdc-maturing" },
      { id: "dishonoured", title: "Dishonoured Cheques", url: "/banking/dishonoured" },
    ],
  },
  {
    id: "stocks",
    label: "Stock Management",
    icon: Package,
    items: [
      { id: "physical-stock", title: "Physical Stock Entry", url: "/stocks/physical" },
      { id: "stock-adjustment", title: "Stock Adjustment", url: "/stocks/adjustment" },
      { id: "stock-transfer", title: "Stock Transfer", url: "/stocks/transfer" },
      { id: "stock-issue", title: "Stock Issue", url: "/stocks/issue" },
      { id: "stock-alerts", title: "Stock Alerts", url: "/stocks/alerts" },
      { id: "expiry-alerts", title: "Expiry Alerts", url: "/stocks/expiry" },
    ],
  },
  {
    id: "hr",
    label: "HR & Payroll",
    icon: Users,
    items: [
      { id: "employee-master", title: "Employee Master", url: "/hr/employees" },
      { id: "payroll-master", title: "Payroll Master", url: "/hr/payroll" },
      { id: "time-sheets", title: "Time Sheets", url: "/hr/timesheets" },
      { id: "attendance", title: "Attendance", url: "/hr/attendance" },
      { id: "salesman-master", title: "Salesman Master", url: "/hr/salesman" },
    ],
  },
  {
    id: "tax",
    label: "Tax Management",
    icon: Calculator,
    items: [
      { id: "vat", title: "VAT", url: "/tax/vat" },
      { id: "sales-tax", title: "Sales Tax", url: "/tax/sales" },
      { id: "income-tax", title: "Income Tax", url: "/tax/income" },
      { id: "tax-return", title: "Tax Return Submission", url: "/tax/return" },
    ],
  },
  {
    id: "projects",
    label: "Projects & Tasks",
    icon: Briefcase,
    items: [
      { id: "projects", title: "Projects", url: "/projects/list" },
      { id: "tasks", title: "Tasks", url: "/projects/tasks" },
      { id: "task-calendar", title: "Task Calendar", url: "/projects/calendar" },
      { id: "project-timesheet", title: "Project Timesheet", url: "/projects/timesheet" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    items: [
      { id: "sales-report", title: "Sales Report", url: "/reports/sales" },
      { id: "purchase-report", title: "Purchase Report", url: "/reports/purchase" },
      { id: "financial-report", title: "Financial Report", url: "/reports/financial" },
      { id: "inventory-report", title: "Inventory Report", url: "/reports/inventory" },
      { id: "trial-balance", title: "Trial Balance", url: "/reports/trial-balance" },
      { id: "profit-loss", title: "Profit & Loss", url: "/reports/profit-loss" },
      { id: "balance-sheet", title: "Balance Sheet", url: "/reports/balance-sheet" },
      { id: "cash-flow", title: "Cash Flow Statement", url: "/reports/cash-flow" },
      { id: "stock-balance", title: "Stock Balance", url: "/reports/stock-balance" },
      { id: "query-builder", title: "Query Builder", url: "/reports/query-builder" },
    ],
  },
  {
    id: "approvals",
    label: "Approvals",
    icon: Shield,
    items: [
      { id: "po-approval", title: "Purchase Order Approval", url: "/approvals/purchase-order" },
      { id: "pi-approval", title: "Purchase Invoice Approval", url: "/approvals/purchase-invoice" },
      { id: "payment-approval", title: "Payments Approval", url: "/approvals/payments" },
      { id: "receipt-approval", title: "Receipts Approval", url: "/approvals/receipts" },
      { id: "expense-approval", title: "Expense Approval", url: "/approvals/expenses" },
    ],
  },
  {
    id: "integrations",
    label: "Integration Brain",
    icon: Globe,
    items: [
      { id: "whatsapp", title: "WhatsApp", url: "/integrations/whatsapp" },
      { id: "ai-integrations", title: "AI Integrations", url: "/integrations/ai" },
      { id: "third-party", title: "3rd Party Integrations", url: "/integrations/third-party" },
      { id: "pos-setup", title: "POS Setup", url: "/integrations/pos" },
      { id: "barcode-setup", title: "Barcode Setup", url: "/integrations/barcode" },
      { id: "edi-setup", title: "EDI Setup", url: "/integrations/edi" },
    ],
  },
  {
    id: "uploads",
    label: "Uploads & Import",
    icon: Upload,
    items: [
      { id: "customer-upload", title: "Customer Upload", url: "/uploads/customer" },
      { id: "vendor-upload", title: "Vendor Upload", url: "/uploads/vendor" },
      { id: "product-upload", title: "Product Upload", url: "/uploads/product" },
      { id: "bulk-invoices", title: "Bulk Invoices", url: "/uploads/bulk-invoices" },
      { id: "bulk-payments", title: "Bulk Payments", url: "/uploads/bulk-payments" },
    ],
  },
];
