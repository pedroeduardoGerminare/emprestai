import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { cookies } from "next/headers";
import { createContext } from "@/server/api/context";
import { appRouter } from "@/server/api/root";
import { validMutationRequest } from "@/server/auth-request";

async function handler(request: Request) {
  if (!validMutationRequest(request)) return new Response("Requisição não permitida.", { status: 403 });
  const store = await cookies();
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext(store),
  });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export { handler as GET, handler as POST };
