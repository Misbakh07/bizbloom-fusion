import { Bell, MessageSquare, Search, Building2, ChevronDown } from "lucide-react";

const TopBar = () => {
  return (
    <header className="h-14 border-b border-border bg-card/40 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-sm">
          <Building2 size={14} className="text-muted-foreground" />
          <span className="text-foreground font-medium">Acme Corp</span>
          <ChevronDown size={12} className="text-muted-foreground" />
        </div>
      </div>

      {/* Center search */}
      <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-lg bg-secondary/30 border border-border w-80">
        <Search size={14} className="text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products, transactions, tools..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
        />
        <kbd className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">⌘K</kbd>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <MessageSquare size={16} className="text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
        </button>
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell size={16} className="text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">SA</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
