# Bloglist (FullStackOpen Part 4 & 5 Submission)

This repository combines the backend (Express + MongoDB) from Part 4 and the frontend (React + Vite) from Part 5 along with E2E tests (Playwright).

## Features

- User registration & login (JWT auth)
- Create, like, delete blogs
- Blogs ordered by like count
- Creator-only delete authorization
- Comprehensive tests:
  - Backend API tests (Node test runner / Supertest)
  - Frontend unit/component tests (Vitest + Testing Library)
  - Playwright E2E tests (sequential workers)

## Folder Structure

```text
bloglist/
  backend/        # Express/MongoDB API
  frontend/       # React Vite application
  e2e/            # Playwright tests
```

## Backend

### Setup

```bash
cd backend
npm install
cp .env.example .env  # fill in values
npm run dev           # starts server on PORT (default 3001)
```

### Scripts

- `npm run dev` - development server
- `npm start` - production mode
- `npm test` - backend tests (NODE_ENV=test)

### Environment Variables (`.env`)

| Key              | Description                     |
| ---------------- | ------------------------------- |
| PORT             | Server port                     |
| MONGODB_URI      | Production DB connection string |
| TEST_MONGODB_URI | Test DB connection string       |
| SECRET           | JWT signing secret              |

## Frontend

### Setup

```bash
cd frontend
npm install
npm run dev  # Vite dev server
```

Open http://localhost:5173 (port may auto-increment if busy).

### Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run test`

## E2E Tests (Playwright)

### Setup & Run

```bash
cd e2e
npm install
# Ensure backend and frontend servers are running first
npx playwright test
```

The config runs with `workers: 1` to avoid DB state conflicts.

## Running All Tests

1. Start backend (test DB configured in `.env`).
2. Start frontend.
3. Run E2E:

```bash
cd e2e
npx playwright test
```

4. Backend unit/API tests:

```bash
cd backend
npm test
```

5. Frontend unit tests:

```bash
cd frontend
npm test
```

## API Overview

Base URL: `/api`

| Endpoint   | Method | Description                 |
| ---------- | ------ | --------------------------- |
| /blogs     | GET    | List blogs (with user info) |
| /blogs/:id | GET    | Get single blog             |
| /blogs     | POST   | Create blog (auth required) |
| /blogs/:id | PUT    | Update blog (likes, etc.)   |
| /blogs/:id | DELETE | Delete blog (creator only)  |
| /users     | POST   | Register user               |
| /login     | POST   | Obtain JWT                  |

Auth: Pass `Authorization: Bearer <token>` header for protected routes.

## Deterministic E2E Testing Details

- Like ordering test re-fetches and expands each blog card using `data-testid` attributes.
- Delete tests confirm creator-only visibility.
- All selectors stable via `data-testid`.

## Potential Future Improvements

- Add pagination for large blog lists
- Add optimistic UI updates
- Add refresh token flow
- Containerize with Docker Compose

## License & Usage

Educational usage for FullStackOpen course submission.
| /blogs | POST | Create blog (auth required) |
| /blogs/:id | PUT | Update blog (likes, etc.) |
| /blogs/:id | DELETE | Delete blog (creator only) |
| /users | POST | Register user |
| /login | POST | Obtain JWT |

Auth: Pass `Authorization: Bearer <token>` header for protected routes.

## Deterministic E2E Details

- Like ordering test re-fetches and expands each blog card using `data-testid` attributes.
- Delete tests confirm creator-only visibility.
- All selectors stable via `data-testid`.

## Next Steps / Improvements (Optional)

- Add pagination for large blog lists
- Add optimistic UI updates
- Add refresh token flow
- Containerize with Docker Compose

## License

Educational usage for FullStackOpen course submission.
