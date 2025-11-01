# Design Guidelines: Marvel Rivals Roster Attendance Manager

## Design Approach
**Selected Approach:** Design System - Material Design  
**Justification:** This is a data-dense productivity tool requiring clear information hierarchy, efficient data entry, and weekly reuse. Material Design provides excellent patterns for tables, form controls, and data management interfaces.

**Key Design Principles:**
- Clarity over decoration: Information must be instantly scannable
- Efficient data entry: Minimize clicks and cognitive load
- Weekly rhythm: Design supports recurring weekly updates
- Print/share friendly: Clean export capabilities

## Typography System

**Font Family:** Inter (via Google Fonts CDN)

**Hierarchy:**
- Page Title: text-3xl font-bold (Team Schedule + Date Range)
- Section Headers: text-lg font-semibold (Week dates, instructions)
- Table Headers: text-sm font-medium uppercase tracking-wide
- Player Names: text-base font-medium
- Role Labels: text-sm font-normal
- Body Text: text-sm font-normal
- Helper Text: text-xs

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, py-8)

**Container Structure:**
- Page wrapper: max-w-7xl mx-auto px-6 py-8
- Card containers: rounded-lg border with p-6
- Section spacing: space-y-6 between major sections
- Table cell padding: px-4 py-3

**Grid System:**
- Header area: Full width with title + action buttons (flex justify-between)
- Main table: Full width scrollable container
- Footer actions: Centered or right-aligned button group

## Component Library

### Data Table (Core Component)
**Structure:**
- Sticky header row with role columns (Tank, DPS, Support, Sub, Coach)
- Fixed first column for player names (sticky-left on scroll)
- Day rows with date labels in leftmost column
- Dropdown cells for each player/day intersection

**Table Specifications:**
- Border style: Border on all cells with slightly thicker borders for header/sections
- Cell sizing: Consistent width for availability columns, auto for name column
- Responsive: Horizontal scroll on mobile with sticky first column
- Density: Comfortable spacing (py-3 px-4 per cell)

### Header Section
- Large title showing "Marvel Rivals - Team Schedule"
- Editable week range display (e.g., "22.09 - 28.09")
- Action buttons group: "Edit Dates", "Save to Sheets", "Export/Share"
- Optional: Quick stats (e.g., "5/8 responses received")

### Dropdown Controls
**Availability Selector (per cell):**
- Options: "Unknown", "18:00-20:00 CEST", "20:00-22:00 CEST", "All blocks"
- Default state: "Unknown" (neutral appearance)
- Selected state: Visually distinct for each option type
- Icon indicators: Use Heroicons for dropdown arrows and status icons

### Role/Player Management
**Player Row Structure:**
- Role badge (Tank/DPS/Support/Sub/Coach) - use rounded pill design
- Player name (editable in admin mode)
- Availability cells (7 columns for days of week)

### Action Buttons
- Primary CTA: "Save Changes" (prominent, disabled state when no changes)
- Secondary actions: "Reset", "Export PDF", "Copy Link"
- Icon buttons: Edit, Delete, Add Player (use Heroicons)

### Date Range Selector
**Week Navigation:**
- Display current week range prominently
- Left/Right arrows for week navigation
- Calendar popup for custom date selection
- Format: "Monday DD.MM - Sunday DD.MM"

### Status Indicators
- Visual feedback for sync status with Google Sheets
- Last updated timestamp
- Unsaved changes indicator (subtle but visible)

### Empty States
- "No players added yet" with clear CTA to add first player
- "Week not configured" prompt to set dates

## Responsive Behavior

**Desktop (lg and above):**
- Full table view with all columns visible
- Comfortable cell spacing (px-4 py-3)
- Sticky header and first column for scroll

**Tablet (md):**
- Horizontal scroll for table
- Maintain sticky first column
- Compressed header with icon-only buttons

**Mobile (base):**
- Card-based view per player showing all days vertically
- Accordion pattern for each role category
- Single column layout
- Full-width dropdowns for easy touch interaction

## Interaction Patterns

**Data Entry Flow:**
1. User clicks date range to set week
2. Selects availability from dropdowns for each player/day
3. Real-time validation shows completion status
4. Save button syncs to Google Sheets
5. Success confirmation with share options

**Keyboard Navigation:**
- Tab through all dropdown cells in reading order
- Enter to open dropdown, Arrow keys to select, Enter to confirm
- Escape to cancel dropdown selection

**Bulk Actions:**
- Select all for a day/player to set same availability
- Copy previous week's schedule as starting point
- Clear all selections for fresh start

## Information Architecture

**Primary View Sections (in order):**
1. Header with title, week range, and primary actions
2. Quick instructions/legend (collapsible after first use)
3. Main schedule table
4. Footer with sync status and secondary actions

**Table Column Order:**
- Column 1: Day of Week + Date (e.g., "Monday 22.09")
- Columns 2-6: Role-based player availability (one column per role type)
- Each cell contains dropdown for time selection

**Visual Grouping:**
- Group by role in column headers
- Subtle row alternation for days
- Weekend days (Saturday/Sunday) visually distinguished

## Accessibility Requirements

- ARIA labels for all dropdowns and interactive elements
- Keyboard navigation through entire table
- Focus indicators on all interactive cells
- Screen reader announcements for selection changes
- Sufficient contrast for all text elements
- Touch targets minimum 44x44px on mobile

## Print/Export Optimization

- Clean print stylesheet removing navigation and edit controls
- PDF export maintains table structure and visual hierarchy
- Share link generates read-only view
- Option to export as image for Discord/messaging apps

## Performance Considerations

- Lazy load dropdown options
- Virtualize table rows if player count exceeds 20
- Debounce auto-save to Google Sheets
- Local storage for offline editing with sync on reconnect