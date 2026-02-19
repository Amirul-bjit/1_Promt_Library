import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token: string, user: User) => {
        setCookie("token", token, 7); // Store token in cookie for 7 days
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        deleteCookie("token");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
