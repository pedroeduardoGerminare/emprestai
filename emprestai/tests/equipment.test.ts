import { readFileSync, readdirSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { afterAll, beforeAll, expect, it } from "vitest";
import { appRouter } from "@/server/api/root";
import type { Context } from "@/server/api/context";

let container: StartedPostgreSqlContainer;
let db: PrismaClient;
const tenantA = "10000000-0000-0000-0000-000000000001";
const tenantB = "10000000-0000-0000-0000-000000000002";
const user = (n: number) => `20000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
const equipment = (n: number) => `40000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

function caller(n: number, tenantId = tenantA) {
  return appRouter.createCaller({ db, session: { userId: user(n), email: null }, tenantId, role: "collaborator" } as Context);
}

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const root = new URL("../prisma/migrations/", import.meta.url);
  const migrations = readdirSync(root).filter((name) => /^\d/.test(name)).sort().map((name) => readFileSync(new URL(`${name}/migration.sql`, root), "utf8")).join("\n");
  const fixtures = `
    INSERT INTO auth.users SELECT ('20000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid FROM generate_series(1,5) i;
    INSERT INTO profiles(user_id,display_name) SELECT id,'Test' FROM auth.users;
    INSERT INTO tenants(id,slug,name) VALUES ('${tenantA}','suporte_ti','A'),('${tenantB}','other','B');
    INSERT INTO memberships(tenant_id,user_id,role) SELECT '${tenantA}',id,'collaborator' FROM auth.users WHERE id<>'${user(5)}';
    INSERT INTO memberships VALUES ('${tenantB}','${user(5)}','collaborator');
    INSERT INTO categories(id,tenant_id,name) VALUES ('30000000-0000-0000-0000-000000000001','${tenantA}','Notebooks'),('30000000-0000-0000-0000-000000000002','${tenantB}','Notebooks');
    INSERT INTO equipment(id,tenant_id,category_id,asset_tag,name,pickup_location,image_url)
      SELECT ('40000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'${tenantA}','30000000-0000-0000-0000-000000000001','TI-'||lpad(i::text,4,'0'),'Notebook '||i,'Test location','https://example.com/'||i||'.jpg' FROM generate_series(1,15) i;
    INSERT INTO equipment(id,tenant_id,category_id,asset_tag,name,pickup_location,image_url) VALUES ('${equipment(16)}','${tenantB}','30000000-0000-0000-0000-000000000002','OTHER','Private B','Test location','https://example.com/private.jpg');
    UPDATE equipment SET state='maintenance' WHERE id='${equipment(9)}';
    UPDATE equipment SET state='retired' WHERE id='${equipment(10)}';
    INSERT INTO loans(tenant_id,equipment_id,borrower_id) VALUES ('${tenantA}','${equipment(3)}','${user(3)}'),('${tenantA}','${equipment(4)}','${user(3)}');
    INSERT INTO loans(tenant_id,equipment_id,borrower_id,borrowed_at,due_at) VALUES ('${tenantA}','${equipment(7)}','${user(4)}',now()-interval '20 days',now()-interval '1 day');
    INSERT INTO loans(tenant_id,equipment_id,borrower_id,borrowed_at,due_at) VALUES ('${tenantA}','${equipment(11)}','${user(1)}',now()-interval '20 days',now()-interval '1 day');
    UPDATE loans SET returned_at=now(),returned_by='${user(1)}' WHERE equipment_id='${equipment(11)}';
  `;
  await container.copyContentToContainer([{ target: "/tmp/equipment-setup.sql", content: readFileSync(new URL("./auth-bootstrap.sql", import.meta.url), "utf8") + "\n" + migrations + "\n" + fixtures }]);
  const result = await container.exec(["psql", "-U", container.getUsername(), "-d", container.getDatabase(), "-v", "ON_ERROR_STOP=1", "-f", "/tmp/equipment-setup.sql"]);
  expect(result.exitCode, result.stderr).toBe(0);
  db = new PrismaClient({ datasourceUrl: container.getConnectionUri() });
}, 120000);

afterAll(async () => { await db?.$disconnect(); await container?.stop(); }, 60000);

it("test_ca_01_catalogo_cursor_isola_tenant_e_rejeita_anonimo", async () => {
  const page = await caller(1).equipment.list({ limit: 2 });
  expect(page.items.map((item) => item.assetTag)).toEqual(["TI-0001", "TI-0002"]);
  expect(page.nextCursor).toBe("TI-0002");
  const next = await caller(1).equipment.list({ limit: 2, cursor: page.nextCursor! });
  expect(next.items[0].assetTag).toBe("TI-0003");
  const other = await caller(5, tenantB).equipment.list({ limit: 20 });
  expect(other.items.map((item) => item.assetTag)).toEqual(["OTHER"]);
  const anonymous = appRouter.createCaller({ db, session: null, tenantId: null, role: null } as Context);
  await expect(anonymous.equipment.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
});

it("test_ca_02_solicita_com_datas_servidor_e_prazo_14_dias_corridos", async () => {
  await expect(caller(1).equipment.borrow({ equipmentId: equipment(1), tenantId: tenantB } as never)).rejects.toMatchObject({ code: "BAD_REQUEST" });
  const loan = await caller(1).equipment.borrow({ equipmentId: equipment(1) });
  expect(loan.equipmentId).toBe(equipment(1));
  expect(loan.dueAt.getTime() - loan.borrowedAt.getTime()).toBe(14 * 86400000);
  const page = await caller(1).equipment.list({ limit: 20 });
  expect(page.items.find((item) => item.id === equipment(1))?.availability).toBe("borrowed");
  await expect(caller(5, tenantB).equipment.borrow({ equipmentId: equipment(1) })).rejects.toMatchObject({ code: "NOT_FOUND" });
});

it("test_ca_05_pedidos_simultaneos_mesmo_equipamento_criam_so_um", async () => {
  const results = await Promise.allSettled([caller(1).equipment.borrow({ equipmentId: equipment(2) }), caller(2).equipment.borrow({ equipmentId: equipment(2) })]);
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  const failure = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
  expect(failure.reason).toMatchObject({ code: "CONFLICT" });
  expect(await db.loan.count({ where: { tenantId: tenantA, equipmentId: equipment(2), returnedAt: null } })).toBe(1);
});

it("test_ca_03_corrida_no_limite_so_permite_terceiro_item", async () => {
  const results = await Promise.allSettled([caller(3).equipment.borrow({ equipmentId: equipment(5) }), caller(3).equipment.borrow({ equipmentId: equipment(6) })]);
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  const failure = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
  expect(failure.reason).toMatchObject({ code: "FORBIDDEN", message: "Limite de 3 empréstimos em aberto atingido." });
  expect(await db.loan.count({ where: { tenantId: tenantA, borrowerId: user(3), returnedAt: null } })).toBe(3);
});

it("test_ca_04_atraso_bloqueia_e_ca_05_manutencao_retired_bloqueiam", async () => {
  await expect(caller(4).equipment.borrow({ equipmentId: equipment(8) })).rejects.toMatchObject({ code: "FORBIDDEN", message: "Há item em atraso. Novo empréstimo bloqueado." });
  await expect(caller(2).equipment.borrow({ equipmentId: equipment(9) })).rejects.toMatchObject({ code: "CONFLICT" });
  await expect(caller(2).equipment.borrow({ equipmentId: equipment(10) })).rejects.toMatchObject({ code: "CONFLICT" });
});

it("test_ca_06_meus_emprestimos_so_retorna_dono_e_tenant", async () => {
  const mine = await caller(1).equipment.mine();
  expect(mine.some((loan) => loan.equipment.id === equipment(1))).toBe(true);
  expect(mine.every((loan) => ![equipment(3), equipment(4), equipment(7), equipment(11)].includes(loan.equipment.id))).toBe(true);
  expect(await caller(5, tenantB).equipment.mine()).toEqual([]);
});

