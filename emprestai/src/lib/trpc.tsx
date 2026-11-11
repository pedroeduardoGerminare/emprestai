"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

export const api = createTRPCReact<AppRouter>();
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function ApiProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  const [client] = useState(() => api.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })] }));
  return <api.Provider client={client} queryClient={queryClient}><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></api.Provider>;
}
