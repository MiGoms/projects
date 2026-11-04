# Handoff: ITC – Itacaré Training Center (app de check-in de aulas)

## Overview
Mobile app for ITC students in Itacaré (BA) to log in, browse the day's classes (surf, trilha, jiu-jitsu, crossfit, musculação, yoga, altinha) and check in. It is purely a check-in tool: no personal agenda, no modality filter, no gamification yet.

Four screens: 1 Login/Cadastro → 2 Boas-vindas → 3 Aulas do dia ⇄ 4 Perfil.

## About the Design Files
The files in this bundle are **design references created in HTML** – a prototype showing intended look and behavior, not production code to copy. Recreate them in the target stack. If no codebase exists yet, a reasonable choice is **React Native (Expo)** or a **Next.js PWA** for the client, plus a backend with auth, a relational DB (e.g. Postgres via Supabase/Prisma) and the endpoints listed below.

Open `ITC App v2.dc.html` in a browser (keep `support.js`, `image-slot.js`, `itc-logo.png` beside it). A pill switcher above the phone frame jumps between screens; it is a prototype aid, not part of the app.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii and copy are final. Class data, coach names and profile values are placeholders.

## Screens

Phone frame reference: 390 × 844 pt. Background on all screens: `linear-gradient(160deg, #556b6d 0%, #4a5f61 100%)`.

### 1 · Login / Cadastro
- **Purpose:** sign in or create an account.
- **Layout:** vertical flex, padding 72/28/40, gap 36.
- Logo `itc-logo.png` 96×96, centered; below it "ITACARÉ TRAINING CENTER" (Inter 500, 11px, letter-spacing 2px, uppercase, #c9a876).
- **Segmented toggle** (2-col grid, bg rgba(0,0,0,.15), padding 4, radius 14): "Entrar" / "Criar conta". Active segment bg #c9a876, text #3d4f51; inactive transparent, text #e8dcc8. Inter 600 13px, radius 11, padding 11.
- **Fields** (gap 16). Label: Inter 500 11px uppercase, letter-spacing .8px, #d4c5b0, 6px above input. Input: padding 13/14, bg rgba(255,255,255,.08), border 1px rgba(201,168,118,.3), radius 12, Inter 14px #e8dcc8, placeholder #b8a892; focus border rgba(201,168,118,.85).
  - Login mode: E-mail, Senha, then "Esqueci minha senha" link right-aligned (12px #c9a876).
  - Sign-up mode: Nome completo, E-mail, WhatsApp `(73) 9 0000-0000`, Senha.
- **Footer (pinned bottom, gap 14):** primary button "ENTRAR" / "CRIAR MINHA CONTA" (bg #c9a876, text #3d4f51, Inter 600 14px uppercase, ls .6px, padding 15, radius 12, hover #e8c9a8); divider "OU" with 1px lines rgba(201,168,118,.2); 2-col "Google" / "Apple" secondary buttons (bg rgba(255,255,255,.08), border rgba(201,168,118,.3), radius 12, Inter 500 13px).
- **On success:** navigate to Boas-vindas (first login) or straight to Aulas do dia (returning user – recommended).

### 2 · Boas-vindas
- **Layout:** padding 80/32/48, gap 32; bg `linear-gradient(180deg, #556b6d 0%, #4a5f61 55%, #3d4f51 100%)`.
- Logo 64×64 (left-aligned).
- Eyebrow "BOAS-VINDAS AO ITC" (Inter 500 11px, ls 2px, #c9a876).
- Title "Itacaré *Training* Center" – Playfair Display 400, 38px, line-height 1.1, #e8dcc8; "Training" italic #c9a876.
- 40×1 rule #c9a876.
- Manifesto, Playfair Display 18px, line-height 1.6, #e8dcc8:
  > Em Itacaré, o corpo aprende com o mar, com a mata e com o ritmo da maré. O ITC existe para quem quer treinar de verdade sem se desligar do lugar onde vive: surf ao nascer do sol, trilha pela Mata Atlântica, tatame, barra, respiração e roda de altinha na areia. Cada aula é um convite para acalmar a mente, despertar o corpo e cuidar de si ao lado de outras pessoas. Respire fundo, escolha sua primeira aula e mergulhe.
- Bottom: primary "MERGULHAR" → Aulas do dia; text button "Voltar" (12px #d4c5b0).

### 3 · Aulas do dia
- **Header** (padding 56/20/0, gap 18):
  - Eyebrow: month + year of selected day ("outubro 2026"), 11px uppercase #c9a876; title "Aulas do dia" Playfair 400 28px; logo 40×40 at right.
  - **Day strip:** 7-col grid, gap 6, today + next 6 days. Cell: padding 10/0, radius 14, border 1px; weekday (10px 500; first cell reads "HOJE", else DOM/SEG/TER/QUA/QUI/SEX/SÁB) over day number (17px 600). Selected: bg/border #c9a876, text #3d4f51. Unselected: bg rgba(255,255,255,.06), border rgba(201,168,118,.28), text #e8dcc8.
  - Row with top border rgba(201,168,118,.18): "Sexta, 30 de outubro" (13px 500 #e8dcc8) left, "N aulas" (12px #c9a876) right.
- **Class list** (scrolls, padding 12/20/110, gap 10). Each row = 2-col grid `52px 1fr`, gap 12:
  - Left: start time (15px 600 #e8dcc8) over end time (11px #b8a892).
  - Card: padding 14, bg rgba(255,255,255,.06), border 1px rgba(201,168,118,.22), radius 16, gap 10.
    - Modality name (Playfair 18px #e8dcc8), "Nível · Local" (12px #d4c5b0); spots label right ("5 vagas" / "1 vaga" / "Lotada", 11px 500 #c9a876).
    - Occupancy bar: 3px, track rgba(255,255,255,.1), fill #c9a876 = taken/capacity.
    - Coach avatar 26px circle (initials, bg rgba(201,168,118,.25), border rgba(201,168,118,.5)) + name 12px.
    - Action button (padding 8/14, radius 10, Inter 600 11px uppercase):
      - Open → "CHECK-IN" filled #c9a876 / text #3d4f51.
      - Checked in → "CHECK-IN FEITO" transparent, border + text #c9a876. Tapping again cancels (prototype behavior; confirm with product).
      - Full → "LISTA DE ESPERA" transparent, border rgba(212,197,176,.4), text #d4c5b0 (not wired in prototype).
  - Empty state: "Nenhuma aula neste dia." centered 13px #d4c5b0.

### 4 · Perfil
- Padding 56/24/110, gap 28.
- Eyebrow "DADOS CADASTRAIS", title "Perfil" (same styles as screen 3).
- Profile photo: 112px circle, 2px #c9a876 ring with 3px inner gap; caption "Toque para alterar a foto" 12px #c9a876. Tap → image picker → upload.
- Editable fields (same input style as login): Nome, E-mail, WhatsApp.
- Bottom: primary "SALVAR"; text button "Sair da conta" → logout → Login.

### Tab bar (screens 3 and 4)
Absolute bottom, height 84 (14 bottom padding for home indicator), bg rgba(61,79,81,.96), top border rgba(201,168,118,.2). Two equal columns: **Aulas** (calendar icon) and **Perfil** (person icon). 24px stroke icons, stroke 1.5; label 10px 600 uppercase ls .6px. Active #c9a876, inactive #d4c5b0.

## Interactions & Behavior
- Login/Criar conta toggle swaps fields in place; no navigation.
- Selecting a day reloads the class list for that date.
- Check-in updates the spots count and bar immediately (optimistic), then syncs with the server.
- Validation to implement: e-mail format; password ≥ 8 chars; WhatsApp BR mask `(DD) 9 XXXX-XXXX`; name required on sign-up. Show inline errors under fields (11px, suggest #e8a48a).
- Loading: disable primary button + spinner; class list skeleton cards.

## Suggested data model / backend
```
User      { id, name, email, whatsapp, photoUrl, passwordHash | oauthProvider, createdAt }
Modality  { id, name }                     // Surf, Trilha, Jiu-jitsu, Crossfit, Musculação, Yoga, Altinha
Coach     { id, name, photoUrl? }
Class     { id, modalityId, coachId, level, location, startsAt, endsAt, capacity }
CheckIn   { id, userId, classId, createdAt, status: 'confirmed' | 'cancelled' | 'waitlist' }
```
Endpoints:
- `POST /auth/signup`, `POST /auth/login`, `POST /auth/oauth/{google|apple}`, `POST /auth/logout`, `POST /auth/forgot-password`
- `GET /classes?date=YYYY-MM-DD` → classes with `capacity`, `taken`, `checkedIn` (for current user)
- `POST /classes/:id/checkin`, `DELETE /classes/:id/checkin` (enforce capacity in a transaction; return 409 when full)
- `GET /me`, `PATCH /me`, `POST /me/photo`

Open product questions: check-in window (how early/late), cancellation rules, whether waitlist is in v1, whether Boas-vindas shows only on first login.

## Design Tokens
Colors
- bg-top #556b6d · bg-mid #4a5f61 · bg-deep / tab bar #3d4f51 · phone bezel #1f2a2b
- gold (accent / primary) #c9a876 · gold-hover #e8c9a8
- text-primary #e8dcc8 · text-secondary #d4c5b0 · text-muted / placeholder #b8a892
- surface rgba(255,255,255,.06) · input rgba(255,255,255,.08)
- border rgba(201,168,118,.22–.30) · border-focus rgba(201,168,118,.85)

Typography
- Display: Playfair Display 400 (+ italic) – 38 / 28 / 18px
- UI: Inter 400/500/600 – 17, 15, 14, 13, 12, 11, 10px
- Eyebrows: 11px uppercase, letter-spacing 1.5–2px

Radius: 10 (small buttons), 12 (inputs, primary), 14 (day cells, toggle), 16 (cards), 999 (pills), 50% (avatars).
Spacing used: 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36.

## Assets
- `itc-logo.png` – ITC brand logo (provided by client).
- Icons: inline SVG strokes (calendar, person) – replace with the project's icon library (e.g. Lucide `Calendar`, `User`).
- Fonts: Google Fonts – Playfair Display, Inter.

## Files
- `ITC App v2.dc.html` – the full prototype (all 4 screens + logic; class data and check-in logic in the `<script data-dc-script>` block).
- `support.js`, `image-slot.js` – prototype runtime only; do not port.
- `itc-logo.png` – logo.
