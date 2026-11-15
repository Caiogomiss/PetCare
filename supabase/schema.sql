-- =========================================================
-- PetCare: banco de dados no Supabase
-- Cole tudo no SQL Editor do Supabase e clique em "Run".
-- Pode rodar de novo sem problema: ele não apaga dados.
-- Os dados de exemplo (serviços e orientações) ficam em seed.sql.
-- =========================================================

-- ---------- Perfil do tutor (complementa auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 80),
  telefone text,
  cpf text,
  endereco text,
  created_at timestamptz not null default now()
);

-- Cria o perfil automaticamente quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, telefone)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1)),
    nullif(trim(new.raw_user_meta_data ->> 'telefone'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Pets ----------
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 60),
  especie text not null check (especie in ('cao', 'gato', 'outro')),
  raca text,
  sexo text check (sexo in ('macho', 'femea')),
  data_nascimento date,
  peso numeric(5, 2) check (peso is null or (peso > 0 and peso < 200)),
  castrado boolean not null default false,
  foto_url text,
  created_at timestamptz not null default now()
);
create index if not exists pets_tutor_idx on public.pets (tutor_id);

-- ---------- Carteira de saúde ----------
-- Um registro por vacina, consulta, medicamento, exame ou castração.
-- Os campos específicos de cada tipo (lote, crmv, dosagem...) ficam em "detalhes".
create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('vacina', 'consulta', 'medicamento', 'exame', 'castracao')),
  titulo text not null check (char_length(titulo) between 1 and 80),
  data date not null,
  proxima_data date,
  detalhes jsonb not null default '{}'::jsonb,
  observacoes text,
  created_at timestamptz not null default now()
);
create index if not exists health_records_pet_idx on public.health_records (pet_id, data desc);

-- ---------- Lembretes ----------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 80),
  data date not null,
  hora text not null default '09:00' check (hora ~ '^[0-2][0-9]:[0-5][0-9]$'),
  feito boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reminders_pet_idx on public.reminders (pet_id, data);

-- ---------- Alertas comunitários ----------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  autor_nome text,
  tipo text not null check (tipo in ('perdido', 'abandonado', 'risco')),
  titulo text not null check (char_length(titulo) between 3 and 80),
  descricao text not null check (char_length(descricao) between 10 and 600),
  local text not null check (char_length(local) between 3 and 120),
  contato text,
  foto_url text,
  resolvido boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists alerts_created_idx on public.alerts (created_at desc);

-- ---------- Serviços e campanhas ----------
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (categoria in ('clinica', 'vacinacao', 'castracao', 'adocao', 'ong')),
  nome text not null,
  descricao text,
  endereco text,
  telefone text,
  latitude double precision not null,
  longitude double precision not null,
  data_inicio date,
  data_fim date,
  gratuito boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Orientações sobre cuidados ----------
create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  ordem int not null default 0,
  tema text not null,
  titulo text not null,
  resumo text,
  conteudo text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Regras de acesso (RLS)
-- A chave anon fica no app, então quem protege os dados são estas regras.
-- =========================================================
alter table public.profiles       enable row level security;
alter table public.pets           enable row level security;
alter table public.health_records enable row level security;
alter table public.reminders      enable row level security;
alter table public.alerts         enable row level security;
alter table public.places         enable row level security;
alter table public.guides         enable row level security;

-- Perfil: cada um lê e edita só o seu
drop policy if exists "perfil proprio leitura" on public.profiles;
create policy "perfil proprio leitura" on public.profiles for select using (id = auth.uid());
drop policy if exists "perfil proprio edicao" on public.profiles;
create policy "perfil proprio edicao" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "perfil proprio insercao" on public.profiles;
create policy "perfil proprio insercao" on public.profiles for insert with check (id = auth.uid());

-- Pets, registros e lembretes: só o tutor dono (RN14)
drop policy if exists "pets do tutor" on public.pets;
create policy "pets do tutor" on public.pets for all
  using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());

drop policy if exists "registros do tutor" on public.health_records;
create policy "registros do tutor" on public.health_records for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid() and exists (select 1 from public.pets p where p.id = pet_id and p.tutor_id = auth.uid()));

drop policy if exists "lembretes do tutor" on public.reminders;
create policy "lembretes do tutor" on public.reminders for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid() and exists (select 1 from public.pets p where p.id = pet_id and p.tutor_id = auth.uid()));

-- Alertas: qualquer usuário logado vê; só o autor publica, edita e apaga (RN27, RN28)
drop policy if exists "alertas leitura" on public.alerts;
create policy "alertas leitura" on public.alerts for select to authenticated using (true);
drop policy if exists "alertas publicar" on public.alerts;
create policy "alertas publicar" on public.alerts for insert to authenticated with check (autor_id = auth.uid());
drop policy if exists "alertas editar" on public.alerts;
create policy "alertas editar" on public.alerts for update to authenticated using (autor_id = auth.uid()) with check (autor_id = auth.uid());
drop policy if exists "alertas apagar" on public.alerts;
create policy "alertas apagar" on public.alerts for delete to authenticated using (autor_id = auth.uid());

-- Serviços e orientações: leitura liberada; cadastro feito pelo painel do Supabase
drop policy if exists "places leitura" on public.places;
create policy "places leitura" on public.places for select using (true);
drop policy if exists "guides leitura" on public.guides;
create policy "guides leitura" on public.guides for select using (true);

-- =========================================================
-- Fotos (pets e alertas) no Storage
-- =========================================================
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

-- Cada usuário envia fotos só para a própria pasta: fotos/<id do usuário>/arquivo.jpg
drop policy if exists "fotos envio" on storage.objects;
create policy "fotos envio" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "fotos apagar" on storage.objects;
create policy "fotos apagar" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
