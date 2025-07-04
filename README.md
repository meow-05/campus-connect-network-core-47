
# IntraLink - Campus Networking Platform

A role-based campus networking platform for students, faculty, and mentors.

## Project Structure

This project follows a feature-based architecture with clear separation between backend and frontend concerns.

### Backend Structure
- `backend/features/` - Domain-specific backend logic
- `backend/utils/` - Shared utilities and helpers
- `backend/migrations/` - Database migrations
- `backend/cron/` - Scheduled tasks

### Frontend Structure
- `src/features/` - Feature-specific components and hooks
- `src/pages/` - Role-based page components
- `src/components/` - Shared UI components
- `src/lib/` - API clients and constants

## Development Phases

### Phase 1: Scaffolding + Supabase Integration ✅
- Project structure setup
- Supabase types generation
- Database connection setup

### Phase 2: Authentication (Upcoming)
- Authentication system
- Protected routes
- Role-based access

### Phase 3: Backend Features (Upcoming)
- Feature implementation
- API endpoints
- Business logic

### Phase 4: Frontend UI (Upcoming)
- Component implementation
- User interfaces
- Feature integration

### Phase 5: Testing & Launch (Upcoming)
- Testing suite
- Access control
- Production deployment

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Testing**: Jest, Playwright

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
