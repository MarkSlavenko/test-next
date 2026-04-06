# Search Engine Assignment (NestJS + Next.js)

A full-stack search application that proxies requests to DuckDuckGo, keeps a PostgreSQL history of queries, and provides a rich UI with client-side pagination and a custom find-in-page feature.

## 🚀 Quick Start

### 1. Database Setup
Ensure Docker is running, then start the PostgreSQL instance (don't forget to set ENV vars in backend/.env):
```bash
docker compose up -d
```

### 2. Backend Setup
```bash
cd backend
npm install

# Run database migrations
npm run migration:run

# Start the NestJS server (runs on http://localhost:3001)
npm run start:dev
```
> **Swagger API Documentation** is available at `http://localhost:3001/api/docs` once the server is running.

### 3. Frontend Setup
In a new terminal instance:
```bash
cd frontend
npm install

# Start the Next.js server (runs on http://localhost:3000)
npm run dev
```

---

## 🏗 Architecture & Technical Decisions

### Backend (NestJS + TypeORM)
- **Proxy Strategy & Caching:** Proxies requests to DuckDuckGo API. To prevent hitting rate limits and ensure lightning-fast pagination, responses are cached in-memory for 5 minutes using `@nestjs/cache-manager`.
- **Swagger Documentation:** API endpoints and DTOs are fully documented using `@nestjs/swagger` and `swagger-ui-express`.
- **Data Persistence:** Uses TypeORM with explicit migrations instead of `synchronize: true` to adhere to production best practices. Queries are saved in a fire-and-forget manner during POST requests to avoid blocking the main search response.
- **Validation:** Strict DTO validation via `class-validator`.

### Frontend (Next.js 15)
- **Separation of Concerns:** Business logic is cleanly extracted into custom hooks (`useSearch` and `useFindInPage`), preventing component bloat.
- **URL State Synchronization:** Search query and pagination state are seamlessly synchronized with URL parameters (`?q=...&page=...`), making searches easily shareable without full page reloads.
- **Server Components:** `app/page.tsx` acts as a Server Component, fetching the initial search history directly from the backend on load.
- **Performance & UX:** Extensive use of `React.memo` and `useCallback` to prevent unnecessary re-renders. A custom `useDebounce` hook protects the UI from freezing when typing heavily in the find-in-page search.
- **Custom Find-in-Page:** Implemented entirely via React state without relying on heavy external libraries. It dynamically calculates match offsets and injects `<mark>` tags, enabling smooth next/prev scrolling navigation.

## 💡 Potential Improvements (For Production)
1. **Monorepo Architecture:** Migrate to Turborepo or npm workspaces to share TypeScript interfaces/DTOs between backend and frontend seamlessly.
2. **Advanced DOM Highlighting:** Replace the custom highlight component with `mark.js` for more resilient DOM traversal if dealing with complex HTML structures.