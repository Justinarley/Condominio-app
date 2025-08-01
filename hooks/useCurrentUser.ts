import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export type UserPayload = {
  sub: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
};

export function useCurrentUser(): UserPayload | null {
  const [user, setUser] = useState<UserPayload | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode<UserPayload>(token);
      setUser(decoded);
    } catch {
      setUser(null);
    }
  }, []);

  return user;
}
