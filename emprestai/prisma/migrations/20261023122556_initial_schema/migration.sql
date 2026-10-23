-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('collaborator', 'admin');

-- CreateEnum
CREATE TYPE "EquipmentState" AS ENUM ('available', 'maintenance', 'retired');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "user_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "department" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'collaborator',

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("tenant_id","user_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "asset_tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serial_number" TEXT,
    "pickup_location" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "state" "EquipmentState" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "borrower_id" UUID NOT NULL,
    "borrowed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP + interval '14 days'),
    "returned_at" TIMESTAMPTZ(6),
    "returned_by" UUID,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "tenant_id" UUID NOT NULL,
    "subject_hash" TEXT NOT NULL,
    "window_start" TIMESTAMPTZ(6) NOT NULL,
    "request_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("tenant_id","subject_hash","window_start")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "memberships_user_id_tenant_id_idx" ON "memberships"("user_id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_tenant_id_id_key" ON "categories"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_tenant_id_name_key" ON "categories"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "equipment_tenant_id_category_id_idx" ON "equipment"("tenant_id", "category_id");

-- CreateIndex
CREATE INDEX "equipment_tenant_id_state_idx" ON "equipment"("tenant_id", "state");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_tenant_id_id_key" ON "equipment"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_tenant_id_asset_tag_key" ON "equipment"("tenant_id", "asset_tag");

-- CreateIndex
CREATE INDEX "loans_tenant_id_borrower_id_returned_at_idx" ON "loans"("tenant_id", "borrower_id", "returned_at");

-- CreateIndex
CREATE INDEX "loans_tenant_id_returned_by_idx" ON "loans"("tenant_id", "returned_by");

-- CreateIndex
CREATE INDEX "loans_tenant_id_returned_at_due_at_idx" ON "loans"("tenant_id", "returned_at", "due_at");

-- CreateIndex
CREATE INDEX "loans_tenant_id_equipment_id_idx" ON "loans"("tenant_id", "equipment_id");

-- CreateIndex
CREATE INDEX "audit_events_tenant_id_created_at_idx" ON "audit_events"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_events_tenant_id_actor_id_idx" ON "audit_events"("tenant_id", "actor_id");

-- CreateIndex
CREATE INDEX "rate_limit_buckets_window_start_idx" ON "rate_limit_buckets"("window_start");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_tenant_id_category_id_fkey" FOREIGN KEY ("tenant_id", "category_id") REFERENCES "categories"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_tenant_id_equipment_id_fkey" FOREIGN KEY ("tenant_id", "equipment_id") REFERENCES "equipment"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_tenant_id_borrower_id_fkey" FOREIGN KEY ("tenant_id", "borrower_id") REFERENCES "memberships"("tenant_id", "user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_tenant_id_returned_by_fkey" FOREIGN KEY ("tenant_id", "returned_by") REFERENCES "memberships"("tenant_id", "user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_tenant_id_actor_id_fkey" FOREIGN KEY ("tenant_id", "actor_id") REFERENCES "memberships"("tenant_id", "user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_limit_buckets" ADD CONSTRAINT "rate_limit_buckets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Supabase-owned Auth reference and integrity constraints, reviewed in docs/schema-proposto.sql.
ALTER TABLE profiles ADD CONSTRAINT profiles_auth_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;
ALTER TABLE loans ADD CONSTRAINT loans_due_after_borrowed CHECK (due_at > borrowed_at);
ALTER TABLE loans ADD CONSTRAINT loans_valid_return CHECK ((returned_at IS NULL AND returned_by IS NULL) OR (returned_at IS NOT NULL AND returned_at >= borrowed_at AND returned_by IS NOT NULL));
ALTER TABLE rate_limit_buckets ADD CONSTRAINT rate_limit_nonnegative CHECK (request_count >= 0);
CREATE UNIQUE INDEX loans_one_open_per_equipment ON loans(tenant_id, equipment_id) WHERE returned_at IS NULL;
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_member(target_tenant uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.memberships m WHERE m.tenant_id = target_tenant AND m.user_id = (SELECT auth.uid()))
$$;
CREATE OR REPLACE FUNCTION private.is_admin(target_tenant uuid) RETURNS boolean
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

CREATE OR REPLACE FUNCTION private.guard_loan() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
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

CREATE OR REPLACE FUNCTION private.guard_equipment() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
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

CREATE OR REPLACE FUNCTION private.append_loan_audit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.audit_events (tenant_id, actor_id, action, resource_type, resource_id)
  VALUES (NEW.tenant_id, CASE WHEN TG_OP = 'INSERT' THEN NEW.borrower_id ELSE NEW.returned_by END,
    CASE WHEN TG_OP = 'INSERT' THEN 'loan.created' ELSE 'loan.returned' END, 'loan', NEW.id);
  RETURN NEW;
END $$;
CREATE TRIGGER loans_audit AFTER INSERT OR UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION private.append_loan_audit();

CREATE OR REPLACE FUNCTION private.reject_audit_mutation() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN RAISE EXCEPTION 'Audit events are append-only' USING ERRCODE = '23514'; END $$;
CREATE TRIGGER audit_append_only BEFORE UPDATE OR DELETE OR TRUNCATE ON audit_events FOR EACH STATEMENT EXECUTE FUNCTION private.reject_audit_mutation();
REVOKE ALL ON FUNCTION private.guard_loan(), private.guard_equipment(), private.append_loan_audit(), private.reject_audit_mutation() FROM PUBLIC;
