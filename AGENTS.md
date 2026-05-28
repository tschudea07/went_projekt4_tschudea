# AGENTS.md

## Projektueberblick

Operon ist eine Projektverwaltungs-App als pnpm-Monorepo. Das Projekt besteht aus:

- `apps/api`: NestJS API mit Better Auth, Prisma und PostgreSQL.
- `apps/web`: Angular 21 Frontend mit SSR-Konfiguration, Angular Signals und Better Auth Client.
- `packages/db`: Datenbank-nahe SQL-/Dokumentationsdateien. Dieses Verzeichnis ist aktuell kein pnpm Workspace-Package.

Die App kann aktuell User registrieren/einloggen und Projekte erstellen. Beim Projekt-Erstellen wird der eingeloggte `app_users`-Datensatz als Project Manager in `project_managers` eingetragen. Die Datenbank hat bereits Tabellen fuer weitere Team-Funktionen (`users_projects`, `project_managers`, `users_tasks`), auch wenn nicht alle Flows im aktuellen UI/API-Stand umgesetzt sind.

## Wichtige Commands

Vom Repo-Root:

```bash
pnpm install
pnpm dev
```

API:

```bash
pnpm --dir apps/api start:dev
pnpm --dir apps/api build
pnpm --dir apps/api test
pnpm --dir apps/api test:e2e
```

Web:

```bash
pnpm --dir apps/web start
pnpm --dir apps/web exec tsc -p tsconfig.app.json --noEmit
pnpm --dir apps/web test
pnpm --dir apps/web build
```

Datenbank lokal:

```bash
docker compose up -d postgres
```

Hinweis: Falls `pnpm --dir apps/web build` lokal ohne brauchbare Angular-Fehlermeldung abbricht, zuerst `pnpm --dir apps/web exec tsc -p tsconfig.app.json --noEmit` und `pnpm --dir apps/web test` verwenden, um TypeScript-/Template-Fehler einzugrenzen.

## Environment

API liest `.env` ueber `dotenv` in `apps/api/src/lib/config.ts` und Auth/DB-Code. Relevante Variablen:

- `DATABASE_URL`: PostgreSQL Connection String fuer Prisma und Better Auth.
- `BETTER_AUTH_SECRET`: Secret fuer Better Auth.
- `BETTER_AUTH_URL`: API/Auth Base URL, lokal normalerweise `http://localhost:3000`.
- `WEB_APP_URL` oder `FRONTEND_URL`: Frontend Origin, Default `http://localhost:4200`.
- `TRUSTED_ORIGINS`: Kommagetrennte CORS/Auth Origins; faellt auf `WEB_APP_URL` zurueck.
- `RESEND_API_KEY`: Optional; wenn fehlt, werden E-Mails nur geloggt.
- `EMAIL_FROM` oder `RESEND_FROM`: Absenderadresse fuer Resend.
- Docker Compose benoetigt `POSTGRES_USER` und `POSTGRES_PASSWORD` fuer den Postgres-Service.

Keine echten Secrets in Dokumentation oder Commits kopieren.

## Backend-Struktur

API Entry Points:

- `apps/api/src/main.ts`: Erstellt Nest App, deaktiviert Nest Body Parser, aktiviert CORS mit `trustedOrigins`, lauscht auf `PORT` oder `3000`.
- `apps/api/src/app.module.ts`: Registriert `AuthModule`, `ProjectsModule`, `UsersModule`.
- `apps/api/src/lib/auth.ts`: Better Auth Konfiguration, Prisma Adapter, Email/Password Auth, verpflichtende E-Mail-Verifikation.
- `apps/api/src/lib/config.ts`: `webAppUrl` und `trustedOrigins`.
- `apps/api/src/lib/email.ts`: Resend-Mailversand mit Logging-Fallback ohne API Key.
- `apps/api/src/lib/services/prisma.service.ts`: Nest Injectable Prisma Client mit `PrismaPg` Adapter.
- `apps/api/src/pipes/zod-validation.pipe.ts`: Zod-Validierung fuer Request Bodies.

Projekt-Modul:

- `apps/api/src/modules/projects/projects.module.ts`: Modul-Registrierung.
- `apps/api/src/modules/projects/projects.controller.ts`: HTTP-Routen unter `/projects`.
- `apps/api/src/modules/projects/projects.service.ts`: Prisma-Logik fuer Projektstatus und Projekterstellung.
- `apps/api/src/modules/projects/project.schema.ts`: Zod Schema `createProjectSchema` und Type `CreateProjectType`.

Aktuelle Project API:

- `GET /projects/statuses`: Liefert Statuswerte sortiert nach `id`.
- `POST /projects`: Erstellt Projekt fuer eingeloggten User; Body entspricht `createProjectSchema`.

User-Modul:

- `apps/api/src/modules/users/users.controller.ts`: `POST /users`, anonym erlaubt.
- `apps/api/src/modules/users/users.service.ts`: Erstellt `app_users`-Profil nach Better-Auth-Signup. Aktuell wird Rolle `admin` gesucht.
- `apps/api/src/modules/users/user.schema.ts`: Zod Schema fuer `id`, `name`, `email`.

Wichtige Backend-Konventionen:

- Request DTOs mit Zod in `*.schema.ts` definieren und im Controller mit `ZodValidationPipe` verwenden.
- Prisma-Zugriffe in Services halten, Controller duenn halten.
- Authentifizierten User ueber `@Session() session: UserSession` lesen.
- API verwendet `src/...` Imports; Jest kann dafuer ggf. `moduleNameMapper` brauchen, falls neue Specs fehlschlagen.

## Frontend-Struktur

App Entry Points:

- `apps/web/src/main.ts`: Browser Bootstrap.
- `apps/web/src/main.server.ts`: Server Bootstrap fuer SSR.
- `apps/web/src/server.ts`: Express SSR Server.
- `apps/web/src/app/app.config.ts`: Angular Provider, Router, Hydration, HttpClient mit Fetch.
- `apps/web/src/app/app.routes.ts`: Routing.
- `apps/web/src/app/app.html`: Layout mit Header und Router Outlet.
- `apps/web/src/styles.css`: Globale Styles/Tailwind Import.

Auth im Frontend:

- `apps/web/src/lib/auth-client.ts`: Better Auth Client mit Base URL `http://localhost:3000/api/auth` und Credentials.
- `apps/web/src/app/services/auth-session.service.ts`: Session Signal, `refresh()`, `signOut()`.
- `apps/web/src/app/guards/auth.guard.ts`: `authGuard` fuer eingeloggte User und `guestGuard` fuer Login/Signup.

Frontend Services:

- `apps/web/src/app/services/projects.service.ts`: HTTP Client fuer `/projects` und `/projects/statuses`.
- `apps/web/src/app/services/users.service.ts`: HTTP Client fuer `/users`.

Frontend Schemas:

- `apps/web/src/lib/schemas/project.schema.ts`: Zod Schema fuer Projektformular.
- `apps/web/src/lib/schemas/user.schema.ts`: Zod Schemas fuer Login und Signup.

Frontend Components:

- `apps/web/src/app/components/header`: Navigation, Logout, Brand Link.
- `apps/web/src/app/components/login`: Login-Formular mit Better Auth.
- `apps/web/src/app/components/signup`: Signup-Formular, ruft danach `UsersService.createUser` auf.
- `apps/web/src/app/components/create-project`: Projektformular mit Status-Select, Zod/Signal Forms und API-Submit.

Aktuelle Routes:

- `/login`: Login, `guestGuard`.
- `/signup`: Signup, `guestGuard`.
- `/create-project`: Projekt erstellen, `authGuard`.
- `/`: Redirect nach `/login`.

Frontend-Konventionen:

- Components sind standalone und importieren benoetigte Directives/Controls direkt.
- Formulare nutzen Angular Signal Forms (`form`, `FormField`, `validateStandardSchema`) und Zod Schemas aus `src/lib/schemas`.
- HTTP Requests zu API nutzen `withCredentials: true`.
- Pfad-Aliase im Web: `@lib/*` -> `src/lib/*`, `@components/*` -> `src/app/components/*`.

## Datenbank und Prisma

Prisma Schema:

- `apps/api/prisma/schema.prisma`: Quelle fuer DB-Modelle und Prisma Client Generator.
- Generator output: `apps/api/src/generated/prisma`.
- Generated Prisma Files nicht manuell editieren.

Migrationen:

- `apps/api/prisma/migrations/...`: Prisma Migration SQL.
- `packages/db/operon.sql`: Zusaetzliche SQL-Referenz/DB-Dump mit Seed-Daten fuer Rollen und Status.

Zentrale Tabellen/Modelle:

- `user`: Better Auth User.
- `account`, `session`, `verification`: Better Auth Tabellen.
- `app_users`: App-spezifisches Userprofil, referenziert `user` und `roles`.
- `roles`: Rollen wie `admin`, `user`.
- `projects`: Projektstammdaten mit `status_id`.
- `status`: Statuswerte fuer Projekte und Tasks.
- `project_managers`: Composite PK aus `projects_id` und `users_id`; Project Manager pro Projekt.
- `users_projects`: Composite PK aus `users_id` und `projects_id`; Projektmitglieder.
- `tasks`, `users_tasks`, `task_logs`, `comments`, `labels`, `milestones`, `priorities`: Vorbereitete Task-/Kommentar-Domain.

Wichtige ID-Beziehungen:

- Better Auth User ID steht in `user.id`.
- App-Profil steht in `app_users.id` und referenziert Better Auth mit `app_users.user_id`.
- Projektmanager/Mitgliedschaften nutzen `app_users.id`, nicht `user.id`.

## Testing Notes

API:

- Jest Config liegt in `apps/api/package.json`.
- `rootDir` ist `src`; Specs gehoeren sinnvoll neben den Source-Dateien als `*.spec.ts`.
- Bei Tests, die Services direkt instanziieren, Prisma mocken statt echte DB zu verwenden.

Web:

- Tests laufen ueber Angular/Vitest mit `pnpm --dir apps/web test`.
- Fuer reine TypeScript-/Template-Pruefung ohne Build-Artefakte: `pnpm --dir apps/web exec tsc -p tsconfig.app.json --noEmit`.
- Service-Tests koennen `provideHttpClientTesting` und `HttpTestingController` verwenden.

## Arbeitsregeln fuer Agenten

- Vor Aenderungen immer `git status --short` pruefen.
- Keine bestehenden User-Aenderungen zuruecksetzen oder ueberschreiben.
- Keine echten Secrets in Ausgaben, Commits oder Dokumentation kopieren.
- `apps/api/src/generated/prisma` nicht manuell editieren.
- Bei API-Features zuerst Schema/DTO, Controller Route, Service-Logik und Tests zusammen denken.
- Bei Frontend-Features Service-Typen, Route/Component, Template, CSS und Tests/Typecheck zusammen aktualisieren.
- Nach relevanten Aenderungen mindestens passende Checks ausfuehren:
  - API: `pnpm --dir apps/api build` und, falls Specs vorhanden, `pnpm --dir apps/api test`.
  - Web: `pnpm --dir apps/web exec tsc -p tsconfig.app.json --noEmit` und `pnpm --dir apps/web test`.

## Haefige Aufgaben und Startpunkte

- Auth/Session aendern: `apps/api/src/lib/auth.ts`, `apps/web/src/lib/auth-client.ts`, `apps/web/src/app/services/auth-session.service.ts`.
- Neue API-Ressource: neuer Ordner unter `apps/api/src/modules`, in `apps/api/src/app.module.ts` importieren.
- Projektlogik aendern: `apps/api/src/modules/projects/*`, `apps/web/src/app/services/projects.service.ts`, ggf. `apps/web/src/app/components/create-project/*`.
- Userprofil/Signup aendern: `apps/api/src/modules/users/*`, `apps/web/src/app/components/signup/*`, `apps/web/src/app/services/users.service.ts`.
- DB-Modell aendern: `apps/api/prisma/schema.prisma`, Migration erzeugen/anpassen, Prisma Client regenerieren.
- Navigation/Routen aendern: `apps/web/src/app/app.routes.ts`, `apps/web/src/app/components/header/*`.
