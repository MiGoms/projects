-- Seed de desenvolvimento (roda em `supabase db reset`; NÃO roda em produção).
-- As modalidades vêm da migration 20261104000001_modalidades_iniciais.sql.

-- Professores de exemplo (placeholders)
insert into public.coaches (id, name) values
  ('00000000-0000-0000-0000-0000000000c1', 'Marina Costa'),
  ('00000000-0000-0000-0000-0000000000c2', 'Rafael Lima'),
  ('00000000-0000-0000-0000-0000000000c3', 'Ana Souza');

-- Aulas de exemplo para hoje + 6 dias (horários de Itacaré)
insert into public.classes (modality_id, coach_id, level, location, starts_at, ends_at, capacity)
select m.id, s.coach_id::uuid, s.level, s.location,
       ((current_date + d)::timestamp + s.start_t) at time zone 'America/Bahia',
       ((current_date + d)::timestamp + s.end_t)   at time zone 'America/Bahia',
       s.capacity
from generate_series(0, 6) as d
cross join (values
  ('Surf',      '00000000-0000-0000-0000-0000000000c1', 'Iniciante',     'Praia da Tiririca', time '06:00', time '07:30', 8),
  ('Yoga',      '00000000-0000-0000-0000-0000000000c3', 'Todos',         'Deck ITC',          time '07:30', time '08:30', 12),
  ('Crossfit',  '00000000-0000-0000-0000-0000000000c2', 'Intermediário', 'Box ITC',           time '17:00', time '18:00', 10),
  ('Jiu-jitsu', '00000000-0000-0000-0000-0000000000c2', 'Todos',         'Tatame ITC',        time '19:00', time '20:30', 1)
) as s(modality, coach_id, level, location, start_t, end_t, capacity)
join public.modalities m on m.name = s.modality;

-- Para tornar um usuário administrador (depois de criar a conta no app):
--   update public.profiles set role = 'admin' where email = 'admin@itc.com.br';
