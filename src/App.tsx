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
import InventoryGroups from "./pages/inventory/InventoryGroups";
import ProductAttributes from "./pages/inventory/ProductAttributes";
import PriceListSetup from "./pages/inventory/PriceListSetup";
import BarcodeMaster from "./pages/inventory/BarcodeMaster";
import InventoryValuation from "./pages/reports/InventoryValuation";
import InventoryForecasting from "./pages/inventory/InventoryForecasting";
import PurchaseOrder from "./pages/purchase/PurchaseOrder";
import PurchaseInvoice from "./pages/purchase/PurchaseInvoice";
import RecurringPurchase from "./pages/purchase/RecurringPurchase";
import ServicePurchase from "./pages/purchase/ServicePurchase";
import ImportPurchase from "./pages/purchase/ImportPurchase";
import PurchaseReturn from "./pages/purchase/PurchaseReturn";
import GoodReceipt from "./pages/purchase/GoodReceipt";
import DebitNote from "./pages/purchase/DebitNote";
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
                    <Route path="/inventory/locations" element={<Locations />} />
                    <Route path="/inventory/batches" element={<BatchNumbers />} />
                    <Route path="/inventory/groups" element={<InventoryGroups />} />
                    <Route path="/inventory/attributes" element={<ProductAttributes />} />
                    <Route path="/inventory/price-list" element={<PriceListSetup />} />
                    <Route path="/inventory/barcodes" element={<BarcodeMaster />} />
                    <Route path="/inventory/forecasting" element={<InventoryForecasting />} />
                    <Route path="/reports/inventory-valuation" element={<InventoryValuation />} />
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
