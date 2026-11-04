import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Testa as regras de negócio do SQL num Postgres em memória (PGlite), sem Docker.
// Simula só o mínimo dos esquemas auth/storage do Supabase.
// NÃO cobre concorrência real (PGlite tem uma conexão só).
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const db = new PGlite();
const ok = (m) => console.log('OK   ', m);
const fail = (m) => { console.log('FAIL ', m); process.exitCode = 1; };

// --- stubs do Supabase ---
await db.exec(`
create role anon; create role authenticated;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$
  select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'),1)-1] $$;
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
`);
for (const f of fs.readdirSync(`${root}/supabase/migrations`).sort())
  await db.exec(fs.readFileSync(`${root}/supabase/migrations/${f}`, 'utf8'));
ok('migrations aplicadas');
await db.exec(fs.readFileSync(`${root}/supabase/seed.sql`, 'utf8'));
ok('seed aplicado');

const mods = await db.query('select count(*)::int n from public.modalities');
mods.rows[0].n === 7 ? ok('7 modalidades') : fail('modalidades ' + mods.rows[0].n);

const mk = async (email, wa) => (await db.query(
  `insert into auth.users (email, raw_user_meta_data) values ($1, jsonb_build_object('full_name','Fulano','whatsapp',$2::text)) returning id`, [email, wa])).rows[0].id;
const A = await mk('a@x.com', '(73) 9 1234-5678');
const B = await mk('b@x.com', '(73) 9 8765-4321');
const ADM = await mk('adm@x.com', '(73) 9 1111-2222');
await db.exec(`update public.profiles set role='admin' where id='${ADM}'`);
ok('perfis criados via trigger');
try { await mk('c@x.com', '73912345678'); fail('whatsapp inválido aceito'); } catch { ok('whatsapp inválido rejeitado'); }

const asUser = async (uid, fn) => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false);`);
  try { return await fn(); } finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`); }
};
const expectErr = async (label, code, fn) => {
  try { await fn(); fail(label + ' (sem erro)'); }
  catch (e) { e.code === code ? ok(`${label} -> ${code} ${e.message}`) : fail(`${label}: ${e.code} ${e.message}`); }
};
const cls = async (offset, cap) => (await db.query(
  `insert into public.classes (modality_id, coach_id, level, location, starts_at, ends_at, capacity)
   values (1, '00000000-0000-0000-0000-0000000000c1', 'Todos', 'Praia', now() + $1::interval, now() + $1::interval + interval '1 hour', $2) returning id`, [offset, cap])).rows[0].id;

const C = await cls('2 hours', 1);
await asUser(A, () => db.query('select * from public.check_in($1)', [C])); ok('A fez check-in');
await expectErr('B na última vaga', 'PT409', () => asUser(B, () => db.query('select public.check_in($1)', [C])));
await expectErr('A duplicado', 'PT409', () => asUser(A, () => db.query('select public.check_in($1)', [C])));
await asUser(A, () => db.query('select public.cancel_checkin($1)', [C])); ok('A cancelou');
await asUser(B, () => db.query('select public.check_in($1)', [C])); ok('B pegou a vaga liberada');
await expectErr('A tenta de novo com aula cheia', 'PT409', () => asUser(A, () => db.query('select public.check_in($1)', [C])));

await expectErr('janela não abriu (25h)', 'PT422', async () => { const id = await cls('25 hours', 5); return asUser(A, () => db.query('select public.check_in($1)', [id])); });
const C23 = await cls('23 hours', 5);
await asUser(A, () => db.query('select public.check_in($1)', [C23])); ok('check-in a 23h do início');
await expectErr('janela fechou (10min)', 'PT422', async () => { const id = await cls('10 minutes', 5); return asUser(A, () => db.query('select public.check_in($1)', [id])); });
const C21 = await cls('21 minutes', 5);
await asUser(A, () => db.query('select public.check_in($1)', [C21])); ok('check-in a 21min do início');
await asUser(A, () => db.query('select public.cancel_checkin($1)', [C21])); ok('cancelar a 21min do início');
const started = await cls('-5 minutes', 5);
await db.query('insert into public.checkins (user_id, class_id) values ($1, $2)', [A, started]);
await expectErr('cancelar após início', 'PT422', () => asUser(A, () => db.query('select public.cancel_checkin($1)', [started])));
await expectErr('sem login', 'PT401', () => db.query('select public.check_in($1)', [C]));

const day = await asUser(A, () => db.query(`select * from public.classes_for_day((now() at time zone 'America/Bahia')::date)`));
day.rows.length >= 4 ? ok(`classes_for_day: ${day.rows.length} aulas hoje`) : fail('classes_for_day vazio');
const rowC = day.rows.find(r => r.id === C);
rowC && rowC.taken === 1 && rowC.checked_in === false ? ok('taken/checked_in corretos para A') : fail('taken/checked_in ' + JSON.stringify(rowC));

await expectErr('insert direto em checkins', '42501', () => asUser(A, () => db.query('insert into public.checkins (user_id, class_id) values ($1, $2)', [A, C])));
await expectErr('aluno muda o próprio role', '42501', () => asUser(A, () => db.query(`update public.profiles set role='admin' where id=$1`, [A])));
await asUser(A, () => db.query(`update public.profiles set full_name='Novo Nome' where id=$1`, [A])); ok('aluno edita nome');
const seenByA = await asUser(A, () => db.query('select count(*)::int n from public.checkins'));
const seenByAdm = await asUser(ADM, () => db.query('select count(*)::int n from public.checkins'));
seenByA.rows[0].n < seenByAdm.rows[0].n ? ok(`RLS checkins: aluno vê ${seenByA.rows[0].n}, admin vê ${seenByAdm.rows[0].n}`) : fail('RLS checkins');
await expectErr('aluno cria aula', '42501', () => asUser(A, () => cls('3 hours', 5)));
await asUser(ADM, () => cls('3 hours', 5)); ok('admin cria aula');
const att = await asUser(ADM, () => db.query('select k.status, p.full_name from public.checkins k join public.profiles p on p.id = k.user_id where k.class_id = $1', [C]));
att.rows.length === 2 ? ok('admin vê presença da aula com nomes') : fail('admin presença ' + att.rows.length);
if (!process.exitCode) console.log("\nTodas as regras passaram.");
