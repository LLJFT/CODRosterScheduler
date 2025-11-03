# Marvel Rivals Roster Attendance Manager

## Overview

This application serves as a permanent team availability tracker for "The Vicious" Marvel Rivals esports team. Its core purpose is to enable team managers to track player availability for practice sessions across Tank, DPS, and Support roles. Key features include a persistent Monday-Sunday schedule, real-time synchronization with Google Sheets, inline editing, a dedicated events calendar for tournaments and scrims with comprehensive event details tracking, enhanced player management with personal information and attendance tracking, and a team notes messaging system. The design follows a Material Design aesthetic with a golden and black theme, aligning with Marvel Rivals branding. The project aims to provide a robust, year-round solution for esports team management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

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
