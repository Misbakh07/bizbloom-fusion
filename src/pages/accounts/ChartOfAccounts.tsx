import { useState, useCallback, useMemo } from "react";
import {
  ChevronRight, ChevronDown, Plus, Search, GripVertical,
  Edit2, Trash2, Save, X, FolderOpen, FileText,
  DollarSign, TrendingDown, Scale, BarChart3, CreditCard,
  Layers, Building2, Globe, Users, Tag, Briefcase, Settings2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────
interface Account {
  id: string;
  code: string;
  name: string;
  type: "main-group" | "sub-group" | "account";
  accountType?: string;
  balance?: number;
  description?: string;
  status?: "active" | "inactive" | "frozen";
  children: Account[];
  expanded?: boolean;
  // Advanced fields
  costCenter?: string;
  accountControl?: string;
  currency?: string;
  division?: string;
  branch?: string;
  project?: string;
  transactionType?: string;
  salesman?: string;
  priceList?: string;
  normalBalance?: "debit" | "credit";
  isCashAccount?: boolean;
  isBankAccount?: boolean;
  isControlAccount?: boolean;
  isReconcilable?: boolean;
  allowManualEntry?: boolean;
  taxApplicable?: boolean;
  budgetControlled?: boolean;
}

const CATEGORY_ICONS: Record<string, { icon: typeof DollarSign; color: string }> = {
  Assets: { icon: DollarSign, color: "text-primary" },
  Liabilities: { icon: TrendingDown, color: "text-destructive" },
  Equity: { icon: Scale, color: "text-accent" },
  Revenue: { icon: BarChart3, color: "text-chart-4" },
  Expenses: { icon: CreditCard, color: "text-warning" },
};

const ACCOUNT_TYPES = [
  "Current Asset", "Fixed Asset", "Other Asset", "Investments",
  "Current Liability", "Long-Term Liability", "Provision",
  "Owner's Equity", "Retained Earnings", "Reserves",
  "Operating Revenue", "Other Revenue", "Deferred Revenue",
  "Operating Expense", "Cost of Goods Sold", "Other Expense",
  "Depreciation", "Amortization", "Tax Expense",
];

const COST_CENTERS = [
  "Administration", "Sales & Marketing", "Production", "R&D",
  "Warehouse", "HR", "IT", "Finance", "Quality Control", "Logistics",
];

const ACCOUNT_CONTROLS = [
  "None", "Sub-Ledger Required", "Dimension Required",
  "Cost Center Required", "Project Required", "Budget Check",
  "Approval Required", "Auto Allocation",
];

const CURRENCIES = [
  "USD - US Dollar", "EUR - Euro", "GBP - British Pound",
  "AED - UAE Dirham", "SAR - Saudi Riyal", "INR - Indian Rupee",
  "CNY - Chinese Yuan", "JPY - Japanese Yen", "CAD - Canadian Dollar",
  "AUD - Australian Dollar", "Local Currency",
];

const DIVISIONS = [
  "Head Office", "North Region", "South Region", "East Region", "West Region",
  "International", "Online", "Wholesale", "Retail",
];

const BRANCHES = [
  "Main Branch", "Branch 001", "Branch 002", "Branch 003",
  "Branch 004", "Branch 005", "Warehouse Branch",
];

const PROJECTS = [
  "General", "Project Alpha", "Project Beta", "Project Gamma",
  "Capital Expenditure", "Maintenance", "Expansion",
];

const TRANSACTION_TYPES = [
  "All", "Cash Only", "Bank Only", "Journal Only",
  "Sales Only", "Purchase Only", "Receipt Only", "Payment Only",
  "Adjustment Only",
];

const SALESMEN = [
  "All Salesmen", "Team A", "Team B", "Direct Sales",
  "Online Sales", "Wholesale Team", "Retail Team",
];

const PRICE_LISTS = [
  "Default", "Wholesale", "Retail", "VIP", "Staff",
  "Distributor", "Export", "Promotional",
];

// ── Default Data ───────────────────────────────────────
const defaultAccounts: Account[] = [
  {
    id: "1", code: "1000", name: "Assets", type: "main-group", expanded: true,
    children: [
      {
        id: "1-1", code: "1100", name: "Current Assets", type: "sub-group", expanded: true,
        children: [
          { id: "1-1-1", code: "1110", name: "Cash in Hand", type: "account", accountType: "Current Asset", balance: 25000, status: "active", normalBalance: "debit", isCashAccount: true, currency: "Local Currency", costCenter: "Finance", allowManualEntry: true, children: [] },
          { id: "1-1-2", code: "1120", name: "Bank Accounts", type: "account", accountType: "Current Asset", balance: 185000, status: "active", normalBalance: "debit", isBankAccount: true, isReconcilable: true, currency: "Local Currency", costCenter: "Finance", children: [] },
          { id: "1-1-3", code: "1130", name: "Accounts Receivable", type: "account", accountType: "Current Asset", balance: 92400, status: "active", normalBalance: "debit", isControlAccount: true, accountControl: "Sub-Ledger Required", children: [] },
          { id: "1-1-4", code: "1140", name: "Inventory", type: "account", accountType: "Current Asset", balance: 67500, status: "active", normalBalance: "debit", children: [] },
          { id: "1-1-5", code: "1150", name: "Prepaid Expenses", type: "account", accountType: "Current Asset", balance: 12000, status: "active", normalBalance: "debit", children: [] },
        ],
      },
      {
        id: "1-2", code: "1200", name: "Fixed Assets", type: "sub-group", expanded: false,
        children: [
          { id: "1-2-1", code: "1210", name: "Property & Equipment", type: "account", accountType: "Fixed Asset", balance: 320000, status: "active", normalBalance: "debit", children: [] },
          { id: "1-2-2", code: "1220", name: "Vehicles", type: "account", accountType: "Fixed Asset", balance: 85000, status: "active", normalBalance: "debit", children: [] },
          { id: "1-2-3", code: "1230", name: "Accumulated Depreciation", type: "account", accountType: "Fixed Asset", balance: -45000, status: "active", normalBalance: "credit", children: [] },
        ],
      },
    ],
  },
  {
    id: "2", code: "2000", name: "Liabilities", type: "main-group", expanded: true,
    children: [
      {
        id: "2-1", code: "2100", name: "Current Liabilities", type: "sub-group", expanded: true,
        children: [
          { id: "2-1-1", code: "2110", name: "Accounts Payable", type: "account", accountType: "Current Liability", balance: 45600, status: "active", normalBalance: "credit", isControlAccount: true, accountControl: "Sub-Ledger Required", children: [] },
          { id: "2-1-2", code: "2120", name: "Accrued Expenses", type: "account", accountType: "Current Liability", balance: 18200, status: "active", normalBalance: "credit", children: [] },
          { id: "2-1-3", code: "2130", name: "VAT Payable", type: "account", accountType: "Current Liability", balance: 8400, status: "active", normalBalance: "credit", taxApplicable: true, children: [] },
          { id: "2-1-4", code: "2140", name: "Short-Term Loans", type: "account", accountType: "Current Liability", balance: 50000, status: "active", normalBalance: "credit", children: [] },
        ],
      },
      {
        id: "2-2", code: "2200", name: "Long-Term Liabilities", type: "sub-group", expanded: false,
        children: [
          { id: "2-2-1", code: "2210", name: "Bank Loan", type: "account", accountType: "Long-Term Liability", balance: 200000, status: "active", normalBalance: "credit", children: [] },
          { id: "2-2-2", code: "2220", name: "Mortgage Payable", type: "account", accountType: "Long-Term Liability", balance: 180000, status: "active", normalBalance: "credit", children: [] },
        ],
      },
    ],
  },
  {
    id: "3", code: "3000", name: "Equity", type: "main-group", expanded: true,
    children: [
      { id: "3-1", code: "3100", name: "Owner's Capital", type: "account", accountType: "Owner's Equity", balance: 250000, status: "active", normalBalance: "credit", children: [] },
      { id: "3-2", code: "3200", name: "Retained Earnings", type: "account", accountType: "Retained Earnings", balance: 148700, status: "active", normalBalance: "credit", children: [] },
      { id: "3-3", code: "3300", name: "Drawing Account", type: "account", accountType: "Owner's Equity", balance: -24000, status: "active", normalBalance: "debit", children: [] },
    ],
  },
  {
    id: "4", code: "4000", name: "Revenue", type: "main-group", expanded: true,
    children: [
      { id: "4-1", code: "4100", name: "Sales Revenue", type: "account", accountType: "Operating Revenue", balance: 684250, status: "active", normalBalance: "credit", salesman: "All Salesmen", priceList: "Default", children: [] },
      { id: "4-2", code: "4200", name: "Service Revenue", type: "account", accountType: "Operating Revenue", balance: 125000, status: "active", normalBalance: "credit", children: [] },
      { id: "4-3", code: "4300", name: "Interest Income", type: "account", accountType: "Other Revenue", balance: 3200, status: "active", normalBalance: "credit", children: [] },
      { id: "4-4", code: "4400", name: "Other Income", type: "account", accountType: "Other Revenue", balance: 8500, status: "active", normalBalance: "credit", children: [] },
    ],
  },
  {
    id: "5", code: "5000", name: "Expenses", type: "main-group", expanded: true,
    children: [
      {
        id: "5-1", code: "5100", name: "Cost of Goods Sold", type: "sub-group", expanded: false,
        children: [
          { id: "5-1-1", code: "5110", name: "Material Costs", type: "account", accountType: "Cost of Goods Sold", balance: 285000, status: "active", normalBalance: "debit", costCenter: "Production", children: [] },
          { id: "5-1-2", code: "5120", name: "Direct Labor", type: "account", accountType: "Cost of Goods Sold", balance: 95000, status: "active", normalBalance: "debit", costCenter: "Production", children: [] },
        ],
      },
      {
        id: "5-2", code: "5200", name: "Operating Expenses", type: "sub-group", expanded: false,
        children: [
          { id: "5-2-1", code: "5210", name: "Rent Expense", type: "account", accountType: "Operating Expense", balance: 36000, status: "active", normalBalance: "debit", costCenter: "Administration", children: [] },
          { id: "5-2-2", code: "5220", name: "Utilities", type: "account", accountType: "Operating Expense", balance: 12400, status: "active", normalBalance: "debit", children: [] },
          { id: "5-2-3", code: "5230", name: "Salaries & Wages", type: "account", accountType: "Operating Expense", balance: 156000, status: "active", normalBalance: "debit", costCenter: "HR", budgetControlled: true, children: [] },
          { id: "5-2-4", code: "5240", name: "Office Supplies", type: "account", accountType: "Operating Expense", balance: 4800, status: "active", normalBalance: "debit", children: [] },
          { id: "5-2-5", code: "5250", name: "Insurance", type: "account", accountType: "Operating Expense", balance: 18000, status: "active", normalBalance: "debit", children: [] },
          { id: "5-2-6", code: "5260", name: "Marketing", type: "account", accountType: "Operating Expense", balance: 24000, status: "active", normalBalance: "debit", costCenter: "Sales & Marketing", budgetControlled: true, children: [] },
        ],
      },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────
let idCounter = 100;
const newId = () => `new-${++idCounter}`;

function sumBalances(node: Account): number {
  if (node.children.length === 0) return node.balance ?? 0;
  return node.children.reduce((s, c) => s + sumBalances(c), 0);
}

function countLeaves(n: Account): number {
  if (n.children.length === 0 && n.type === "account") return 1;
  return n.children.reduce((s, c) => s + countLeaves(c), 0);
}

function filterTree(nodes: Account[], q: string): Account[] {
  if (!q) return nodes;
  const lower = q.toLowerCase();
  return nodes.reduce<Account[]>((acc, node) => {
    const match =
      node.name.toLowerCase().includes(lower) ||
      node.code.toLowerCase().includes(lower) ||
      (node.accountType ?? "").toLowerCase().includes(lower);
    const filteredChildren = filterTree(node.children, q);
    if (match || filteredChildren.length > 0) {
      acc.push({ ...node, children: filteredChildren, expanded: true });
    }
    return acc;
  }, []);
}

function insertNode(nodes: Account[], parentId: string, newNode: Account): Account[] {
  return nodes.map((n) => {
    if (n.id === parentId) return { ...n, children: [...n.children, newNode], expanded: true };
    return { ...n, children: insertNode(n.children, parentId, newNode) };
  });
}

function removeNode(nodes: Account[], id: string): Account[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, children: removeNode(n.children, id) }));
}

function updateNode(nodes: Account[], id: string, data: Partial<Account>): Account[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, ...data };
    return { ...n, children: updateNode(n.children, id, data) };
  });
}

function toggleNode(nodes: Account[], id: string): Account[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, expanded: !n.expanded };
    return { ...n, children: toggleNode(n.children, id) };
  });
}

function moveNode(nodes: Account[], dragId: string, dropId: string): Account[] {
  let draggedNode: Account | null = null;
  const findAndRemove = (list: Account[]): Account[] =>
    list.filter((n) => {
      if (n.id === dragId) { draggedNode = n; return false; }
      n.children = findAndRemove(n.children);
      return true;
    });
  const cleaned = findAndRemove(JSON.parse(JSON.stringify(nodes)));
  if (!draggedNode) return nodes;
  return insertNode(cleaned, dropId, draggedNode);
}

// Generate next serial code based on parent and siblings
function generateNextCode(parentCode: string, siblings: Account[], type: "main-group" | "sub-group" | "account"): string {
  if (type === "main-group") {
    // Top level: 1000, 2000, 3000...
    const maxCode = siblings.reduce((max, s) => {
      const num = parseInt(s.code);
      return num > max ? num : max;
    }, 0);
    return String(maxCode + 1000);
  }
  if (type === "sub-group") {
    // Under parent: parent base + 100 increments
    const base = parseInt(parentCode);
    const maxCode = siblings.reduce((max, s) => {
      const num = parseInt(s.code);
      return num > max ? num : max;
    }, base);
    const next = siblings.length === 0 ? base + 100 : maxCode + 100;
    return String(next);
  }
  // Account: parent base + 10 increments
  const base = parseInt(parentCode);
  const maxCode = siblings.reduce((max, s) => {
    const num = parseInt(s.code);
    return num > max ? num : max;
  }, base);
  const next = siblings.length === 0 ? base + 10 : maxCode + 10;
  return String(next);
}

function findNode(nodes: Account[], id: string): Account | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);

// ── Component ───────────────────────────────────────────
const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>(defaultAccounts);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [addType, setAddType] = useState<"main-group" | "sub-group" | "account">("account");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dialogTab, setDialogTab] = useState("general");

  // Form state - General
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formAccountType, setFormAccountType] = useState("");
  const [formBalance, setFormBalance] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive" | "frozen">("active");
  const [formNormalBalance, setFormNormalBalance] = useState<"debit" | "credit">("debit");

  // Form state - Advanced
  const [formCostCenter, setFormCostCenter] = useState("");
  const [formAccountControl, setFormAccountControl] = useState("");
  const [formCurrency, setFormCurrency] = useState("");
  const [formDivision, setFormDivision] = useState("");
  const [formBranch, setFormBranch] = useState("");
  const [formProject, setFormProject] = useState("");
  const [formTransactionType, setFormTransactionType] = useState("");
  const [formSalesman, setFormSalesman] = useState("");
  const [formPriceList, setFormPriceList] = useState("");

  // Form state - Flags
  const [formIsCash, setFormIsCash] = useState(false);
  const [formIsBank, setFormIsBank] = useState(false);
  const [formIsControl, setFormIsControl] = useState(false);
  const [formIsReconcilable, setFormIsReconcilable] = useState(false);
  const [formAllowManual, setFormAllowManual] = useState(true);
  const [formTaxApplicable, setFormTaxApplicable] = useState(false);
  const [formBudgetControlled, setFormBudgetControlled] = useState(false);

  const displayed = useMemo(() => filterTree(accounts, search), [accounts, search]);

  const summaryData = useMemo(() => {
    return accounts.map((cat) => ({
      name: cat.name,
      total: sumBalances(cat),
      count: countLeaves(cat),
    }));
  }, [accounts]);

  const resetForm = useCallback(() => {
    setFormCode(""); setFormName(""); setFormAccountType(""); setFormBalance("");
    setFormDescription(""); setFormStatus("active"); setFormNormalBalance("debit");
    setFormCostCenter(""); setFormAccountControl(""); setFormCurrency("");
    setFormDivision(""); setFormBranch(""); setFormProject("");
    setFormTransactionType(""); setFormSalesman(""); setFormPriceList("");
    setFormIsCash(false); setFormIsBank(false); setFormIsControl(false);
    setFormIsReconcilable(false); setFormAllowManual(true);
    setFormTaxApplicable(false); setFormBudgetControlled(false);
    setDialogTab("general");
  }, []);

  const openAddDialog = useCallback(
    (parentId: string | null, type: "main-group" | "sub-group" | "account") => {
      setEditingAccount(null);
      setAddParentId(parentId);
      setAddType(type);
      resetForm();

      // Auto-generate serial code
      if (type === "main-group") {
        setFormCode(generateNextCode("", accounts, "main-group"));
      } else if (parentId) {
        const parent = findNode(accounts, parentId);
        if (parent) {
          setFormCode(generateNextCode(parent.code, parent.children, type));
        }
      }
      setDialogOpen(true);
    },
    [accounts, resetForm]
  );

  const openEditDialog = useCallback((acc: Account) => {
    setEditingAccount(acc);
    setAddParentId(null);
    setFormCode(acc.code);
    setFormName(acc.name);
    setFormAccountType(acc.accountType ?? "");
    setFormBalance(acc.balance?.toString() ?? "");
    setFormDescription(acc.description ?? "");
    setFormStatus(acc.status ?? "active");
    setFormNormalBalance(acc.normalBalance ?? "debit");
    setFormCostCenter(acc.costCenter ?? "");
    setFormAccountControl(acc.accountControl ?? "");
    setFormCurrency(acc.currency ?? "");
    setFormDivision(acc.division ?? "");
    setFormBranch(acc.branch ?? "");
    setFormProject(acc.project ?? "");
    setFormTransactionType(acc.transactionType ?? "");
    setFormSalesman(acc.salesman ?? "");
    setFormPriceList(acc.priceList ?? "");
    setFormIsCash(acc.isCashAccount ?? false);
    setFormIsBank(acc.isBankAccount ?? false);
    setFormIsControl(acc.isControlAccount ?? false);
    setFormIsReconcilable(acc.isReconcilable ?? false);
    setFormAllowManual(acc.allowManualEntry ?? true);
    setFormTaxApplicable(acc.taxApplicable ?? false);
    setFormBudgetControlled(acc.budgetControlled ?? false);
    setDialogTab("general");
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formCode || !formName) {
      toast.error("Code and Name are required");
      return;
    }

    const accountData: Partial<Account> = {
      code: formCode,
      name: formName,
      accountType: formAccountType || undefined,
      balance: formBalance ? parseFloat(formBalance) : undefined,
      description: formDescription || undefined,
      status: formStatus,
      normalBalance: formNormalBalance,
      costCenter: formCostCenter || undefined,
      accountControl: formAccountControl || undefined,
      currency: formCurrency || undefined,
      division: formDivision || undefined,
      branch: formBranch || undefined,
      project: formProject || undefined,
      transactionType: formTransactionType || undefined,
      salesman: formSalesman || undefined,
      priceList: formPriceList || undefined,
      isCashAccount: formIsCash,
      isBankAccount: formIsBank,
      isControlAccount: formIsControl,
      isReconcilable: formIsReconcilable,
      allowManualEntry: formAllowManual,
      taxApplicable: formTaxApplicable,
      budgetControlled: formBudgetControlled,
    };

    if (editingAccount) {
      setAccounts((prev) => updateNode(prev, editingAccount.id, accountData));
      toast.success(`${editingAccount.type === "main-group" ? "Main Group" : editingAccount.type === "sub-group" ? "Sub Group" : "Account"} updated`);
    } else if (addType === "main-group") {
      const node: Account = {
        id: newId(),
        ...accountData,
        type: "main-group",
        children: [],
        expanded: true,
      } as Account;
      setAccounts((prev) => [...prev, node]);
      toast.success("Main Group added");
    } else if (addParentId) {
      const node: Account = {
        id: newId(),
        ...accountData,
        type: addType,
        children: [],
        expanded: false,
      } as Account;
      setAccounts((prev) => insertNode(prev, addParentId, node));
      toast.success(`${addType === "sub-group" ? "Sub Group" : "Account"} added`);
    }
    setDialogOpen(false);
  }, [editingAccount, addParentId, addType, formCode, formName, formAccountType, formBalance, formDescription, formStatus, formNormalBalance, formCostCenter, formAccountControl, formCurrency, formDivision, formBranch, formProject, formTransactionType, formSalesman, formPriceList, formIsCash, formIsBank, formIsControl, formIsReconcilable, formAllowManual, formTaxApplicable, formBudgetControlled]);

  const handleDelete = useCallback((id: string, name: string) => {
    setAccounts((prev) => removeNode(prev, id));
    toast.success(`"${name}" deleted`);
  }, []);

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (dragId && dragId !== targetId) {
      setAccounts((prev) => moveNode(prev, dragId, targetId));
      toast.success("Hierarchy updated");
    }
    setDragId(null);
  };

  const getTypeLabel = (type: Account["type"]) => {
    switch (type) {
      case "main-group": return "Main Group";
      case "sub-group": return "Sub Group";
      case "account": return "Account";
    }
  };

  const getTypeBadgeStyle = (type: Account["type"]) => {
    switch (type) {
      case "main-group": return "bg-primary/20 text-primary border-primary/30";
      case "sub-group": return "bg-accent/20 text-accent border-accent/30";
      case "account": return "bg-muted text-muted-foreground border-border";
    }
  };

  // ── Render Row ───────────────────────────────────────
  const renderRow = (node: Account, depth: number) => {
    const hasChildren = node.children.length > 0 || node.type !== "account";
    const isGroup = node.type === "main-group" || node.type === "sub-group";
    const catInfo = CATEGORY_ICONS[node.name];
    const Icon = catInfo?.icon;
    const isDragging = dragId === node.id;

    return (
      <div key={node.id}>
        <div
          draggable
          onDragStart={() => handleDragStart(node.id)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(node.id)}
          className={`group flex items-center gap-2 py-2 px-3 border-b border-border/20 transition-all duration-150 hover:bg-secondary/30 ${
            isDragging ? "opacity-40" : ""
          } ${depth === 0 ? "bg-secondary/20" : ""} ${depth === 1 && isGroup ? "bg-secondary/10" : ""}`}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          <GripVertical
            size={14}
            className="text-muted-foreground/40 opacity-0 group-hover:opacity-100 cursor-grab shrink-0"
          />

          <button
            onClick={() => setAccounts((prev) => toggleNode(prev, node.id))}
            className="w-5 h-5 flex items-center justify-center shrink-0"
          >
            {hasChildren ? (
              node.expanded ? (
                <ChevronDown size={14} className="text-muted-foreground" />
              ) : (
                <ChevronRight size={14} className="text-muted-foreground" />
              )
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            )}
          </button>

          {isGroup ? (
            Icon ? (
              <Icon size={16} className={catInfo!.color + " shrink-0"} />
            ) : (
              <FolderOpen size={16} className={node.type === "main-group" ? "text-primary shrink-0" : "text-muted-foreground shrink-0"} />
            )
          ) : (
            <FileText size={14} className="text-muted-foreground/60 shrink-0" />
          )}

          <span className="font-mono text-xs text-primary w-16 shrink-0">{node.code}</span>

          <span
            className={`flex-1 truncate text-sm ${
              node.type === "main-group" ? "font-bold text-foreground" : 
              node.type === "sub-group" ? "font-semibold text-foreground/90" : 
              "text-foreground/80"
            }`}
          >
            {node.name}
          </span>

          {/* Type badge */}
          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 shrink-0 hidden lg:inline-flex ${getTypeBadgeStyle(node.type)}`}>
            {getTypeLabel(node.type)}
          </Badge>

          {node.accountType && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shrink-0 hidden xl:inline-flex">
              {node.accountType}
            </Badge>
          )}

          {/* Indicators */}
          <div className="flex items-center gap-1 shrink-0 hidden sm:flex">
            {node.isCashAccount && <DollarSign size={10} className="text-accent" title="Cash Account" />}
            {node.isBankAccount && <Building2 size={10} className="text-primary" title="Bank Account" />}
            {node.isControlAccount && <Settings2 size={10} className="text-warning" title="Control Account" />}
            {node.budgetControlled && <Target size={10} className="text-chart-4" title="Budget Controlled" />}
          </div>

          {node.type === "account" && node.status && (
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                node.status === "active" ? "bg-success" : node.status === "frozen" ? "bg-warning" : "bg-muted-foreground/30"
              }`}
            />
          )}

          <span
            className={`font-mono text-xs w-24 text-right shrink-0 ${
              (node.balance ?? sumBalances(node)) < 0 ? "text-destructive" : "text-foreground/70"
            }`}
          >
            {fmt(node.type === "account" ? (node.balance ?? 0) : sumBalances(node))}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {node.type === "main-group" && (
              <>
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Add Sub Group" onClick={() => openAddDialog(node.id, "sub-group")}>
                  <Layers size={12} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Add Account" onClick={() => openAddDialog(node.id, "account")}>
                  <Plus size={12} />
                </Button>
              </>
            )}
            {node.type === "sub-group" && (
              <>
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Add Sub Group" onClick={() => openAddDialog(node.id, "sub-group")}>
                  <Layers size={12} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Add Account" onClick={() => openAddDialog(node.id, "account")}>
                  <Plus size={12} />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditDialog(node)}>
              <Edit2 size={12} />
            </Button>
            {depth > 0 && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive" onClick={() => handleDelete(node.id, node.name)}>
                <Trash2 size={12} />
              </Button>
            )}
          </div>
        </div>

        {node.expanded && node.children.map((child) => renderRow(child, depth + 1))}
      </div>
    );
  };

  const isAccountForm = addType === "account" || editingAccount?.type === "account";

  // ── Main Render ──────────────────────────────────────
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage main groups, sub groups & accounts with advanced controls
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search accounts…"
              className="pl-9 h-9 w-64 bg-secondary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" className="h-9" onClick={() => openAddDialog(null, "main-group")}>
            <Plus size={14} className="mr-1" /> Main Group
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {summaryData.map((s) => {
          const catInfo = CATEGORY_ICONS[s.name];
          const Icon = catInfo?.icon ?? DollarSign;
          return (
            <div key={s.name} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={catInfo?.color ?? "text-primary"} />
                <span className="text-xs font-medium text-muted-foreground">{s.name}</span>
              </div>
              <p className="font-mono text-lg font-bold text-foreground">{fmt(s.total)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.count} accounts</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/30 border-b border-border/30 text-xs font-medium text-muted-foreground">
          <span style={{ width: 38 }} />
          <span className="w-5" />
          <span className="w-4" />
          <span className="font-mono w-16">Code</span>
          <span className="flex-1">Account Name</span>
          <span className="w-24 text-right">Balance</span>
          <span className="w-28" />
        </div>

        <div className="max-h-[calc(100vh-360px)] overflow-y-auto scrollbar-thin">
          {displayed.length > 0 ? (
            displayed.map((node) => renderRow(node, 0))
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No accounts match your search.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingAccount ? (
                <>Edit {getTypeLabel(editingAccount.type)}</>
              ) : (
                <>
                  <Plus size={16} />
                  Add {getTypeLabel(addType)}
                </>
              )}
              <Badge variant="outline" className={`ml-2 text-[10px] ${getTypeBadgeStyle(editingAccount?.type ?? addType)}`}>
                {getTypeLabel(editingAccount?.type ?? addType)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={dialogTab} onValueChange={setDialogTab}>
            <TabsList className="w-full grid grid-cols-3 h-9">
              <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
              <TabsTrigger value="controls" className="text-xs" disabled={!isAccountForm && !editingAccount}>Controls & Dimensions</TabsTrigger>
              <TabsTrigger value="flags" className="text-xs" disabled={!isAccountForm && !editingAccount}>Account Flags</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Serial / Code *</Label>
                  <Input value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="Auto-generated" className="h-9 font-mono" />
                  <p className="text-[10px] text-muted-foreground">Auto-assigned, editable</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select value={formStatus} onValueChange={(v) => setFormStatus(v as "active" | "inactive" | "frozen")}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Normal Balance</Label>
                  <Select value={formNormalBalance} onValueChange={(v) => setFormNormalBalance(v as "debit" | "credit")}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Name *</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={`Enter ${getTypeLabel(editingAccount?.type ?? addType).toLowerCase()} name`} className="h-9" />
              </div>

              {isAccountForm && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Account Type</Label>
                    <Select value={formAccountType} onValueChange={setFormAccountType}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Opening Balance</Label>
                    <Input type="number" value={formBalance} onChange={(e) => setFormBalance(e.target.value)} placeholder="0" className="h-9 font-mono" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Optional description…" rows={2} className="resize-none" />
              </div>
            </TabsContent>

            {/* Controls & Dimensions Tab */}
            <TabsContent value="controls" className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Briefcase size={10} /> Cost Center</Label>
                  <Select value={formCostCenter} onValueChange={setFormCostCenter}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select cost center" /></SelectTrigger>
                    <SelectContent>
                      {COST_CENTERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Settings2 size={10} /> Account Control</Label>
                  <Select value={formAccountControl} onValueChange={setFormAccountControl}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select control" /></SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_CONTROLS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Globe size={10} /> Currency</Label>
                  <Select value={formCurrency} onValueChange={setFormCurrency}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Layers size={10} /> Division</Label>
                  <Select value={formDivision} onValueChange={setFormDivision}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select division" /></SelectTrigger>
                    <SelectContent>
                      {DIVISIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Building2 size={10} /> Branch</Label>
                  <Select value={formBranch} onValueChange={setFormBranch}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Briefcase size={10} /> Project</Label>
                  <Select value={formProject} onValueChange={setFormProject}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {PROJECTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Tag size={10} /> Transaction Type</Label>
                  <Select value={formTransactionType} onValueChange={setFormTransactionType}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Users size={10} /> Salesman</Label>
                  <Select value={formSalesman} onValueChange={setFormSalesman}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {SALESMEN.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><DollarSign size={10} /> Price List</Label>
                  <Select value={formPriceList} onValueChange={setFormPriceList}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {PRICE_LISTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Account Flags Tab */}
            <TabsContent value="flags" className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">Cash Account</p>
                    <p className="text-[10px] text-muted-foreground">Treat as cash for cash flow</p>
                  </div>
                  <Switch checked={formIsCash} onCheckedChange={setFormIsCash} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">Bank Account</p>
                    <p className="text-[10px] text-muted-foreground">Enable bank reconciliation</p>
                  </div>
                  <Switch checked={formIsBank} onCheckedChange={setFormIsBank} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">Control Account</p>
                    <p className="text-[10px] text-muted-foreground">Sub-ledger posting only</p>
                  </div>
                  <Switch checked={formIsControl} onCheckedChange={setFormIsControl} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">Reconcilable</p>
                    <p className="text-[10px] text-muted-foreground">Allow reconciliation</p>
                  </div>
                  <Switch checked={formIsReconcilable} onCheckedChange={setFormIsReconcilable} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">Allow Manual Entry</p>
                    <p className="text-[10px] text-muted-foreground">Direct journal posting</p>
                  </div>
                  <Switch checked={formAllowManual} onCheckedChange={setFormAllowManual} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">Tax Applicable</p>
                    <p className="text-[10px] text-muted-foreground">Subject to tax calculations</p>
                  </div>
                  <Switch checked={formTaxApplicable} onCheckedChange={setFormTaxApplicable} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30 col-span-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Budget Controlled</p>
                    <p className="text-[10px] text-muted-foreground">Enforce budget limits on transactions</p>
                  </div>
                  <Switch checked={formBudgetControlled} onCheckedChange={setFormBudgetControlled} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-9">
              <X size={14} className="mr-1" /> Cancel
            </Button>
            <Button onClick={handleSave} className="h-9">
              <Save size={14} className="mr-1" /> {editingAccount ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChartOfAccounts;
