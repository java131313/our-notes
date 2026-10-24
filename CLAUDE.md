# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Our Notes" is a shared note-taking application built as a Progressive Web App (PWA) deployed on Cloudflare. The application features a mobile-first design with a native app-like UI, providing five distinct note categories: Shopping, Map, Calendar, Words, and Idioms quiz.

## Architecture

### Frontend
- **Framework**: Vue 3 with TypeScript and Composition API
- **UI Library**: Vuetify 3 (Material Design components)
- **Build Tool**: Vite
- **State Management**: Pinia store (`src/stores/notesStore.ts`)
- **Routing**: Vue Router with three main routes: `/shopping`, `/map`, `/calendar`
- **PWA**: Configured with vite-plugin-pwa for offline capability

### Backend
- **Framework**: Hono (lightweight web framework)
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite-based)
- **API**: RESTful API with CRUD operations for three note types

### Database Schema
Five main tables in `schema.sql`:
- `shopping_notes` (id, text, created_at)
- `map_notes` (id, text, created_at)  
- `calendar_notes` (id, text, date, person, created_at)
- `words` (id, english, japanese, chinese, created_at)
- `idioms` (id, emoji, chinese, japanese, created_at) — seeded with 489 built-in entries via `seed/idioms.sql` (regenerate with `node seed/build-seed.cjs` from `.tmp-idioms/batch-*.json`)

## Key Components

### Core Application Structure
- `src/App.vue` - Main application component with routing and modal management
- `src/main.ts` - Application entry point with Vue, Pinia, Vuetify setup
- `src/stores/notesStore.ts` - Central state management with API integration and localStorage fallback

### UI Components
- `src/components/BottomNavigation.vue` - Fixed bottom navigation bar
- `src/components/ActionButtons.vue` - Floating action buttons (+ and edit)
- `src/components/AddNoteModal.vue` - Modal for adding new notes
- `src/pages/` - Individual page components for each note type

### API Integration
- Production API: `https://our-notes-api.our-notes.workers.dev`
- Development API: `http://localhost:8787`
- Automatic fallback to localStorage on API failures
- Full CRUD operations for all note types

## Development Commands

### Setup and Development
```bash
# Install dependencies
npm install

# Start frontend development server
npm run dev

# Start API development server (separate terminal)
npm run api:dev

# Build frontend
npm run build

# Type checking
npm run build  # includes vue-tsc -b
```

### Deployment
```bash
# Deploy API to Cloudflare Workers
npm run api:deploy

# Deploy frontend to Cloudflare Pages
npm run build
npx wrangler pages deploy dist --project-name our-notes
```

## Development Workflow

### Data Flow
1. **Frontend** (Vue app) makes API calls to backend
2. **Backend** (Hono on Workers) processes requests and queries D1 database  
3. **Fallback** to localStorage if API fails for offline capability
4. **Real-time sync** when API becomes available again

### State Management Pattern
- Pinia store handles all API interactions
- Automatic localStorage backup on successful operations
- Error handling with graceful degradation to offline mode
- Loading states and error messages for user feedback

### Note Types and Features
- **Shopping Notes**: Simple text-based notes for shopping lists
- **Map Notes**: Location-based notes for places and directions
- **Calendar Notes**: Date-specific notes with person assignment (1 or 2)
- **Words Notes**: Vocabulary cards with English/Japanese/Chinese translations and tap-to-reveal study mode
- **Idioms Quiz**: Emoji-to-idiom guessing game with Chinese/Japanese yojijukugo answers, session scoring, and answer reveal; idiom data is lazily fetched when the page opens (large dataset)

### UI Patterns
- Mobile-first responsive design
- Bottom navigation for page switching
- Floating action button for adding notes
- Edit mode toggle for note management
- Modal-based forms for note creation

## Configuration Files

- `wrangler.toml` - Cloudflare Workers/D1 configuration
- `vite.config.ts` - Frontend build configuration with PWA setup
- `tsconfig.*.json` - TypeScript configuration for app and build tools

## API Endpoints

All endpoints follow RESTful conventions:
- GET `/api/{type}-notes` - Fetch all notes
- POST `/api/{type}-notes` - Create new note
- PUT `/api/{type}-notes/:id` - Update note
- DELETE `/api/{type}-notes/:id` - Delete note

Where `{type}` is: `shopping`, `map`, `calendar`, `words`, or `idioms`