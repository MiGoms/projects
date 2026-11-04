-- =============================================================================
-- ITC APP — Fase 1: cadastro, aulas, calendário e check-in
-- Regras: Regras/REGRAS.md
--
-- Erros das funções usam SQLSTATE "PTxxx": o PostgREST devolve o HTTP xxx.
--   PT401 não autenticado · PT403 sem permissão · PT404 não encontrado
--   PT409 lotada / check-in duplicado · PT422 fora da janela de horário
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('aluno', 'admin');
create type public.checkin_status as enum ('confirmed', 'cancelled');

-- ---------------------------------------------------------------------------
-- Perfis (1:1 com auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null check (length(btrim(full_name)) > 0),
  email       text not null,
  whatsapp    text not null check (whatsapp ~ '^\(\d{2}\) 9 \d{4}-\d{4}$'),
  photo_url   text,
  role        public.user_role not null default 'aluno',
  created_at  timestamptz not null default now()
);

-- Cria o perfil a partir dos metadados enviados no signUp ({ full_name, whatsapp }).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, whatsapp)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'whatsapp', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantém profiles.email igual ao e-mail de login (troca feita via supabase.auth.updateUser).
create function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Catálogo: modalidades, professores, aulas
-- ---------------------------------------------------------------------------
create table public.modalities (
  id    smallint generated always as identity primary key,
  name  text not null unique
);

create table public.coaches (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(btrim(name)) > 0),
  photo_url  text,
  created_at timestamptz not null default now()
);

create table public.classes (
  id           uuid primary key default gen_random_uuid(),
  modality_id  smallint not null references public.modalities (id),
  coach_id     uuid not null references public.coaches (id),
  level        text not null,
  location     text not null,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  capacity     integer not null check (capacity > 0),
  created_at   timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index classes_starts_at_idx on public.classes (starts_at);

-- ---------------------------------------------------------------------------
-- Check-ins
-- ---------------------------------------------------------------------------
create table public.checkins (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  class_id      uuid not null references public.classes (id) on delete cascade,
  status        public.checkin_status not null default 'confirmed',
  created_at    timestamptz not null default now(),
  cancelled_at  timestamptz
);

-- Um check-in ativo por aluno por aula (cancelados não contam, então dá para refazer).
create unique index checkins_one_active_per_user_class
  on public.checkins (user_id, class_id)
  where status = 'confirmed';

create index checkins_class_confirmed_idx
  on public.checkins (class_id)
  where status = 'confirmed';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.modalities enable row level security;
alter table public.coaches    enable row level security;
alter table public.classes    enable row level security;
alter table public.checkins   enable row level security;

-- profiles: cada um vê e edita o próprio; admin vê todos.
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- O aluno só pode alterar estes campos (role e email ficam de fora).
revoke update on public.profiles from authenticated, anon;
grant update (full_name, whatsapp, photo_url) on public.profiles to authenticated;

-- catálogo: leitura para logados, escrita só admin.
create policy modalities_select on public.modalities
  for select to authenticated using (true);
create policy modalities_admin_write on public.modalities
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy coaches_select on public.coaches
  for select to authenticated using (true);
create policy coaches_admin_write on public.coaches
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy classes_select on public.classes
  for select to authenticated using (true);
create policy classes_admin_write on public.classes
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- checkins: leitura do próprio (ou admin). Escrita SÓ pelas funções abaixo.
create policy checkins_select on public.checkins
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

revoke insert, update, delete on public.checkins from authenticated, anon;

-- ---------------------------------------------------------------------------
-- Calendário: aulas de um dia (fuso de Itacaré) com vagas e status do aluno
-- ---------------------------------------------------------------------------
create function public.classes_for_day(p_date date)
returns table (
  id          uuid,
  modality    text,
  coach_name  text,
  coach_photo text,
  level       text,
  location    text,
  starts_at   timestamptz,
  ends_at     timestamptz,
  capacity    integer,
  taken       integer,
  checked_in  boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    m.name,
    co.name,
    co.photo_url,
    c.level,
    c.location,
    c.starts_at,
    c.ends_at,
    c.capacity,
    (select count(*)::int from public.checkins k
      where k.class_id = c.id and k.status = 'confirmed'),
    exists (select 1 from public.checkins k
      where k.class_id = c.id and k.status = 'confirmed'
        and k.user_id = (select auth.uid()))
  from public.classes c
  join public.modalities m on m.id = c.modality_id
  join public.coaches co   on co.id = c.coach_id
  where (select auth.uid()) is not null
    and c.starts_at >= (p_date::timestamp at time zone 'America/Bahia')
    and c.starts_at <  ((p_date + 1)::timestamp at time zone 'America/Bahia')
  order by c.starts_at;
$$;

-- ---------------------------------------------------------------------------
-- Check-in
--   Janela: abre 24h antes do início, fecha 20 min antes do início.
--   Trava a linha da aula (FOR UPDATE) ANTES de contar as vagas: check-ins
--   simultâneos na mesma aula ficam em fila e só um pega a última vaga.
-- ---------------------------------------------------------------------------
create function public.check_in(p_class_id uuid)
returns public.checkins
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_class  public.classes;
  v_taken  integer;
  v_row    public.checkins;
begin
  if v_uid is null then
    raise exception 'nao_autenticado' using errcode = 'PT401';
  end if;

  select * into v_class
  from public.classes
  where id = p_class_id
  for update;

  if not found then
    raise exception 'aula_nao_encontrada' using errcode = 'PT404';
  end if;

  if now() < v_class.starts_at - interval '24 hours' then
    raise exception 'checkin_ainda_nao_abriu' using errcode = 'PT422';
  end if;

  if now() > v_class.starts_at - interval '20 minutes' then
    raise exception 'checkin_encerrado' using errcode = 'PT422';
  end if;

  if exists (
    select 1 from public.checkins
    where class_id = p_class_id and user_id = v_uid and status = 'confirmed'
  ) then
    raise exception 'checkin_duplicado' using errcode = 'PT409';
  end if;

  select count(*) into v_taken
  from public.checkins
  where class_id = p_class_id and status = 'confirmed';

  if v_taken >= v_class.capacity then
    raise exception 'lotada' using errcode = 'PT409';
  end if;

  insert into public.checkins (user_id, class_id)
  values (v_uid, p_class_id)
  returning * into v_row;

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Cancelamento: permitido até o início da aula; libera a vaga na hora.
-- ---------------------------------------------------------------------------
create function public.cancel_checkin(p_class_id uuid)
returns public.checkins
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_class  public.classes;
  v_row    public.checkins;
begin
  if v_uid is null then
    raise exception 'nao_autenticado' using errcode = 'PT401';
  end if;

  select * into v_class
  from public.classes
  where id = p_class_id
  for update;

  if not found then
    raise exception 'aula_nao_encontrada' using errcode = 'PT404';
  end if;

  if now() >= v_class.starts_at then
    raise exception 'cancelamento_encerrado' using errcode = 'PT422';
  end if;

  update public.checkins
  set status = 'cancelled', cancelled_at = now()
  where class_id = p_class_id and user_id = v_uid and status = 'confirmed'
  returning * into v_row;

  if not found then
    raise exception 'checkin_nao_encontrado' using errcode = 'PT404';
  end if;

  return v_row;
end;
$$;

-- Funções expostas só para usuários logados.
revoke execute on function public.classes_for_day(date) from public, anon;
revoke execute on function public.check_in(uuid)        from public, anon;
revoke execute on function public.cancel_checkin(uuid)  from public, anon;
revoke execute on function public.is_admin()            from public, anon;
grant  execute on function public.classes_for_day(date) to authenticated;
grant  execute on function public.check_in(uuid)        to authenticated;
grant  execute on function public.cancel_checkin(uuid)  to authenticated;
grant  execute on function public.is_admin()            to authenticated;

-- Triggers não devem ser chamáveis via API.
revoke execute on function public.handle_new_user()         from public, anon, authenticated;
revoke execute on function public.handle_user_email_change() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: fotos de perfil em avatars/<user_id>/...
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy avatars_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy avatars_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy avatars_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
