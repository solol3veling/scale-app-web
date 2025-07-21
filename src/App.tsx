import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthCallback } from "./components/AuthCallback";
import { OAuthCallback } from "./components/OAuthCallback";
import Overview from "./pages/Overview";
import Posts from "./pages/Posts";
import MakePost from "./pages/MakePost";
import Analytics from "./pages/Analytics";
import AccountManagement from "./pages/AccountManagement";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Calendar } from "./pages/Calendar";
import { WithCalendarErrorBoundary } from "./components/CalendarErrorBoundary";

// Import API testing utilities for development
if (import.meta.env.DEV) {
  import('@/utils/api-testing');
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Overview />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/posts" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Posts />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/make-post" element={
            <ProtectedRoute>
              <DashboardLayout>
                <MakePost />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <DashboardLayout>
                <WithCalendarErrorBoundary>
                  <Calendar />
                </WithCalendarErrorBoundary>
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/accounts" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AccountManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
