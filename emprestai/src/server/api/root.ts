import { authRouter } from "./routers/auth";
import { router } from "./trpc";
import { equipmentRouter } from "./routers/equipment";

export const appRouter = router({ auth: authRouter, equipment: equipmentRouter });
export type AppRouter = typeof appRouter;
