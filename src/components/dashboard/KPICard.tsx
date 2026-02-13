import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "destructive";
  delay?: number;
}

const KPICard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  variant = "primary",
  delay = 0,
}: KPICardProps) => {
  return (
    <div
      className={cn("kpi-card", `kpi-card-${variant}`, "animate-fade-in")}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
          <div className="flex items-center gap-1.5">
            {changeType === "positive" ? (
              <TrendingUp size={12} className="text-success" />
            ) : changeType === "negative" ? (
              <TrendingDown size={12} className="text-destructive" />
            ) : null}
            <span
              className={cn(
                "text-xs font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            variant === "primary" && "bg-primary/10 text-primary",
            variant === "success" && "bg-success/10 text-success",
            variant === "warning" && "bg-warning/10 text-warning",
            variant === "destructive" && "bg-destructive/10 text-destructive"
          )}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export default KPICard;
