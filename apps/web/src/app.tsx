import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import { AuthGuard } from "./components/layout/AuthGuard";
import { getProfileApi } from "./features/auth/api";
import { useAuthStore } from "./features/auth/store";
import { queryClient } from "./lib/query-client";

import ChildDetailPage from "./routes/_auth/children/$childId";
import GrowthChartPage from "./routes/_auth/children/growth/chart";
import ChildGrowthPage from "./routes/_auth/children/growth/page";
import ChildrenListPage from "./routes/_auth/children/list";
import AddChildPage from "./routes/_auth/children/new";
import DashboardPage from "./routes/_auth/dashboard";
import ProfilePage from "./routes/_auth/profile";
import ForgotPasswordPage from "./routes/_public/forgot-password";
import HomePage from "./routes/_public/home";
import LoginPage from "./routes/_public/login";
import SignupPage from "./routes/_public/signup";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      const token = useAuthStore.getState().accessToken;
      if (!token) {
        clearAuth();
        return;
      }
      getProfileApi()
        .then((res) => setAuth(res.data, token))
        .catch(() => clearAuth())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, setAuth, clearAuth, setLoading]);

  return <>{children}</>;
}

function AuthLayout() {
  return (
    <AuthGuard>
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthGuard>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Authenticated routes — wrapped in AppShell layout */}
            <Route element={<AuthLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/children" element={<ChildrenListPage />} />
              <Route path="/children/new" element={<AddChildPage />} />
              <Route path="/children/:childId" element={<ChildDetailPage />} />
              <Route path="/children/:childId/growth" element={<ChildGrowthPage />} />
              <Route
                path="/children/:childId/growth/chart/:chartType"
                element={<GrowthChartPage />}
              />
            </Route>
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
