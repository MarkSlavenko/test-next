# Search Engine Assignment (NestJS + Next.js)

A full-stack search application that proxies requests to DuckDuckGo, keeps a PostgreSQL history of queries, and provides a rich UI with client-side pagination and a custom find-in-page feature.

## 🚀 Quick Start

### 1. Database Setup
Ensure Docker is running, then start the PostgreSQL instance:
\`\`\`bash
docker compose up -d
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install

# Run database migrations
npm run migration:run

# Start the NestJS server (runs on http://localhost:3001)
npm run start:dev
\`\`\`

### 3. Frontend Setup
In a new terminal instance:
\`\`\`bash
cd frontend
npm install

# Start the Next.js server (runs on http://localhost:3000)
npm run dev
\`\`\`

---

## 🏗 Architecture & Technical Decisions

### Backend (NestJS + TypeORM)
- **Proxy Strategy:** Proxies requests to DuckDuckGo API. Responses are flattened, as the DDG API often returns nested categorizations.
- **Data Persistence:** Uses TypeORM with explicit migrations instead of `synchronize: true` to adhere to production best practices. Queries are saved in a fire-and-forget manner during POST requests to avoid blocking the main search response.
- **Validation:** Strict DTO validation via `class-validator`.

### Frontend (Next.js 15)
- **Server Components:** `app/page.tsx` acts as a Server Component, fetching the initial search history directly from the backend on load to ensure fast initial paint and SEO benefits.
- **Client State:** The search interface relies on React Hook Form + Zod for robust query validation.
- **Custom Find-in-Page:** Implemented entirely via React state without relying on heavy external libraries. It dynamically calculates match offsets and injects `<mark>` tags, enabling smooth next/prev scrolling navigation.

## 💡 Potential Improvements (For Production)
1. **Monorepo Architecture:** Migrate to Turborepo or npm workspaces to share TypeScript interfaces/DTOs between backend and frontend seamlessly.
2. **Rate Limiting & Caching:** Implement Redis caching on the NestJS proxy to prevent hitting DuckDuckGo rate limits for repeated queries.
3. **URL State Synchronization:** Sync the search query and pagination state with the URL search parameters (`?q=...&page=...`) to allow link sharing.
4. **Advanced DOM Highlighting:** Replace the custom highlight component with `mark.js` for more resilient DOM traversal if dealing with complex HTML structures.