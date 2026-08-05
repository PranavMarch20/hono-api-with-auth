# Hono API with Authentication

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A **TypeScript** based HTTP API built with the **Hono** framework, featuring **JWT‑based API‑key authentication**, **PostgreSQL** persistence via **Drizzle ORM**, and **Zod** validation. The project demonstrates a clean, modular structure with routes for authors, books, authentication, and API‑key management.

---

## ✨ Features

- **Fast, lightweight routing** using Hono.
- **API‑key authentication** (middleware) protecting mutable endpoints.
- **Schema‑validated request bodies** with `@hono/standard-validator` + Zod.
- **PostgreSQL** integration via Drizzle ORM (type‑safe queries).
- **Docker Compose** for local development (PostgreSQL + API server).
- **Typed environment variables** (`dotenv`).
- **Fully typed** TypeScript project with ES‑module support.

---

## 🛠️ Tech Stack

| Category          | Tool / Library                              |
|------------------|---------------------------------------------|
| Runtime          | Node.js (>=18)                             |
| Server Framework | Hono (`^4.x`)                              |
| Validation       | Zod (`^4.x`) + `@hono/standard-validator` |
| ORM              | Drizzle ORM (`^1.0.0‑rc.4`)                |
| Database         | PostgreSQL (via Docker)                    |
| Auth Middleware  | Custom API‑key middleware (`src/middlewares/auth.ts`) |
| Dev Tools        | `tsx` for hot‑reloading, `dotenv`           |

---

## 📦 Prerequisites

- **Node.js** (18+)
- **Docker & Docker‑Compose** (for the bundled Postgres instance)
- **pnpm / npm / yarn** – any package manager you prefer

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PranavMarch20/hono-api-with-auth.git
cd hono-api-with-auth
```

### 2. Install dependencies

```bash
npm install   # or pnpm install / yarn install
```

### 3. Set up environment variables

Create a `.env` file (you can copy from `.example.env`):

```env
# Server
PORT=3000

# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=hono_api
```

### 4. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

The database will be reachable at `postgres://postgres:postgres@localhost:5432/hono_api`.
You can see tables using drizzle with `npx drizzle-kit studio`.

### 5. Run database migrations (Drizzle)

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 6. Start the API server (development mode)

```bash
npm run dev
```

The server will start on `http://localhost:3000` and output a log line like:

```
Server is running on http://localhost:3000
```

---

## 📚 API Overview

All routes are prefixed with the entity name (`/authors`, `/books`, `/auth`, `/api-keys`).

### Authors (`/authors`)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/authors/` | List all authors |
| `GET` | `/authors/:id` | Retrieve a single author |
| `POST` | `/authors/` *(protected)* | Create an author |
| `PUT` | `/authors/:id` *(protected)* | Update an author |
| `DELETE` | `/authors/:id` *(protected)* | Delete an author |

### Books (`/books`)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/books/` | List all books (includes author data) |
| `GET` | `/books/:id` | Retrieve a single book |
| `POST` | `/books/` *(protected)* | Create a book |
| `PUT` | `/books/:id` *(protected)* | Update a book |
| `DELETE` | `/books/:id` *(protected)* | Delete a book |

### Authentication (`/auth`)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/login` | Generate a new API key for a user (placeholder implementation) |
| `POST` | `/auth/logout` | Revoke an API key |

### API‑Key Management (`/api-keys`)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api-keys/` *(protected)* | List API keys for the authenticated user |
| `POST` | `/api-keys/` *(protected)* | Create a new API key |
| `DELETE` | `/api-keys/:id` *(protected)* | Revoke an API key |

**Protected routes** require an `x-api-key` header containing a valid API key. The `apiKeyAuth` middleware validates the key and injects `apiKeyUser` (id & role) into the request context.

---

## 📁 Project Structure

```
├─ src/                         # Application source
│  ├─ data/                     # Env loader (env.ts)
│  ├─ db/                        # Drizzle setup, migrations, schema
│  ├─ middlewares/               # auth middleware
│  ├─ routes/                    # Route modules (author, book, auth, apiKey)
│  └─ index.ts                   # Server entry point
├─ .env.example                  # Example env file
├─ drizzle.config.ts            # Drizzle‑kit configuration
├─ docker-compose.yml            # PostgreSQL container
├─ package.json
├─ tsconfig.json
└─ README.md                     # This file
```

---

## 🧪 Testing & Validation

The project currently does not include automated tests, but you can manually verify endpoints with tools like **cURL**, **Postman**, or **httpie**.

Example – list authors:

```bash
curl http://localhost:3000/authors/
```

Example – create a book (protected):

```bash
curl -X POST http://localhost:3000/books/ \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"title":"My Book","authorId":"<author‑uuid>"}'
```

---

## 🤝 Use it

You can use it as a boilerplate for your own projects. You can also contribute to this project by opening issues or submitting pull requests.

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/awesome-feature`)
3. Commit your changes
4. Push and open a PR
