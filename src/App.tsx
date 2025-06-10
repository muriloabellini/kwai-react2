
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Loading from "./pages/Loading";
import Partner from "./pages/Partner";
import Videos from "./pages/Videos";
import Pix from "./pages/Pix";
import Saque from "./pages/Saque";
import IOF from "./pages/IOF";
import Upsell1 from "./pages/Upsell1";
import Upsell2 from "./pages/Upsell2";
import Upsell3 from "./pages/Upsell3";
import Upsell4 from "./pages/Upsell4";
import Upsell5 from "./pages/Upsell5";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/pix" element={<Pix />} />
          <Route path="/saque" element={<Saque />} />
          <Route path="/iof" element={<IOF />} />
          <Route path="/upsell1" element={<Upsell1 />} />
          <Route path="/upsell2" element={<Upsell2 />} />
          <Route path="/upsell3" element={<Upsell3 />} />
          <Route path="/upsell4" element={<Upsell4 />} />
          <Route path="/upsell5" element={<Upsell5 />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
