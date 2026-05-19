# Project Portfolio UI System

A complete, creative UI system for the project portfolio section built with the same architectural patterns as the Experience section but with distinct layouts suited to the data-rich project domain.

## Architecture

### Routing (`/${username}/projects/*`)

| Route | Component | Purpose | Access |
|-------|-----------|---------|--------|
| `/${username}/projects` | `page.tsx` | Main listing with bento grid | Public/Own |
| `/${username}/projects/create` | `CreateProjectPage.tsx` | Multi-step creation form | Owner only |
| `/${username}/projects/[id]` | `ProjectDetailView.tsx` | Detail + engagement + comments | Public (if public) |
| `/${username}/projects/[id]/edit` | `EditProjectPage.tsx` | Full edit form | Owner only |
| `/${username}/projects/[id]/collaborators` | `CollaboratorManager.tsx` | Team management | Owner + editors |

### Profile Resolution (copied from Experience pattern)

```typescript
type ProjectScenario =
  | { kind: "public"; username: string }
  | { kind: "own" }
  | { kind: "not-found" }
  | { kind: "user-not-found"; username: string }
  | { kind: "pending" };
```

Uses `checkIfOwnProfile()` + `validateProfileUsername()` to determine view mode.

## Component Inventory (21 files)

### Pages & Views
- **`page.tsx`** — Scenario resolver, data fetching coordinator
- **`OwnProjectsView.tsx`** — Owner listing with CRUD, filters, stats
- **`PublicProjectsView.tsx`** — Visitor read-only listing
- **`ProjectDetailView.tsx`** — Detail page with tabbed interface (Overview | Engagement | Collaborators | Activity)
- **`CreateProjectPage.tsx`** — Tabbed creation form (Basic | Media | Settings)
- **`EditProjectPage.tsx`** — Tabbed edit form with current media previews
- **`CollaboratorManager.tsx`** — Dedicated collaborator management page

### Listing Components
- **`ProjectGrid.tsx`** — Bento grid layout (featured card spans 2 cols)
- **`ProjectCard.tsx`** — Rich card with media, stats, hover actions, status badges
- **`ProjectStatsBar.tsx`** — Visual stat cards (Total, Public, Completed, Concepts)
- **`ProjectFilters.tsx`** — Search + sort controls
- **`EmptyProjectsState.tsx`** — Animated empty state with example projects
- **`LoadingSkeleton.tsx`** — Bento grid skeleton with stats

### Detail Components
- **`ProjectHero.tsx`** — Media gallery with carousel, like/comment counts, status badges
- **`ProjectInfoGrid.tsx`** — Metadata cards (timeline, budget, client, stack, tags)
- **`EngagementSection.tsx`** — Full engagement: recent likes avatars + nested comment threads with reply
- **`CollaboratorList.tsx`** — Inline team display with manage link
- **`AuditActivityFeed.tsx`** — Owner-only activity log with color-coded actions

### Dialogs
- **`DeleteProjectDialog.tsx`** — Delete confirmation
- **`ProjectDialogs.tsx`** — Dialog coordinator

## Key Design Decisions

### 1. Creative Layout (Different from Experience)
- **Experience**: Timeline with year grouping (chronological jobs)
- **Projects**: Bento grid with featured hero card (non-chronological portfolio)
- **Stats**: Visual cards instead of inline chips
- **Detail**: Tabbed dashboard instead of single scroll

### 2. Media Handling
- 4 named slots: `hero_media`, `media_1`, `media_2`, `media_3`
- Gallery carousel in detail view with thumbnail dots
- Current media preview in edit mode

### 3. Engagement (Public)
- Visitors see full likes list (avatars) + nested comment threads
- Real-time like toggle with optimistic UI
- Reply-to-comment with nested display

### 4. Collaborators (Dedicated Page)
- Not inline CRUD — dedicated page for better UX
- Role badges, edit permissions, contribution descriptions
- Add/edit/delete with modal dialogs

### 5. Audit (Owner-Only)
- Activity feed in "Activity" tab
- Color-coded by action type (create=green, delete=red, etc.)
- Time-ago formatting

### 6. Theming
- Exact same CSS variables: `--accent`, `--foreground`, `--background`
- Same component imports: `PageHeader`, `Button`, `Textinput`, `TextArea`, `FileInput`, `ErrorMessage`
- Same animation library: `framer-motion`
- Same icon library: `lucide-react`

## Store Integration

### Zustand Stores Used
```typescript
useProjectStore        // projects CRUD, stats
useProjectEngagementStore  // likes, comments, engagement stats
useCollaboratorStore   // team management
useProjectAuditStore   // activity logs (owner only)
```

### Key Store Patterns
- Data keyed by `projectId` for multi-project caching
- Optimistic updates for likes and comment additions
- Loading states per action (`loading.fetchProjects`, `loading.toggleLike`, etc.)
- Error states per action with automatic dismissal

## Usage

### 1. Mount the listing page
```tsx
// app/(dashboard)/[username]/projects/page.tsx
import ProjectsPage from "@/components/projects/page";
export default ProjectsPage;
```

### 2. Mount detail page
```tsx
// app/(dashboard)/[username]/projects/[id]/page.tsx
import { ProjectDetailPage } from "@/components/projects";
export default ProjectDetailPage;
```

### 3. Mount create page
```tsx
// app/(dashboard)/[username]/projects/create/page.tsx
import { CreateProjectPage } from "@/components/projects";
export default CreateProjectPage;
```

### 4. Mount edit page
```tsx
// app/(dashboard)/[username]/projects/[id]/edit/page.tsx
import { EditProjectPage } from "@/components/projects";
export default EditProjectPage;
```

### 5. Mount collaborator page
```tsx
// app/(dashboard)/[username]/projects/[id]/collaborators/page.tsx
import { CollaboratorManagerPage } from "@/components/projects";
export default CollaboratorManagerPage;
```

## Data Flow

```
page.tsx
├── resolves scenario (own/public)
├── fetches from appropriate store
├── renders OwnProjectsView or PublicProjectsView
│   ├── ProjectStatsBar (computed from projectStats)
│   ├── ProjectFilters (local state, triggers refetch)
│   └── ProjectGrid
│       ├── ProjectCard (featured spans 2 cols)
│       │   ├── media gallery preview
│       │   ├── engagement counts
│       │   └── hover actions (owner)
│       └── EmptyProjectsState
│
ProjectDetailView.tsx
├── ProjectHero (media carousel + like/comment actions)
├── Tab: Overview → ProjectInfoGrid (metadata + stack + tags)
├── Tab: Engagement → EngagementSection (likes + comments thread)
├── Tab: Collaborators → CollaboratorList (inline + manage link)
└── Tab: Activity → AuditActivityFeed (owner only)
│
CreateProjectPage.tsx / EditProjectPage.tsx
├── Tab: Basic Info (name, platform, description, dates, stack, tags)
├── Tab: Media (4 upload slots with preview)
└── Tab: Settings (public/private, completed, concept, status)
│
CollaboratorManager.tsx
├── List of collaborators with role badges
├── Add collaborator modal (username, role, permissions)
├── Edit permissions modal
└── Remove confirmation modal
```

## Responsive Behavior

- **Mobile**: Single column cards, stacked tabs, full-width forms
- **Tablet**: 2-column grid, side-by-side forms
- **Desktop**: 3-column bento grid with featured spanning, horizontal tabs

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation for tabs and dialogs
- Focus management in modals
- Color contrast maintained with CSS variables
