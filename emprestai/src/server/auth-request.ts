/** Mutations accept only same-origin JSON, never form submissions or cross-site POST. */
export function validMutationRequest(request: Request) {
  if (request.method !== "POST") return true;
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return false;
  return request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() === "application/json";
}
