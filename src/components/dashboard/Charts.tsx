import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const revenueData = [
  { month: "Jul", revenue: 42000, expenses: 28000 },
  { month: "Aug", revenue: 48000, expenses: 31000 },
  { month: "Sep", revenue: 45000, expenses: 27000 },
  { month: "Oct", revenue: 52000, expenses: 32000 },
  { month: "Nov", revenue: 58000, expenses: 34000 },
  { month: "Dec", revenue: 62000, expenses: 36000 },
  { month: "Jan", revenue: 55000, expenses: 33000 },
  { month: "Feb", revenue: 68000, expenses: 38000 },
];

const moduleData = [
  { name: "Trading", value: 45000 },
  { name: "Pharmacy", value: 32000 },
  { name: "Manufacturing", value: 28000 },
  { name: "Construction", value: 18000 },
  { name: "Hospital", value: 22000 },
];

const invoiceData = [
  { month: "Sep", paid: 120, pending: 25, overdue: 8 },
  { month: "Oct", paid: 135, pending: 30, overdue: 5 },
  { month: "Nov", paid: 148, pending: 22, overdue: 12 },
  { month: "Dec", paid: 160, pending: 18, overdue: 6 },
  { month: "Jan", paid: 142, pending: 28, overdue: 10 },
  { month: "Feb", paid: 175, pending: 15, overdue: 4 },
];

const PIE_COLORS = [
  "hsl(213, 94%, 58%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 67%, 60%)",
  "hsl(350, 80%, 60%)",
];

const customTooltipStyle = {
  backgroundColor: "hsl(217, 33%, 17%)",
  border: "1px solid hsl(217, 33%, 22%)",
  borderRadius: "8px",
  color: "hsl(210, 40%, 98%)",
  fontSize: "12px",
};

export const RevenueChart = () => (
  <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "200ms" }}>
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Revenue vs Expenses</h3>
        <p className="text-xs text-muted-foreground">Last 8 months trend</p>
      </div>
      <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">
        +18.2%
      </span>
    </div>
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={revenueData}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(213, 94%, 58%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(213, 94%, 58%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(350, 80%, 60%)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(350, 80%, 60%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
        <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
        <Tooltip contentStyle={customTooltipStyle} />
        <Area type="monotone" dataKey="revenue" stroke="hsl(213, 94%, 58%)" fill="url(#revGrad)" strokeWidth={2} />
        <Area type="monotone" dataKey="expenses" stroke="hsl(350, 80%, 60%)" fill="url(#expGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const InvoiceChart = () => (
  <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "300ms" }}>
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Invoice Status</h3>
        <p className="text-xs text-muted-foreground">Monthly breakdown</p>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={invoiceData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
        <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={customTooltipStyle} />
        <Bar dataKey="paid" fill="hsl(160, 84%, 39%)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="pending" fill="hsl(38, 92%, 50%)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="overdue" fill="hsl(350, 80%, 60%)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const ModuleBreakdownChart = () => (
  <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "400ms" }}>
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground">Revenue by Module</h3>
      <p className="text-xs text-muted-foreground">Current quarter</p>
    </div>
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={moduleData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
            {moduleData.map((_, idx) => (
              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 flex-1">
        {moduleData.map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-mono font-medium text-foreground">
              ${(item.value / 1000).toFixed(0)}k
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
