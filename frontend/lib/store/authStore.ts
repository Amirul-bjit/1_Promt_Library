import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setCookie, deleteCookie } from "@/lib/cookies";

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

/** Read the token cookie synchronously at module load time (client-side only).
 *  This ensures isAuthenticated is true on the very first render, before
 *  Zustand's persist middleware finishes rehydrating from localStorage. */
const getTokenFromCookie = (): string | null => {
  if (typeof window === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));
  return match ? match.substring("token=".length) : null;
};

const cookieToken = getTokenFromCookie();

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: cookieToken,
      isAuthenticated: !!cookieToken,
      login: (token: string, user: User) => {
        setCookie("token", token, 7);
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
