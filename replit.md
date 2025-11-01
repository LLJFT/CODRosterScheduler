# Marvel Rivals Roster Attendance Manager

## Overview

This is a team schedule and attendance management application for Marvel Rivals esports teams. The application allows team managers to track player availability across different roles (Tank, DPS, Support, Sub, Coach) for weekly practice sessions. It features a weekly calendar view with time block selections, real-time synchronization with Google Sheets, and a Material Design-inspired interface optimized for Arabic (RTL) layouts.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Dynamic Google Sheets Creation** (November 1, 2025): Implemented automatic spreadsheet creation per user
  - Removed hardcoded spreadsheet ID (was: 1W0wvf6RODd-fcJ2mFh89LyyN3RKCaxp-_DaR74cHKjA)
  - System now creates a unique "Marvel Rivals Team Schedule" spreadsheet on first save
  - Spreadsheet ID stored in new `settings` database table for reuse across sessions
  - Share button provides user's own Google Sheets link dynamically via /api/spreadsheet-info endpoint
- **Language Conversion** (November 1, 2025): Converted entire UI from Arabic (RTL) to English (LTR)
- **Share Functionality Update** (November 1, 2025): Share button now copies Google Sheets link instead of Replit app URL

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Wouter for lightweight client-side routing

**State Management**: 
- TanStack Query (React Query) for server state management and caching
- Local React state for UI interactions
- Query invalidation pattern for real-time updates after mutations

**UI Component System**:
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Material Design principles for data-dense interfaces
- RTL (right-to-left) layout support for Arabic language

**Design Tokens**:
- Custom color system with HSL values for theme consistency
- Elevation system using opacity-based overlays for hover/active states
- Consistent spacing scale using Tailwind's spacing units
- Typography hierarchy using Inter font family

**Key UI Patterns**:
- Schedule table with sticky headers and columns
- Dropdown selects for availability input
- Badge system for role and availability status visualization
- Toast notifications for user feedback
- Modal dialogs for player management

### Backend Architecture

**Runtime**: Node.js with Express.js

**API Design**: RESTful API with JSON payloads

**Key Endpoints**:
- `GET /api/schedule` - Fetch schedule data for a given week range
- `POST /api/schedule` - Save/update schedule data
- `GET /api/players` - Fetch all players
- `POST /api/players` - Add new player
- `DELETE /api/players/:id` - Remove player
- `GET /api/spreadsheet-info` - Get user's Google Sheets spreadsheet ID and URL

**Data Flow Pattern**:
1. Client requests schedule by week range
2. Server checks PostgreSQL database first
3. If not found, attempts to read from Google Sheets
4. Converts Google Sheets data to application schema
5. Stores in database and returns to client
6. On save, writes to both database and Google Sheets

**Storage Strategy**:
- PostgreSQL database for persistent storage (DbStorage class)
- Storage interface pattern (IStorage) for clean abstraction
- UUID-based entity identification via gen_random_uuid()

**Error Handling**:
- Graceful fallback when Google Sheets unavailable
- Returns empty schedule structure on read errors
- Validation using Zod schemas via drizzle-zod

### Data Storage Solutions

**Primary Storage**: PostgreSQL database (production-ready persistent storage)

**Database Schema** (prepared for PostgreSQL via Drizzle ORM):
- `players` table: id, name, role
- `schedules` table: id, weekStartDate, weekEndDate, scheduleData (JSONB), googleSheetId
- `settings` table: id, key (unique), value - Stores application settings including Google Sheets spreadsheet ID

**Schema Design Philosophy**:
- JSONB column for flexible schedule data structure
- Week-based partitioning using date range as composite key
- Foreign key relationship potential between schedules and players

**ORM Configuration**:
- Drizzle ORM with Neon serverless PostgreSQL driver
- Migration support via drizzle-kit
- Zod schema integration for type-safe validation

**Data Models**:
```typescript
PlayerAvailability {
  id: string
  name: string
  role: RoleType
  availability: Record<DayOfWeek, AvailabilityOption>
}

Schedule {
  id: string
  weekStartDate: string (ISO format)
  weekEndDate: string (ISO format)
  scheduleData: { players: PlayerAvailability[] }
  googleSheetId: string (sheet name reference)
}
```

### Authentication & Authorization

**Current State**: No authentication implemented

**Session Management**: express-session with connect-pg-simple configured but not actively used

**Future Considerations**: Ready for session-based authentication with PostgreSQL session store

### External Dependencies

**Google Sheets Integration**:
- Purpose: Two-way sync of schedule data for sharing with team
- Authentication: OAuth2 via Replit Connectors system
- Access token management with automatic refresh
- Dynamic spreadsheet creation: Creates new spreadsheet titled "Marvel Rivals Team Schedule" on first use
- Spreadsheet ID persistence: Stored in settings table with key "google_spreadsheet_id"
- Sheet naming convention: `Week_{weekStartDate}` (tabs within the user's spreadsheet)
- Data transformation layer to convert between app format and spreadsheet layout

**Google APIs Client**:
- googleapis package for Sheets API v4
- OAuth2Client for credential management

**Replit Platform Services**:
- Replit Connectors for Google Sheets OAuth
- Environment-based authentication using REPL_IDENTITY or WEB_REPL_RENEWAL tokens
- Connector hostname for API requests

**Build & Development Tools**:
- Vite plugins for development experience (runtime error overlay, dev banner, cartographer)
- esbuild for server-side bundling
- tsx for TypeScript execution in development

**Font Resources**:
- Google Fonts CDN for Inter font family (weights 300-800)

**Third-party UI Libraries**:
- Radix UI primitives for accessible components
- cmdk for command palette functionality
- embla-carousel for carousel components
- react-day-picker for calendar widget
- vaul for drawer components
- date-fns for date manipulation with Arabic locale support

**Styling Dependencies**:
- Tailwind CSS with PostCSS processing
- class-variance-authority for component variant management
- tailwind-merge and clsx for conditional className utilities