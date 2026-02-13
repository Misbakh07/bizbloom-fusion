import { Clock, ArrowUpRight, ArrowDownLeft, FileText, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "invoice",
    title: "Invoice #INV-2024-0847 created",
    description: "Sales invoice for Acme Pharma - $12,450",
    time: "2 min ago",
    icon: FileText,
    color: "text-primary",
  },
  {
    id: 2,
    type: "payment",
    title: "Payment received from Gulf Trading",
    description: "Bank receipt - $28,600 (AED equivalent)",
    time: "15 min ago",
    icon: ArrowDownLeft,
    color: "text-success",
  },
  {
    id: 3,
    type: "expense",
    title: "Expense approved by Finance Head",
    description: "Office supplies - Branch Karachi - PKR 45,000",
    time: "1 hr ago",
    icon: ArrowUpRight,
    color: "text-warning",
  },
  {
    id: 4,
    type: "user",
    title: "New user added: Ahmad Raza",
    description: "Role: Inventory Manager - Dubai Branch",
    time: "3 hrs ago",
    icon: UserPlus,
    color: "text-primary",
  },
  {
    id: 5,
    type: "invoice",
    title: "Purchase order #PO-2024-0392 approved",
    description: "Raw materials - Manufacturing unit",
    time: "5 hrs ago",
    icon: FileText,
    color: "text-accent",
  },
];

const RecentActivity = () => {
  return (
    <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "500ms" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">Latest operations across modules</p>
        </div>
        <button className="text-xs text-primary hover:underline">View all</button>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-secondary/50 shrink-0", activity.color)}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{activity.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{activity.description}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                <Clock size={10} />
                {activity.time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
