import type { User } from "@golden-age/shared";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { getProfileApi, loginApi, logoutApi, registerApi } from "../api";
import { useAuthStore } from "../store";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, setLoading, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !user) {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        getProfileApi()
          .then((res) => setAuth(res.data, token))
          .catch(() => clearAuth())
          .finally(() => setLoading(false));
      } else {
        clearAuth();
      }
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, setAuth, clearAuth, setLoading]);

  const login = async (email: string, password: string) => {
    const res = await loginApi(email, password);
    setAuth(res.data.user, res.data.accessToken);
    return res.data.user;
  };

  const register = async (input: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ data: { user: User } }> => {
    return registerApi(input);
  };

  const logout = async () => {
    await logoutApi();
    clearAuth();
    navigate("/login");
  };

  return { user, isAuthenticated, isLoading, login, register, logout };
}
