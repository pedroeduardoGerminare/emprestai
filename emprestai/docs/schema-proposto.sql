-- DDL aprovado em 23/out/2026. Modelo aplicado no novo Supabase.
-- Fonte executável definitiva: prisma/migrations/20261023122556_initial_schema/migration.sql.
-- Banco novo e vazio; nenhuma linha existente será alterada ou excluída.
CREATE TYPE "MembershipRole" AS ENUM ('collaborator', 'admin');
CREATE TYPE "EquipmentState" AS ENUM ('available', 'maintenance', 'retired');

CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE,
  name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  display_name text NOT NULL, department text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE memberships (
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE RESTRICT,
  role "MembershipRole" NOT NULL DEFAULT 'collaborator', PRIMARY KEY (tenant_id, user_id)
);
CREATE INDEX memberships_user_id_tenant_id_idx ON memberships(user_id, tenant_id);
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT, name text NOT NULL,
  UNIQUE (tenant_id, id), UNIQUE (tenant_id, name)
);
CREATE TABLE equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL, asset_tag text NOT NULL, name text NOT NULL, serial_number text,
  pickup_location text NOT NULL, description text, notes text,
  state "EquipmentState" NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id), UNIQUE (tenant_id, asset_tag),
  FOREIGN KEY (tenant_id, category_id) REFERENCES categories(tenant_id, id) ON DELETE RESTRICT
);
CREATE INDEX equipment_tenant_id_category_id_idx ON equipment(tenant_id, category_id);
CREATE INDEX equipment_tenant_id_state_idx ON equipment(tenant_id, state);
CREATE TABLE loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  equipment_id uuid NOT NULL, borrower_id uuid NOT NULL, borrowed_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP + interval '14 days'),
  returned_at timestamptz, returned_by uuid,
  FOREIGN KEY (tenant_id, equipment_id) REFERENCES equipment(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, borrower_id) REFERENCES memberships(tenant_id, user_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, returned_by) REFERENCES memberships(tenant_id, user_id) ON DELETE RESTRICT,
  CONSTRAINT loans_due_after_borrowed CHECK (due_at > borrowed_at),
  CONSTRAINT loans_valid_return CHECK ((returned_at IS NULL AND returned_by IS NULL) OR (returned_at IS NOT NULL AND returned_at >= borrowed_at AND returned_by IS NOT NULL))
);
CREATE UNIQUE INDEX loans_one_open_per_equipment ON loans(tenant_id, equipment_id) WHERE returned_at IS NULL;
CREATE INDEX loans_tenant_id_borrower_id_returned_at_idx ON loans(tenant_id, borrower_id, returned_at);
CREATE INDEX loans_tenant_id_returned_by_idx ON loans(tenant_id, returned_by);
CREATE INDEX loans_tenant_id_returned_at_due_at_idx ON loans(tenant_id, returned_at, due_at);
CREATE INDEX loans_tenant_id_equipment_id_idx ON loans(tenant_id, equipment_id);
CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  actor_id uuid, action text NOT NULL, resource_type text NOT NULL, resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, actor_id) REFERENCES memberships(tenant_id, user_id) ON DELETE RESTRICT
);
CREATE INDEX audit_events_tenant_id_created_at_idx ON audit_events(tenant_id, created_at);
CREATE INDEX audit_events_tenant_id_actor_id_idx ON audit_events(tenant_id, actor_id);
CREATE TABLE rate_limit_buckets (
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT, subject_hash text NOT NULL,
  window_start timestamptz NOT NULL, request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  PRIMARY KEY (tenant_id, subject_hash, window_start)
);
CREATE INDEX rate_limit_buckets_window_start_idx ON rate_limit_buckets(window_start);

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE FUNCTION private.is_member(target_tenant uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.memberships m WHERE m.tenant_id = target_tenant AND m.user_id = (SELECT auth.uid()))
$$;
CREATE FUNCTION private.is_admin(target_tenant uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.memberships m WHERE m.tenant_id = target_tenant AND m.user_id = (SELECT auth.uid()) AND m.role = 'admin')
$$;
REVOKE ALL ON FUNCTION private.is_member(uuid), private.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_member(uuid), private.is_admin(uuid) TO authenticated;

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_buckets ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenants_member_read ON tenants FOR SELECT TO authenticated USING (private.is_member(id));
CREATE POLICY profiles_self_read ON profiles FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY profiles_admin_read ON profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.memberships m WHERE m.user_id = profiles.user_id AND private.is_admin(m.tenant_id))
);
CREATE POLICY memberships_member_read ON memberships FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR private.is_admin(tenant_id));
CREATE POLICY categories_member_read ON categories FOR SELECT TO authenticated USING (private.is_member(tenant_id));
CREATE POLICY equipment_member_read ON equipment FOR SELECT TO authenticated USING (private.is_member(tenant_id));
CREATE POLICY loans_owner_admin_read ON loans FOR SELECT TO authenticated
  USING (private.is_member(tenant_id) AND (borrower_id = (SELECT auth.uid()) OR private.is_admin(tenant_id)));
CREATE POLICY audit_admin_read ON audit_events FOR SELECT TO authenticated USING (private.is_admin(tenant_id));
CREATE POLICY rate_limits_client_deny ON rate_limit_buckets FOR ALL TO authenticated USING (false) WITH CHECK (false);

REVOKE ALL ON TABLE tenants, profiles, memberships, categories, equipment, loans, audit_events, rate_limit_buckets FROM anon, authenticated;
GRANT SELECT ON TABLE tenants, profiles, memberships, categories, equipment, loans, audit_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE tenants, profiles, memberships, categories, equipment, loans, rate_limit_buckets TO service_role;
GRANT SELECT, INSERT ON TABLE audit_events TO service_role;
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE audit_events FROM service_role;

CREATE FUNCTION private.guard_loan() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE equipment_state public."EquipmentState";
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF (NEW.id, NEW.tenant_id, NEW.equipment_id, NEW.borrower_id, NEW.borrowed_at, NEW.due_at)
       IS DISTINCT FROM (OLD.id, OLD.tenant_id, OLD.equipment_id, OLD.borrower_id, OLD.borrowed_at, OLD.due_at)
       OR OLD.returned_at IS NOT NULL OR NEW.returned_at IS NULL THEN
      RAISE EXCEPTION 'Only the first return may update a loan' USING ERRCODE = '23514';
    END IF;
    PERFORM 1 FROM public.memberships WHERE tenant_id = NEW.tenant_id AND user_id = NEW.borrower_id FOR UPDATE;
    RETURN NEW;
  END IF;
  IF NEW.returned_at IS NOT NULL OR NEW.returned_by IS NOT NULL THEN
    RAISE EXCEPTION 'A new loan must be open' USING ERRCODE = '23514';
  END IF;
  PERFORM 1 FROM public.memberships WHERE tenant_id = NEW.tenant_id AND user_id = NEW.borrower_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Borrower must belong to tenant' USING ERRCODE = '23503'; END IF;
  IF EXISTS (SELECT 1 FROM public.loans WHERE tenant_id = NEW.tenant_id AND borrower_id = NEW.borrower_id AND returned_at IS NULL AND due_at < CURRENT_TIMESTAMP) THEN
    RAISE EXCEPTION 'Overdue loan blocks new borrowing' USING ERRCODE = '23514';
  END IF;
  IF (SELECT count(*) FROM public.loans WHERE tenant_id = NEW.tenant_id AND borrower_id = NEW.borrower_id AND returned_at IS NULL) >= 3 THEN
    RAISE EXCEPTION 'Borrower limit is three open loans' USING ERRCODE = '23514';
  END IF;
  SELECT state INTO equipment_state FROM public.equipment WHERE tenant_id = NEW.tenant_id AND id = NEW.equipment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Equipment must belong to tenant' USING ERRCODE = '23503'; END IF;
  IF equipment_state <> 'available' THEN RAISE EXCEPTION 'Equipment is not available' USING ERRCODE = '23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER loans_guard BEFORE INSERT OR UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION private.guard_loan();

CREATE FUNCTION private.guard_equipment() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF (NEW.id, NEW.tenant_id) IS DISTINCT FROM (OLD.id, OLD.tenant_id) THEN
    RAISE EXCEPTION 'Equipment identity cannot change' USING ERRCODE = '23514';
  END IF;
  IF NEW.state <> 'available' AND EXISTS (SELECT 1 FROM public.loans WHERE tenant_id = OLD.tenant_id AND equipment_id = OLD.id AND returned_at IS NULL) THEN
    RAISE EXCEPTION 'Return equipment before changing its state' USING ERRCODE = '23514';
  END IF;
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END $$;
CREATE TRIGGER equipment_guard BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION private.guard_equipment();

CREATE FUNCTION private.append_loan_audit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.audit_events (tenant_id, actor_id, action, resource_type, resource_id)
  VALUES (NEW.tenant_id, CASE WHEN TG_OP = 'INSERT' THEN NEW.borrower_id ELSE NEW.returned_by END,
    CASE WHEN TG_OP = 'INSERT' THEN 'loan.created' ELSE 'loan.returned' END, 'loan', NEW.id);
  RETURN NEW;
END $$;
CREATE TRIGGER loans_audit AFTER INSERT OR UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION private.append_loan_audit();

CREATE FUNCTION private.reject_audit_mutation() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN RAISE EXCEPTION 'Audit events are append-only' USING ERRCODE = '23514'; END $$;
CREATE TRIGGER audit_append_only BEFORE UPDATE OR DELETE OR TRUNCATE ON audit_events FOR EACH STATEMENT EXECUTE FUNCTION private.reject_audit_mutation();
REVOKE ALL ON FUNCTION private.guard_loan(), private.guard_equipment(), private.append_loan_audit(), private.reject_audit_mutation() FROM PUBLIC;
