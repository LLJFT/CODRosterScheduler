# Marvel Rivals Roster Attendance Manager

## Overview

This is a permanent team availability tracker for Marvel Rivals esports teams called "The Vicious". The application allows team managers to track player availability across different roles (Tank, DPS, Support) for practice sessions. It features a permanent schedule (Monday-Sunday) that persists year-round, real-time synchronization with Google Sheets, inline editing capabilities, and a Material Design-inspired interface with golden/black theme matching Marvel Rivals branding.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Role Simplification** (November 1, 2025): Reduced roles to Tank, DPS, Support only
  - Removed Sub and Coach roles from all components
  - Updated schema, PlayerManager, and ScheduleTable
  - Cleaner role selection with only core competitive roles
- **Inline Editing from Schedule Table** (November 1, 2025): Edit players directly from the table
  - **Role dropdown in table**: Click role to change between Tank/DPS/Support
  - **Player name editing**: Click player name to edit inline, press Enter or click outside to save
  - Changes trigger unsaved state and require Save button click
  - Real-time updates in the UI
- **Player Edit Functionality** (November 1, 2025): Added ability to edit existing players via Manage Players
  - Edit button (pencil icon) next to each player in Manage Players dialog
  - Dialog switches to edit mode showing "Edit Player" title
  - Pre-fills player name and role for easy modification
  - Updates player information in real-time
- **Enhanced Google Sheets Formatting** (November 1, 2025): Professional role-based row coloring
  - **Entire row coloring** based on player role (not just Role column):
    - Tank rows: Light blue (#ADD8E6) - RGB(0.678, 0.847, 0.902)
    - DPS rows: Light pink/red (#FFC0CB) - RGB(1, 0.753, 0.796)
    - Support rows: Light green (#90EE90) - RGB(0.565, 0.933, 0.565)
  - **Strong black borders** around all cells (RGB 0, 0, 0) for professional look
  - Bold text for Role column
  - Players automatically sorted by role (Tank → DPS → Support)
  - Time slot dropdowns (unknown, 18:00-20:00 CEST, 20:00-22:00 CEST, All blocks, cannot)
  - Role dropdowns (Tank, DPS, Support) in column A
  - Prevents manual entry errors in shared spreadsheets
  - **Note**: Dropdown styling is controlled by Google Sheets and cannot be customized via API
- **Professional Google Sheets Formatting** (November 1, 2025): Implemented beautiful formatting for exported schedules
  - Golden header row (RGB 1, 0.85, 0) with bold text matching app theme
  - Merged title row with centered text and border
  - Auto-resized columns for optimal readability
  - Professional borders on all cells (solid lines with subtle gray for data rows)
  - Frozen header rows (3 rows) for easy scrolling
  - Column count calculation uses Math.max across all rows to ensure all columns formatted
- **English UI** (November 1, 2025): Application uses English language with LTR layout
  - All UI components in English: buttons, labels, forms, toast messages
  - HTML direction set to LTR (dir="ltr") for proper left-to-right layout
  - Clean, professional interface optimized for team managers
- **Golden Color Theme** (November 1, 2025): Implemented bright golden yellow and black color scheme
  - Primary color: HSL 51 100% 50% (bright golden yellow #FFD700)
  - Dark mode background: HSL 0 0% 5% (nearly pure black)
  - Dark mode text/foreground: HSL 51 100% 50% (golden yellow)
  - Dark mode borders: HSL 51 100% 30% (darker golden yellow for contrast)
  - Design matches Marvel Rivals esports branding with bold golden accents on black
  - All color tokens updated in index.css for consistent theming across all components
- **Permanent Schedule** (November 1, 2025): Changed from weekly schedule to permanent year-round schedule
  - Removed week selector - schedule is now permanent (Monday-Sunday)
  - Schedule persists across all sessions with ID "permanent-schedule"
  - Title updated to "The Vicious Availability Times (Current Date)"
  - Google Sheets reflects permanent schedule with current date
- **Dynamic Google Sheets Creation** (November 1, 2025): Implemented automatic spreadsheet creation per user
  - System now creates a unique spreadsheet titled "The Vicious Availability Times" on first save
  - Spreadsheet ID stored in new `settings` database table for reuse across sessions
  - Share button provides user's own Google Sheets link dynamically via /api/spreadsheet-info endpoint

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
- LTR (left-to-right) layout for English language

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
- Professional formatting: Golden headers, borders, auto-sized columns, frozen rows

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
- date-fns for date manipulation

**Styling Dependencies**:
- Tailwind CSS with PostCSS processing
- class-variance-authority for component variant management
- tailwind-merge and clsx for conditional className utilities