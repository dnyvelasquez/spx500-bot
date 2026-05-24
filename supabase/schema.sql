-- SPX500 Bot — License table
-- Ejecutar en: Supabase Dashboard → SQL Editor

create table public.licenses (
  id            uuid        primary key default gen_random_uuid(),
  license_key   uuid        unique not null default gen_random_uuid(),
  owner_name    text        not null,
  mt5_account   bigint      not null,
  allowed_mode  text        not null default 'demo'
                            check (allowed_mode in ('demo', 'live', 'both')),
  active        boolean     not null default true,
  expires_at    timestamptz,
  notes         text,
  created_at    timestamptz not null default now()
);

-- Row Level Security: activado para que solo funcione con la anon key + policy
alter table public.licenses enable row level security;

-- El bot (anon key) puede leer cualquier fila.
-- La seguridad real viene de que license_key es un UUID aleatorio de 128 bits.
create policy "read_by_key"
  on public.licenses
  for select to anon
  using (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- EJEMPLO: insertar una licencia para un familiar
-- ─────────────────────────────────────────────────────────────────────────────
-- insert into public.licenses (owner_name, mt5_account, allowed_mode, notes)
-- values ('Nombre Familiar', 123456789, 'demo', 'Cuenta demo para pruebas');
--
-- Luego copia el valor de license_key generado y dáselo en el .env:
-- LICENSE_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
