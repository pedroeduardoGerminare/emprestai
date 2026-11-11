import { readFileSync, readdirSync } from "node:fs";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let database: StartedPostgreSqlContainer;
const a = "10000000-0000-0000-0000-000000000001";
const b = "10000000-0000-0000-0000-000000000002";
const admin = "20000000-0000-0000-0000-000000000001";
const member = "20000000-0000-0000-0000-000000000002";
const outsider = "20000000-0000-0000-0000-000000000003";
const equipment = (number: number) => `40000000-0000-0000-0000-${String(number).padStart(12, "0")}`;

async function query(sql: string) {
  return database.exec(["psql", "-U", database.getUsername(), "-d", database.getDatabase(), "-v", "ON_ERROR_STOP=1", "-Atc", sql]);
}

function loan(number: number, borrower = member, tenant = a) {
  return `INSERT INTO loans (tenant_id,equipment_id,borrower_id) VALUES ('${tenant}','${equipment(number)}','${borrower}');`;
}

beforeAll(async () => {
  database = await new PostgreSqlContainer("postgres:16-alpine").start();
  const bootstrap = readFileSync(new URL("./auth-bootstrap.sql", import.meta.url), "utf8");
  const migrationsRoot = new URL("../prisma/migrations/", import.meta.url);
  const migrations = readdirSync(migrationsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (!migrations.length) throw new Error("Migrations ausentes");
  const ddl = migrations.map((name) => readFileSync(new URL(`${name}/migration.sql`, migrationsRoot), "utf8")).join("\n");
  const fixtures = `
    INSERT INTO auth.users VALUES ('${admin}'),('${member}'),('${outsider}');
    INSERT INTO profiles (user_id,display_name) VALUES ('${admin}','Admin A'),('${member}','Member A'),('${outsider}','Member B');
    INSERT INTO tenants (id,slug,name) VALUES ('${a}','a','A'),('${b}','b','B');
    INSERT INTO memberships VALUES ('${a}','${admin}','admin'),('${a}','${member}','collaborator'),('${b}','${outsider}','admin');
    INSERT INTO categories (id,tenant_id,name) VALUES ('30000000-0000-0000-0000-000000000001','${a}','Notebooks'),('30000000-0000-0000-0000-000000000002','${b}','Notebooks');
    INSERT INTO equipment (id,tenant_id,category_id,asset_tag,name,pickup_location)
      SELECT ('40000000-0000-0000-0000-' || lpad(i::text,12,'0'))::uuid, '${a}'::uuid,'30000000-0000-0000-0000-000000000001'::uuid,'PAT-'||i,'Notebook '||i,'Balcão' FROM generate_series(1,6) i;
    INSERT INTO equipment (id,tenant_id,category_id,asset_tag,name,pickup_location)
      VALUES ('${equipment(7)}','${b}','30000000-0000-0000-0000-000000000002','PAT-B','Notebook B','Balcão');
  `;
  await database.copyContentToContainer([{ content: bootstrap + "\n" + ddl + "\n" + fixtures, target: "/tmp/setup.sql" }]);
  const result = await database.exec(["psql", "-U", database.getUsername(), "-d", database.getDatabase(), "-v", "ON_ERROR_STOP=1", "-f", "/tmp/setup.sql"]);
  expect(result.exitCode, result.stderr).toBe(0);
}, 120_000);

afterAll(async () => { if (database) await database.stop(); }, 60_000);

describe("Modelagem e isolamento em Postgres local", () => {
  it("spec003_test_ca_04_ca_07_image_url_opcional_preserva_linhas_e_isolamento", async () => {
    const result = await query(`BEGIN;
      SELECT 'existing_null:'||count(*) FROM equipment WHERE image_url IS NULL;
      UPDATE equipment SET image_url='https://example.invalid/equipamentos/ti-0001.jpg' WHERE id='${equipment(1)}';
      UPDATE equipment SET image_url='https://example.invalid/equipamentos/outro-tenant.jpg' WHERE id='${equipment(7)}';
      SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${member}',true);
      SELECT 'own_image:'||image_url FROM equipment WHERE id='${equipment(1)}';
      SELECT 'foreign_image:'||count(*) FROM equipment WHERE id='${equipment(7)}';
      ROLLBACK;`);
    expect(result.exitCode, result.stderr).toBe(0);
    expect(result.stdout).toContain("existing_null:7");
    expect(result.stdout).toContain("own_image:https://example.invalid/equipamentos/ti-0001.jpg");
    expect(result.stdout).toContain("foreign_image:0");
  });
  it("test_ca_02_todas_as_tabelas_de_dominio_tem_rls_e_policy", async () => {
    const result = await query(`SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity AND EXISTS(SELECT 1 FROM pg_policy p WHERE p.polrelid=c.oid);`);
    expect(result.stdout.trim()).toBe("8");
  });

  it("test_ca_02_membro_nao_ve_outro_tenant_nem_emprestimo_de_colega", async () => {
    const result = await query(`BEGIN; ${loan(1)} ${loan(2, admin)} ${loan(7, outsider, b)}
      SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${member}',true);
      SELECT 'visible:'||(SELECT count(*) FROM tenants)||','||(SELECT count(*) FROM profiles)||','||(SELECT count(*) FROM memberships)||','||(SELECT count(*) FROM categories)||','||(SELECT count(*) FROM equipment)||','||(SELECT count(*) FROM loans)||','||(SELECT count(*) FROM audit_events); ROLLBACK;`);
    expect(result.exitCode, result.stderr).toBe(0);
    expect(result.stdout).toContain("visible:1,1,1,1,6,1,0");
  });

  it("test_ca_02_admin_ve_operacao_do_proprio_tenant_sem_vazar_o_outro", async () => {
    const result = await query(`BEGIN; ${loan(1)} ${loan(2, admin)} ${loan(7, outsider, b)}
      SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${admin}',true);
      SELECT 'admin:'||(SELECT count(*) FROM profiles)||','||(SELECT count(*) FROM loans)||','||(SELECT count(*) FROM audit_events); ROLLBACK;`);
    expect(result.exitCode, result.stderr).toBe(0);
    expect(result.stdout).toContain("admin:2,2,2");
  });

  it("test_ca_02_anonimo_nao_le_catalogo_e_membro_nao_se_promove", async () => {
    const anon = await query("BEGIN; SET LOCAL ROLE anon; SELECT * FROM equipment; ROLLBACK;");
    expect(anon.exitCode).not.toBe(0);
    const promote = await query(`BEGIN; SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${member}',true); UPDATE memberships SET role='admin' WHERE user_id='${member}'; ROLLBACK;`);
    expect(promote.exitCode).not.toBe(0);
  });

  it("test_ca_02_fk_impede_equipamento_de_categoria_de_outro_tenant", async () => {
    const result = await query(`BEGIN; UPDATE equipment SET category_id='30000000-0000-0000-0000-000000000002' WHERE id='${equipment(1)}'; ROLLBACK;`);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("foreign key constraint");
  });

  it("test_ca_02_limite_tres_e_unicidade_de_item_aberto", async () => {
    const limit = await query(`BEGIN; ${loan(1)} ${loan(2)} ${loan(3)} ${loan(4)} ROLLBACK;`);
    expect(limit.stderr).toContain("three open loans");
    const duplicate = await query(`BEGIN; ${loan(1)} ${loan(1, admin)} ROLLBACK;`);
    expect(duplicate.stderr).toContain("loans_one_open_per_equipment");
  });

  it("test_ca_02_atraso_e_manutencao_bloqueiam_novo_emprestimo", async () => {
    const overdue = await query(`BEGIN; INSERT INTO loans(tenant_id,equipment_id,borrower_id,borrowed_at,due_at) VALUES ('${a}','${equipment(1)}','${member}',now()-interval '20 days',now()-interval '1 day'); ${loan(2)} ROLLBACK;`);
    expect(overdue.stderr).toContain("Overdue loan");
    const maintenance = await query(`BEGIN; UPDATE equipment SET state='maintenance' WHERE id='${equipment(1)}'; ${loan(1)} ROLLBACK;`);
    expect(maintenance.stderr).toContain("not available");
  });

  it("test_ca_02_devolucao_libera_item_e_auditoria_e_append_only", async () => {
    const result = await query(`BEGIN; ${loan(1)} UPDATE loans SET returned_at=now(),returned_by='${admin}' WHERE equipment_id='${equipment(1)}'; ${loan(1)} SELECT 'audit:'||count(*) FROM audit_events; ROLLBACK;`);
    expect(result.exitCode, result.stderr).toBe(0);
    expect(result.stdout).toContain("audit:3");
    const mutate = await query(`BEGIN; ${loan(1)} DELETE FROM audit_events; ROLLBACK;`);
    expect(mutate.stderr).toContain("append-only");
  });

  it("test_ca_02_prazo_padrao_e_devolucao_incompleta_rejeitada", async () => {
    const result = await query(`BEGIN; ${loan(1)} SELECT due_at-borrowed_at=interval '14 days' FROM loans; ROLLBACK;`);
    expect(result.stdout).toContain("t\n");
    const invalid = await query(`BEGIN; ${loan(1)} UPDATE loans SET returned_by='${admin}' WHERE equipment_id='${equipment(1)}'; ROLLBACK;`);
    expect(invalid.exitCode).not.toBe(0);
  });
});
