# Homiewood

Social network for creating, sharing and comparing lists of **movies, series and anime**.

Users build a Top 5, track what they've watched and what they want to watch, follow
"Homies" (friends), rate and comment on titles, join groups, and earn achievements.
The catalog is sourced from external APIs (TMDB for movies/series, Jikan for anime).

## Features

- **Top 5** of favourite movies/series
- **Watched** list and **Watchlist** ("por ver")
- User profiles with achievements (logros)
- Homies (friends) and groups, with rating comparisons between users and groups
- Ratings, likes and comments on titles and lists
- Recommendations (per-user and per-group)
- Catalog backed by **TMDB** and **Jikan**, persisted locally
- Registration and login with **JWT** authentication
- Live rating updates over **WebSocket (STOMP / SockJS)**

## Tech stack

| Layer        | Technology                                                        |
| ------------ | ----------------------------------------------------------------- |
| Frontend     | React 18 + Vite 6, React Router, CSS Modules, Bootstrap 5         |
| Realtime     | `@stomp/stompjs` + `sockjs-client`                                |
| Backend      | Java 21 + Spring Boot 3.5 (Web, Data JPA, Security, WebSocket)    |
| Auth         | Spring Security + JWT (`jjwt`)                                     |
| Database     | PostgreSQL (Neon.tech in dev/prod, or local Postgres)             |
| External APIs| TMDB (movies/series), Jikan (anime)                               |
| Deploy (FE)  | GitHub Pages (served at `/Homiewood/`)                            |
| Deploy (BE)  | Render (Docker)                                                   |

## Repository structure

```
Homiewood/
├── backend/                     # Spring Boot REST API + WebSocket
│   ├── src/main/java/com/homiwood/peliculas/
│   │   ├── config/              # CORS, Security, WebSocket, Async config
│   │   ├── controller/          # REST controllers (auth, listas, grupos, catálogo, ...)
│   │   ├── service/             # Business logic, TMDB/Jikan integration
│   │   ├── repository/          # Spring Data JPA repositories
│   │   ├── model/               # JPA entities (Usuario, Contenido, Lista, ...)
│   │   ├── dto/                 # Request/response DTOs
│   │   ├── security/            # JWT authentication filter
│   │   └── exception/           # Global exception handling
│   ├── src/main/resources/
│   │   ├── application.properties           # Shared config + active profile switch
│   │   ├── application-Diego.properties      # Neon (cloud) datasource profile
│   │   └── application-Javi.properties        # Local Postgres datasource profile
│   ├── Dockerfile               # Multi-stage build (used by Render)
│   └── pom.xml
│
├── docs/                        # Frontend (this folder is the GitHub Pages source)
│   ├── src/                     # React + Vite app (active frontend)
│   │   ├── api/                 # fetch wrappers per domain
│   │   ├── components/          # Reusable UI (Navbar, Sidebar, modals, ...)
│   │   ├── context/             # Auth, Theme, Notifications providers
│   │   ├── lib/                 # auth, websocket, formatting helpers
│   │   ├── pages/               # Routed views (Home, Login, Profile, Trending, ...)
│   │   ├── styles/              # Global CSS + design tokens (variables.css)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── legacy/                  # Original vanilla HTML/CSS/JS frontend (being migrated)
│   ├── .env.example             # Frontend env var template
│   ├── vite.config.js           # base: "/Homiewood/"
│   └── package.json
│
├── .github/workflows/deploy.yml # Builds docs/ and deploys to GitHub Pages
├── docker-compose.yml
└── README.md
```

> **Note:** `docs/legacy/` holds the original static frontend. The app under `docs/src/`
> (React + Vite) is the one being actively developed and deployed.

## Prerequisites

### Backend
- **JDK 21** (e.g. Eclipse Temurin 21)
- **Maven** — or just use the bundled wrapper (`./mvnw`), no install needed
- A **PostgreSQL** database (a free [Neon.tech](https://neon.tech) project, or a local Postgres instance)

### Frontend
- **Node.js 22**
- **pnpm 11** — enable via Corepack (do **not** use npm):
  ```bash
  corepack enable
  ```
  Then run the frontend commands with `corepack pnpm ...` (or just `pnpm ...` once Corepack is active).

## Configuration

### Backend environment variables

The backend reads secrets from environment variables (never commit them). Set:

| Variable      | Description                                       |
| ------------- | ------------------------------------------------- |
| `DB_PASSWORD` | Password for the PostgreSQL datasource            |
| `JWT_SECRET`  | Secret key used to sign/verify JWTs               |
| `TMDB_TOKEN`  | TMDB API bearer token (for the movies/series catalog) |

Pick the datasource by setting the active Spring profile in
[`backend/src/main/resources/application.properties`](backend/src/main/resources/application.properties):

- `spring.profiles.active=Diego` → Neon cloud Postgres
- `spring.profiles.active=Javi` → local Postgres (`jdbc:postgresql://localhost:5434/homiwood`)

Other defaults: server runs on **port 8080**, JPA `ddl-auto=update` (schema auto-created),
allowed CORS origins include `http://localhost:5173`.

PowerShell example (current shell only):
```powershell
$env:DB_PASSWORD = "your-db-password"
$env:JWT_SECRET  = "a-long-random-secret"
$env:TMDB_TOKEN  = "your-tmdb-token"
```

### Frontend environment variables

Copy the template and adjust if needed:
```bash
cd docs
cp .env.example .env   # PowerShell: Copy-Item .env.example .env
```

| Variable       | Description                                              |
| -------------- | -------------------------------------------------------- |
| `VITE_API_URL` | Backend REST base URL (e.g. `http://localhost:8080/api`) |
| `VITE_WS_URL`  | WebSocket endpoint (e.g. `http://localhost:8080/ws`)     |

If unset, the app auto-detects: it uses the **local backend** when served from
`localhost`/`127.0.0.1`, and the **Render** URLs otherwise.

## Running locally

### 1. Backend

```bash
cd backend
./mvnw spring-boot:run          # Windows: .\mvnw spring-boot:run
```
The API starts on **http://localhost:8080** (base path `/api`, WebSocket at `/ws`).

Quick check:
```
GET http://localhost:8080/api/health
```

### 2. Frontend

```bash
cd docs
corepack pnpm install
corepack pnpm dev
```
The dev server runs on **http://localhost:5173**.

> Because `vite.config.js` sets `base: "/Homiewood/"`, the dev app is served at
> **http://localhost:5173/Homiewood/**.

## Building & deploying

### Frontend → GitHub Pages

The frontend deploys automatically. On every push to `main`, the workflow at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds `docs/` with pnpm
and publishes `docs/dist` to GitHub Pages.

To build it manually:
```bash
cd docs
corepack pnpm install --frozen-lockfile
corepack pnpm build       # output in docs/dist
corepack pnpm preview     # serve the production build locally
```

### Backend → Render (Docker)

The backend is containerized with [`backend/Dockerfile`](backend/Dockerfile) (multi-stage:
build with Temurin 21 JDK, then run the JAR). To build/run the image locally:

```bash
cd backend
docker build -t homiewood-backend .
docker run -p 8080:8080 \
  -e DB_PASSWORD=... -e JWT_SECRET=... -e TMDB_TOKEN=... \
  homiewood-backend
```

On Render, set `DB_PASSWORD`, `JWT_SECRET` and `TMDB_TOKEN` as service environment
variables. Remember to add the deployed frontend origin to the backend's
`app.cors.allowed-origins` list.

## API overview

REST endpoints are mounted under `/api` (e.g. `POST /api/auth/register`,
`POST /api/auth/login`, `GET /api/auth/me`), and the realtime channel is the STOMP
endpoint `/ws` (broker prefix `/topic`, app prefix `/app`). See the controllers in
[`backend/src/main/java/com/homiwood/peliculas/controller/`](backend/src/main/java/com/homiwood/peliculas/controller/)
for the full surface (listas, grupos, calificaciones, comentarios, recomendaciones,
seguimientos, catálogo, logros, ...).

## The team

| Role                                | Name             |
| ----------------------------------- | ---------------- |
| Dev Lead & Product Owner            | Javiera Godoy    |
| Backend Dev & DB Architecture       | Diego Contreras  |
| Fullstack Dev                       | Alexander Hass   |
| Frontend Developer                  | Javiera Gallegos |
| Frontend Developer                  | Victor Erazo     |

## License

[MIT](LICENSE)
