import {
  DollarSign, TrendingUp, Receipt, CreditCard,
  ShoppingCart, Package, Users, AlertTriangle,
} from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";
import { RevenueChart, InvoiceChart, ModuleBreakdownChart } from "@/components/dashboard/Charts";
import RecentActivity from "@/components/dashboard/RecentActivity";

const kpis = [
  {
    title: "Total Revenue",
    value: "$684,250",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: DollarSign,
    variant: "primary" as const,
  },
  {
    title: "Net Profit",
    value: "$248,120",
    change: "+8.3%",
    changeType: "positive" as const,
    icon: TrendingUp,
    variant: "success" as const,
  },
  {
    title: "Outstanding Invoices",
    value: "$92,400",
    change: "-4.2%",
    changeType: "positive" as const,
    icon: Receipt,
    variant: "warning" as const,
  },
  {
    title: "Overdue Payments",
    value: "$18,650",
    change: "+2.1%",
    changeType: "negative" as const,
    icon: AlertTriangle,
    variant: "destructive" as const,
  },
];

const quickStats = [
  { label: "Active Companies", value: "24", icon: Users },
  { label: "Open Orders", value: "156", icon: ShoppingCart },
  { label: "Low Stock Items", value: "38", icon: Package },
  { label: "Pending Approvals", value: "12", icon: CreditCard },
];

const Index = () => {
  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Welcome back, <span className="gradient-text">Super Admin</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's an overview of your financial operations across all companies
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="pulse-dot" />
          <span className="text-xs text-muted-foreground">All systems operational</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} delay={i * 100} />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card-hover p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center">
                <Icon size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold font-mono text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart />
        <InvoiceChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <ModuleBreakdownChart />
      </div>
    </div>
  );
};

export default Index;
