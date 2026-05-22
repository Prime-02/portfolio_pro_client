# Portfolio Builder — TODO

---

## 🧱 Architecture (Parent)

This section will eventually compile all portfolio sections into a unified system.

- [ ] Define shared types: `SectionType`, `SectionData`, `PortfolioLayout`
- [ ] Build `PortfolioRenderer` — reads `layout.sections[]` and delegates to section-specific renderers
- [ ] Build `PortfolioEditor` shell — tab-based or accordion-based section editor
- [ ] Standardize save pattern: local state → validate → update portfolio store → PUT to backend
- [ ] Define section registry (map `type` string → renderer component + editor component + schema)

---

## 🦸 Hero Section

### 1. Types & Schema
- [ ] Define `HeroData` interface
  - name, title, description, media (image/lottie/video), cta buttons, layout, background, effects
- [ ] Define `HeroSchema` — metadata about each field (type, label, default, validation, visibility rules)

### 2. Default / Autofill
- [ ] Create `getDefaultHeroData(userProfile)` function — seeds hero from user store once
- [ ] Create `getEmptyHeroData()` — minimal defaults when no user profile available

### 3. Renderer Component (`<HeroRenderer data={heroData} />`)
- [ ] Layouts: centered, split, minimal
- [ ] Background types: solid, gradient, image, video, particles
- [ ] Media display: profile image, Lottie animation, background video
- [ ] CTA buttons: single or multiple, variant support (primary, secondary, outline, ghost)
- [ ] Text effects: typewriter toggle on title
- [ ] Scroll indicator toggle
- [ ] Responsive behavior for all layouts

### 4. Editor Component (`<HeroEditor data={heroData} onChange={fn} />`)
- [ ] Content tab: name, title, description fields
- [ ] Layout tab: layout selector, alignment, height
- [ ] Media tab: media type selector, conditional fields (image upload, Lottie URL)
- [ ] Background tab: background type selector, conditional color/image/video fields, overlay opacity
- [ ] CTA tab: repeater field for buttons (label, url, variant, icon, new tab toggle)
- [ ] Effects tab: typewriter toggle, scroll indicator toggle
- [ ] Real-time preview (side-by-side or toggle)

### 5. Validation
- [ ] Name is required (min 1 char)
- [ ] At least one CTA has a valid URL if buttons are added
- [ ] Image fields have valid URLs or uploaded files
- [ ] Lottie URL is valid JSON endpoint if selected

### 6. Save Integration
- [ ] `handleSave()` — validate local hero data → update `portfolio.layout.sections[].data` → call portfolio store `updatePortfolio()`
- [ ] `handleCancel()` — discard local state, revert to last saved
- [ ] Track dirty state (`hasChanges`) to prompt before navigating away

### 7. Preview
- [ ] Live preview panel inside editor
- [ ] Preview modes: desktop / tablet / mobile toggle

---

## 🔮 Future Sections (for reference)

### Skills Section
- [ ] `SkillsData` interface
- [ ] Category + tag-list structure
- [ ] Display styles: bars, tags, grid, pills

### Experience Section
- [ ] `ExperienceData` interface
- [ ] Timeline entries (role, company, dates, description, tags)
- [ ] Layouts: timeline, cards, list

### Projects Section
- [ ] `ProjectsData` interface
- [ ] Project cards (title, description, image, links, tags)
- [ ] MDX support for rich case studies
- [ ] Layouts: grid, list, masonry
- [ ] Filtering by tag

### Certifications Section
- [ ] `CertificationData` interface
- [ ] Credential cards (title, issuer, date, credential URL, badge image)

### Testimonials Section
- [ ] `TestimonialData` interface
- [ ] Quote cards (text, author, role, company, avatar)
- [ ] MDX support for rich quotes

### Blogs Section
- [ ] MDX-driven post rendering
- [ ] Post metadata (title, date, tags, cover image)
- [ ] RSS-like list layout

---

## 📋 Legend

- `[ ]` — Not started
- `[~]` — In progress
- `[x]` — Done