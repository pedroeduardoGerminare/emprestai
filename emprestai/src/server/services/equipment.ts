import { Prisma, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export async function listEquipment(db: PrismaClient, tenantId: string, cursor?: string, limit = 20) {
  const rows = await db.equipment.findMany({
    where: { tenantId, ...(cursor ? { assetTag: { gt: cursor } } : {}) },
    orderBy: { assetTag: "asc" }, take: limit + 1,
    include: { category: { select: { name: true } }, loans: { where: { returnedAt: null }, select: { id: true }, take: 1 } },
  });
  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);
  return {
    items: page.map(({ category, loans, ...item }) => ({
      id: item.id, assetTag: item.assetTag, name: item.name, imageUrl: item.imageUrl,
      category, pickupLocation: item.pickupLocation,
      availability: loans.length ? "borrowed" as const : item.state,
    })),
    nextCursor: hasMore ? page[page.length - 1].assetTag : null,
  };
}

export async function myLoans(db: PrismaClient, tenantId: string, userId: string) {
  return db.loan.findMany({
    where: { tenantId, borrowerId: userId, returnedAt: null },
    orderBy: [{ dueAt: "asc" }, { id: "asc" }],
    select: { id: true, borrowedAt: true, dueAt: true, equipment: { select: { id: true, assetTag: true, name: true, imageUrl: true, category: { select: { name: true } } } } },
  });
}

export async function borrowEquipment(db: PrismaClient, tenantId: string, userId: string, equipmentId: string) {
  try {
    return await db.$transaction(async (tx) => {
      // Serialize requests by borrower before checking the limit; the trigger uses the same lock order.
      const membership = await tx.$queryRaw<{ user_id: string }[]>`SELECT user_id FROM public.memberships WHERE tenant_id = ${tenantId}::uuid AND user_id = ${userId}::uuid FOR UPDATE`;
      if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "Conta sem acesso a esta área." });
      const now = new Date();
      const open = await tx.loan.findMany({ where: { tenantId, borrowerId: userId, returnedAt: null }, select: { dueAt: true } });
      if (open.some((loan) => loan.dueAt < now)) throw new TRPCError({ code: "FORBIDDEN", message: "Há item em atraso. Novo empréstimo bloqueado." });
      if (open.length >= 3) throw new TRPCError({ code: "FORBIDDEN", message: "Limite de 3 empréstimos em aberto atingido." });
      await tx.$queryRaw`SELECT id FROM public.equipment WHERE tenant_id = ${tenantId}::uuid AND id = ${equipmentId}::uuid FOR UPDATE`;
      const item = await tx.equipment.findFirst({ where: { id: equipmentId, tenantId }, select: { id: true, state: true } });
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Equipamento não encontrado." });
      if (item.state !== "available") throw new TRPCError({ code: "CONFLICT", message: "Equipamento indisponível para empréstimo." });
      const active = await tx.loan.findFirst({ where: { tenantId, equipmentId, returnedAt: null }, select: { id: true } });
      if (active) throw new TRPCError({ code: "CONFLICT", message: "Este equipamento já foi emprestado." });
      return tx.loan.create({
        data: { tenantId, borrowerId: userId, equipmentId, borrowedAt: now, dueAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) },
        select: { id: true, equipmentId: true, borrowedAt: true, dueAt: true },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2002" || error.code === "P2034")) {
      throw new TRPCError({ code: "CONFLICT", message: "Este equipamento acabou de ficar indisponível. Atualize o catálogo." });
    }
    // Database constraints are the final barrier; never expose internal SQL/connection details.
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível concluir o empréstimo." });
  }
}
