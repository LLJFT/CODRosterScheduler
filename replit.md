# Marvel Rivals Roster Attendance Manager

## Overview

This application serves as a permanent team availability tracker for "The Vicious" Marvel Rivals esports team. Its core purpose is to enable team managers to track player availability for practice sessions across Tank, DPS, and Support roles. Key features include a persistent Monday-Sunday schedule, real-time synchronization with Google Sheets, inline editing, a dedicated events calendar for tournaments and scrims with comprehensive event details tracking, enhanced player management with personal information and attendance tracking, and a team notes messaging system. The design follows a Material Design aesthetic with a golden and black theme, aligning with Marvel Rivals branding. The project aims to provide a robust, year-round solution for esports team management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Direct File Upload for Scoreboard Images** (November 3, 2025): Replaced URL input with direct file upload using Replit Object Storage
  - Implemented ObjectUploader component using Uppy v5.x with dashboard modal interface
  - File upload flow: Client requests presigned URL → uploads to storage → stores path in database
  - Image serving via GET /objects/:objectPath endpoint with proper caching headers
  - Uppy configuration: Single file upload, 10MB max size, image files only
  - Memory leak prevention: Added useEffect cleanup to properly dispose Uppy instances on unmount
  - Object storage setup: Default bucket with public search paths and private directory
  - API endpoints: POST /api/objects/upload (presigned URL generation)
  - Games table imageUrl stores object paths (e.g., /objects/uploads/{uuid})
- **Events Results Page** (November 3, 2025): New dedicated page for viewing event outcomes
  - New `/results` route displaying upcoming and past events with filtering
  - Smart event classification: Same-day events with future times appear in "Upcoming"
  - Events without time treated as upcoming if date is today or future
  - Upcoming events sorted chronologically (earliest first)
  - Past events sorted reverse chronologically (most recent first)
  - Result badges: Win (default variant), Loss (destructive), Draw (secondary), Pending (outline)
  - Event type badges with color coding: Tournament (yellow), Scrim (blue), VOD Review (purple)
  - Navigation: "Results" button added to Home page toolbar
  - Display format: Date as "MMM dd, yyyy", opponent name, result badge, event type badge
  - Eye icon button navigates to full event details page
- **Event Details Page - English Conversion & Image Support** (November 3, 2025): Comprehensive event tracking with game results and scoreboard images
  - New `/events/:id` route for detailed event information
  - All UI text converted to English (labels, buttons, placeholders, toasts)
  - Event details form: result (win/loss/draw/pending), opponent name, notes
  - Games management: add, edit, delete individual games with codes, scores, and scoreboard images
  - Scoreboard table: displays all games with codes, results, and image viewer
  - Image viewing modal: click "View" button to see full scoreboard images
  - Navigation: Eye icon button on Events calendar leads to details page
  - Schema updates: `events` table with result/opponentName/notes, `games` table with eventId (FK), gameCode, score, imageUrl
  - API endpoints: GET /api/events/:eventId/games, POST/PUT/DELETE /api/games/:id
  - Full CRUD permissions: Users can delete or edit any event detail or game
- **Team Notes Messaging System** (November 3, 2025): Implemented message-based team communication
  - Message posting interface: Users enter their name and message content
  - Chronological message table: Shows sender, message, timestamp, and delete action
  - Accurate timestamps: Generated at submission time (not component mount) with second-level precision
  - Timestamp display: Format "MMM dd, yyyy" and "hh:mm:ss a" shows exact send time
  - Real-time updates: Messages appear immediately with automatic cache invalidation
  - Schema: `team_notes` table with senderName, message, timestamp (ISO format)
  - API endpoints: GET/POST/DELETE for team notes management
