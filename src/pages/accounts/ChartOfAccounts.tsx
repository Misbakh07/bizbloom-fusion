import { useState, useCallback, useMemo } from "react";
import {
  ChevronRight, ChevronDown, Plus, Search, GripVertical,
  Edit2, Trash2, Save, X, FolderOpen, FileText,
  DollarSign, TrendingDown, Scale, BarChart3, CreditCard,
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
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────
interface Account {
  id: string;
  code: string;
  name: string;
  type: "category" | "account";
  accountType?: string;
  balance?: number;
  description?: string;
  status?: "active" | "inactive";
  children: Account[];
  expanded?: boolean;
}

const CATEGORY_ICONS: Record<string, { icon: typeof DollarSign; color: string }> = {
  Assets: { icon: DollarSign, color: "text-primary" },
  Liabilities: { icon: TrendingDown, color: "text-destructive" },
  Equity: { icon: Scale, color: "text-accent" },
  Revenue: { icon: BarChart3, color: "text-chart-4" },
  Expenses: { icon: CreditCard, color: "text-warning" },
};

const ACCOUNT_TYPES = [
  "Current Asset", "Fixed Asset", "Other Asset",
  "Current Liability", "Long-Term Liability",
  "Owner's Equity", "Retained Earnings",
  "Operating Revenue", "Other Revenue",
  "Operating Expense", "Cost of Goods Sold", "Other Expense",
];

// ── Default Data ───────────────────────────────────────
const defaultAccounts: Account[] = [
  {
    id: "1", code: "1000", name: "Assets", type: "category", expanded: true,
    children: [
      {
        id: "1-1", code: "1100", name: "Current Assets", type: "category", expanded: true,
        children: [
          { id: "1-1-1", code: "1110", name: "Cash in Hand", type: "account", accountType: "Current Asset", balance: 25000, status: "active", children: [] },
          { id: "1-1-2", code: "1120", name: "Bank Accounts", type: "account", accountType: "Current Asset", balance: 185000, status: "active", children: [] },
          { id: "1-1-3", code: "1130", name: "Accounts Receivable", type: "account", accountType: "Current Asset", balance: 92400, status: "active", children: [] },
          { id: "1-1-4", code: "1140", name: "Inventory", type: "account", accountType: "Current Asset", balance: 67500, status: "active", children: [] },
          { id: "1-1-5", code: "1150", name: "Prepaid Expenses", type: "account", accountType: "Current Asset", balance: 12000, status: "active", children: [] },
        ],
      },
      {
        id: "1-2", code: "1200", name: "Fixed Assets", type: "category", expanded: false,
        children: [
          { id: "1-2-1", code: "1210", name: "Property & Equipment", type: "account", accountType: "Fixed Asset", balance: 320000, status: "active", children: [] },
          { id: "1-2-2", code: "1220", name: "Vehicles", type: "account", accountType: "Fixed Asset", balance: 85000, status: "active", children: [] },
          { id: "1-2-3", code: "1230", name: "Accumulated Depreciation", type: "account", accountType: "Fixed Asset", balance: -45000, status: "active", children: [] },
        ],
      },
    ],
  },
  {
    id: "2", code: "2000", name: "Liabilities", type: "category", expanded: true,
    children: [
      {
        id: "2-1", code: "2100", name: "Current Liabilities", type: "category", expanded: true,
        children: [
          { id: "2-1-1", code: "2110", name: "Accounts Payable", type: "account", accountType: "Current Liability", balance: 45600, status: "active", children: [] },
          { id: "2-1-2", code: "2120", name: "Accrued Expenses", type: "account", accountType: "Current Liability", balance: 18200, status: "active", children: [] },
          { id: "2-1-3", code: "2130", name: "VAT Payable", type: "account", accountType: "Current Liability", balance: 8400, status: "active", children: [] },
          { id: "2-1-4", code: "2140", name: "Short-Term Loans", type: "account", accountType: "Current Liability", balance: 50000, status: "active", children: [] },
        ],
      },
      {
        id: "2-2", code: "2200", name: "Long-Term Liabilities", type: "category", expanded: false,
        children: [
          { id: "2-2-1", code: "2210", name: "Bank Loan", type: "account", accountType: "Long-Term Liability", balance: 200000, status: "active", children: [] },
          { id: "2-2-2", code: "2220", name: "Mortgage Payable", type: "account", accountType: "Long-Term Liability", balance: 180000, status: "active", children: [] },
        ],
      },
    ],
  },
  {
    id: "3", code: "3000", name: "Equity", type: "category", expanded: true,
    children: [
      { id: "3-1", code: "3100", name: "Owner's Capital", type: "account", accountType: "Owner's Equity", balance: 250000, status: "active", children: [] },
      { id: "3-2", code: "3200", name: "Retained Earnings", type: "account", accountType: "Retained Earnings", balance: 148700, status: "active", children: [] },
      { id: "3-3", code: "3300", name: "Drawing Account", type: "account", accountType: "Owner's Equity", balance: -24000, status: "active", children: [] },
    ],
  },
  {
    id: "4", code: "4000", name: "Revenue", type: "category", expanded: true,
    children: [
      { id: "4-1", code: "4100", name: "Sales Revenue", type: "account", accountType: "Operating Revenue", balance: 684250, status: "active", children: [] },
      { id: "4-2", code: "4200", name: "Service Revenue", type: "account", accountType: "Operating Revenue", balance: 125000, status: "active", children: [] },
      { id: "4-3", code: "4300", name: "Interest Income", type: "account", accountType: "Other Revenue", balance: 3200, status: "active", children: [] },
      { id: "4-4", code: "4400", name: "Other Income", type: "account", accountType: "Other Revenue", balance: 8500, status: "active", children: [] },
    ],
  },
  {
    id: "5", code: "5000", name: "Expenses", type: "category", expanded: true,
    children: [
      {
        id: "5-1", code: "5100", name: "Cost of Goods Sold", type: "category", expanded: false,
        children: [
          { id: "5-1-1", code: "5110", name: "Material Costs", type: "account", accountType: "Cost of Goods Sold", balance: 285000, status: "active", children: [] },
          { id: "5-1-2", code: "5120", name: "Direct Labor", type: "account", accountType: "Cost of Goods Sold", balance: 95000, status: "active", children: [] },
        ],
      },
      {
        id: "5-2", code: "5200", name: "Operating Expenses", type: "category", expanded: false,
        children: [
          { id: "5-2-1", code: "5210", name: "Rent Expense", type: "account", accountType: "Operating Expense", balance: 36000, status: "active", children: [] },
          { id: "5-2-2", code: "5220", name: "Utilities", type: "account", accountType: "Operating Expense", balance: 12400, status: "active", children: [] },
          { id: "5-2-3", code: "5230", name: "Salaries & Wages", type: "account", accountType: "Operating Expense", balance: 156000, status: "active", children: [] },
          { id: "5-2-4", code: "5240", name: "Office Supplies", type: "account", accountType: "Operating Expense", balance: 4800, status: "active", children: [] },
          { id: "5-2-5", code: "5250", name: "Insurance", type: "account", accountType: "Operating Expense", balance: 18000, status: "active", children: [] },
          { id: "5-2-6", code: "5260", name: "Marketing", type: "account", accountType: "Operating Expense", balance: 24000, status: "active", children: [] },
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

// ── Currency Formatter ──────────────────────────────────
const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);

// ── Component ───────────────────────────────────────────
const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>(defaultAccounts);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [addType, setAddType] = useState<"category" | "account">("account");
  const [dragId, setDragId] = useState<string | null>(null);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formAccountType, setFormAccountType] = useState("");
  const [formBalance, setFormBalance] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");

  const displayed = useMemo(() => filterTree(accounts, search), [accounts, search]);

  // Summary
  const summaryData = useMemo(() => {
    return accounts.map((cat) => ({
      name: cat.name,
      total: sumBalances(cat),
      count: (function countLeaves(n: Account): number {
        if (n.children.length === 0 && n.type === "account") return 1;
        return n.children.reduce((s, c) => s + countLeaves(c), 0);
      })(cat),
    }));
  }, [accounts]);

  // Open dialog
  const openAddDialog = useCallback(
    (parentId: string, type: "category" | "account") => {
      setEditingAccount(null);
      setAddParentId(parentId);
      setAddType(type);
      setFormCode("");
      setFormName("");
      setFormAccountType("");
      setFormBalance("");
      setFormDescription("");
      setFormStatus("active");
      setDialogOpen(true);
    },
    []
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
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formCode || !formName) {
      toast.error("Code and Name are required");
      return;
    }
    if (editingAccount) {
      setAccounts((prev) =>
        updateNode(prev, editingAccount.id, {
          code: formCode,
          name: formName,
          accountType: formAccountType || undefined,
          balance: formBalance ? parseFloat(formBalance) : undefined,
          description: formDescription || undefined,
          status: formStatus,
        })
      );
      toast.success("Account updated");
    } else if (addParentId) {
      const node: Account = {
        id: newId(),
        code: formCode,
        name: formName,
        type: addType,
        accountType: addType === "account" ? formAccountType || undefined : undefined,
        balance: addType === "account" && formBalance ? parseFloat(formBalance) : undefined,
        description: formDescription || undefined,
        status: formStatus,
        children: [],
        expanded: false,
      };
      setAccounts((prev) => insertNode(prev, addParentId, node));
      toast.success(`${addType === "category" ? "Category" : "Account"} added`);
    }
    setDialogOpen(false);
  }, [editingAccount, addParentId, addType, formCode, formName, formAccountType, formBalance, formDescription, formStatus]);

  const handleDelete = useCallback((id: string, name: string) => {
    setAccounts((prev) => removeNode(prev, id));
    toast.success(`"${name}" deleted`);
  }, []);

  // Drag & Drop
  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (dragId && dragId !== targetId) {
      setAccounts((prev) => moveNode(prev, dragId, targetId));
      toast.success("Hierarchy updated");
    }
    setDragId(null);
  };

  // ── Render Row ───────────────────────────────────────
  const renderRow = (node: Account, depth: number) => {
    const hasChildren = node.children.length > 0 || node.type === "category";
    const isCategory = node.type === "category";
    const catInfo = CATEGORY_ICONS[node.name];
    const Icon = catInfo?.icon;
    const isDragging = dragId === node.id;

    return (
      <div key={node.id}>
        {/* Row */}
        <div
          draggable
          onDragStart={() => handleDragStart(node.id)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(node.id)}
          className={`group flex items-center gap-2 py-2 px-3 border-b border-border/20 transition-all duration-150 hover:bg-secondary/30 ${
            isDragging ? "opacity-40" : ""
          } ${depth === 0 ? "bg-secondary/20" : ""}`}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          {/* Drag Handle */}
          <GripVertical
            size={14}
            className="text-muted-foreground/40 opacity-0 group-hover:opacity-100 cursor-grab shrink-0"
          />

          {/* Expand / Collapse */}
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

          {/* Icon */}
          {isCategory ? (
            Icon ? (
              <Icon size={16} className={catInfo.color + " shrink-0"} />
            ) : (
              <FolderOpen size={16} className="text-muted-foreground shrink-0" />
            )
          ) : (
            <FileText size={14} className="text-muted-foreground/60 shrink-0" />
          )}

          {/* Code */}
          <span className="font-mono text-xs text-primary w-16 shrink-0">{node.code}</span>

          {/* Name */}
          <span
            className={`flex-1 truncate text-sm ${
              isCategory ? "font-semibold text-foreground" : "text-foreground/80"
            }`}
          >
            {node.name}
          </span>

          {/* Account Type Badge */}
          {node.accountType && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shrink-0 hidden sm:inline-flex">
              {node.accountType}
            </Badge>
          )}

          {/* Status */}
          {node.type === "account" && node.status && (
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                node.status === "active" ? "bg-success" : "bg-muted-foreground/30"
              }`}
            />
          )}

          {/* Balance */}
          <span
            className={`font-mono text-xs w-24 text-right shrink-0 ${
              (node.balance ?? sumBalances(node)) < 0
                ? "text-destructive"
                : "text-foreground/70"
            }`}
          >
            {fmt(node.type === "account" ? (node.balance ?? 0) : sumBalances(node))}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {isCategory && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title="Add sub-category"
                  onClick={() => openAddDialog(node.id, "category")}
                >
                  <FolderOpen size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title="Add account"
                  onClick={() => openAddDialog(node.id, "account")}
                >
                  <Plus size={12} />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => openEditDialog(node)}
            >
              <Edit2 size={12} />
            </Button>
            {depth > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive/60 hover:text-destructive"
                onClick={() => handleDelete(node.id, node.name)}
              >
                <Trash2 size={12} />
              </Button>
            )}
          </div>
        </div>

        {/* Children */}
        {node.expanded &&
          node.children.map((child) => renderRow(child, depth + 1))}
      </div>
    );
  };

  // ── Main Render ──────────────────────────────────────
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account hierarchy — drag to reorder, click + to add
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
        {/* Table Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/30 border-b border-border/30 text-xs font-medium text-muted-foreground">
          <span style={{ width: 38 }} />
          <span className="w-5" />
          <span className="w-4" />
          <span className="font-mono w-16">Code</span>
          <span className="flex-1">Account Name</span>
          <span className="w-24 text-right">Balance</span>
          <span className="w-24" />
        </div>

        {/* Rows */}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAccount
                ? `Edit ${editingAccount.type === "category" ? "Category" : "Account"}`
                : addType === "category"
                ? "Add Sub-Category"
                : "Add Account"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Account Code *</Label>
                <Input value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="e.g. 1110" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as "active" | "inactive")}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Account Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Cash in Hand" className="h-9" />
            </div>

            {(addType === "account" || editingAccount?.type === "account") && (
              <>
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
                    <Input
                      type="number"
                      value={formBalance}
                      onChange={(e) => setFormBalance(e.target.value)}
                      placeholder="0"
                      className="h-9 font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Optional description…"
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

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
