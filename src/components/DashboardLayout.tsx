import { useState, ReactNode } from "react";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
