INSERT INTO public.tenants (slug, name)
VALUES ('suporte_ti', 'Suporte de TI') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (tenant_id, name)
SELECT tenant.id, category.name
FROM public.tenants tenant
CROSS JOIN (VALUES ('Notebooks'), ('Monitores'), ('Câmeras'), ('Cabos'), ('Projetores')) category(name)
WHERE tenant.slug = 'suporte_ti'
ON CONFLICT (tenant_id, name) DO NOTHING;
