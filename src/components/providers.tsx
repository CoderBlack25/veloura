"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  // Created inside useState so each browser tab gets its own client instance
  // instead of sharing one across requests (important once this is
  // server-rendered — a module-level QueryClient would leak between users).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--color-brown-dark)",
            color: "var(--color-cream-light)",
            border: "none",
          },
        }}
      />
    </QueryClientProvider>
  );
}
