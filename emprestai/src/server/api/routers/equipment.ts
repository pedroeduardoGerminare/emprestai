import { z } from "zod";
import { borrowEquipment, listEquipment, myLoans } from "../../services/equipment";
import { router, tenantProcedure } from "../trpc";

export const equipmentRouter = router({
  list: tenantProcedure.input(z.object({ cursor: z.string().min(1).max(100).optional(), limit: z.number().int().min(1).max(50).default(20) }).strict().optional()).query(({ ctx, input }) => listEquipment(ctx.db, ctx.tenantId, input?.cursor, input?.limit)),
  borrow: tenantProcedure.input(z.object({ equipmentId: z.uuid() }).strict()).mutation(({ ctx, input }) => borrowEquipment(ctx.db, ctx.tenantId, ctx.session.userId, input.equipmentId)),
  mine: tenantProcedure.input(z.void()).query(({ ctx }) => myLoans(ctx.db, ctx.tenantId, ctx.session.userId)),
});
