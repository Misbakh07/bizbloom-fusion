import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import ProductMaster from "./pages/inventory/ProductMaster";
import ChartOfAccounts from "./pages/accounts/ChartOfAccounts";
import ShelvesRacksBins from "./pages/inventory/ShelvesRacksBins";
import Locations from "./pages/inventory/Locations";
import BatchNumbers from "./pages/inventory/BatchNumbers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FavoritesProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/*"
              element={
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/inventory/products" element={<ProductMaster />} />
                    <Route path="/accounts/chart" element={<ChartOfAccounts />} />
                    <Route path="/inventory/shelves" element={<ShelvesRacksBins />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </DashboardLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
