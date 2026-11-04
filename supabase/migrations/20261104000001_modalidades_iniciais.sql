-- Modalidades iniciais (REGRAS.md §2)
insert into public.modalities (name) values
  ('Surf'), ('Trilha'), ('Jiu-jitsu'), ('Crossfit'), ('Musculação'), ('Yoga'), ('Altinha')
on conflict (name) do nothing;
