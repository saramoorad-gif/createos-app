"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { installGlobalErrorHandlers } from "@/lib/error-logger";

// Installs global error handlers with user context once auth is ready
export function ErrorTracker() {
  const { user } = useAuth();

  useEffect(() => {
    installGlobalErrorHandlers(user?.id, user?.email);
  }, [user]);

  return null;
}
