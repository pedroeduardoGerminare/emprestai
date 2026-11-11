import { expect, it } from "vitest";
// @ts-expect-error Human-run ESM helper deliberately remains executable by Node directly.
import { validateProductionTarget } from "../scripts/provision-validation.mjs";

it("spec003_test_ca_02_ca_05_rejeita_banco_de_outro_projeto_antes_de_mutacoes", () => {
  const ref = "approvedproject";
  for (const url of ["postgresql://postgres:fixture@db.other.supabase.co:5432/postgres", "postgresql://postgres.other:fixture@aws-0-sa-east-1.pooler.supabase.com:6543/postgres", "postgresql://postgres:fixture@localhost:5432/postgres"]) expect(() => validateProductionTarget(url, ref)).toThrow();
  expect(() => validateProductionTarget(`postgresql://postgres:fixture@db.${ref}.supabase.co:5432/postgres`, ref)).not.toThrow();
  expect(() => validateProductionTarget(`postgresql://postgres.${ref}:fixture@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`, ref)).not.toThrow();
});
