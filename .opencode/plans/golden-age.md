# Golden Age — Implementation Plan

**Version:** 1.0
**Created:** 19 June 2026
**Status:** Ready for Sprint 0
**Team Size:** 3–4 full-stack engineers
**Total Estimated Duration:** 12–14 weeks (parallelized), 17 weeks (sequential)

---

## Overview

This plan translates the Product Requirement Document, Architecture Design, and Database Design into executable phases. Each phase produces a shippable increment.

### Reference Documents

| Document | Path | Description |
|----------|------|-------------|
| AGENTS.md | `./AGENTS.md` | Project conventions and workflow |
| Product Discovery | (internal) | Vision, personas, features, roadmap |
| PRD | (internal) | Functional/non-functional requirements, user stories |
| Architecture Design | (internal) | System architecture, folder structure, API design, flows |
| Database Design | (internal) | ERD, tables, indexes, relationships |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| API Framework | Hono |
| Frontend | React 18, TypeScript, Vite |
| Database | PostgreSQL 16, Drizzle ORM |
| Cache/Queue | Redis 7, BullMQ |
| File Storage | S3-compatible (MinIO local, AWS S3 prod) |
| Auth | JWT (RS256) + Google OAuth |
| Push | Firebase Cloud Messaging (FCM) |
| Email | AWS SES (Mailpit local) |
| Monorepo | Bun Workspaces |
| Dev Env | Nix + Docker Compose |
| CI/CD | GitHub Actions |
| Lint/Format | Biome |
| Testing | Vitest (unit/integration), React Testing Library, Playwright (E2E) |

---

## Phase 1: Project Foundation

**Duration:** 1 week
**Complexity:** Medium
**Dependencies:** None
**Critical Path:** Yes

### Objectives

- Monorepo with Bun workspaces (`apps/api`, `apps/web`, `packages/shared`)
- Reproducible dev environment via Nix + Docker Compose
- PostgreSQL, Redis, MinIO, Mailpit running in Docker
- TypeScript strict mode across all packages
- Biome linting + formatting pre-commit hooks
- Drizzle ORM with migration framework (no tables yet)
- GitHub Actions CI: lint → typecheck → build
- Shared package with types, schemas, constants, utilities

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|------------|-------------------|
| 1.1 | `bun install` succeeds in all packages | Zero warnings, lockfile committed |
| 1.2 | `bun run dev` starts API (Hono) + Web (Vite) concurrently with HMR | Both services respond on localhost |
| 1.3 | `docker compose up` starts PostgreSQL, Redis, MinIO, Mailpit | `docker compose ps` shows all healthy |
| 1.4 | `bun run db:migrate` runs without error | Empty migration tracked in `drizzle/migrations/` |
| 1.5 | `bun run typecheck` passes in all packages | Zero type errors |
| 1.6 | `bun run lint` passes with Biome config | Zero warnings |
| 1.7 | `bun test` runs and passes (placeholder tests) | Vitest executes, zero failures |
| 1.8 | CI pipeline runs on PRs | Lint → Typecheck → Test → Build all green |

### Key Files Created

```
package.json                    # Workspace root
tsconfig.base.json              # Shared TS config
biome.json                      # Lint/format rules
bun.lock                        # Dependency lock
.env.example                    # Env template
.gitignore

nix/flake.nix                   # Reproducible dev shell
nix/flake.lock

docker/docker-compose.yml       # PostgreSQL 16, Redis 7, MinIO, Mailpit
docker/nginx/nginx.conf         # Reverse proxy (future)

packages/shared/package.json    # @golden-age/shared
packages/shared/tsconfig.json
packages/shared/src/index.ts    # Barrel
packages/shared/src/types/      # API contract types
packages/shared/src/constants/  # Roles, measurement types, countries

apps/api/package.json
apps/api/tsconfig.json
apps/api/src/index.ts           # Server bootstrap
apps/api/src/app.ts             # Hono app factory
apps/api/src/env.ts             # Zod-validated env
apps/api/src/lib/db/            # Drizzle client + connection pool
apps/api/src/lib/redis.ts
apps/api/src/lib/s3.ts
apps/api/src/lib/jwt.ts         # JWT helpers
apps/api/src/lib/hash.ts        # Argon2id wrapper
apps/api/src/lib/errors.ts      # Custom error classes
apps/api/src/lib/email.ts       # Email client (Mailpit/SES)
apps/api/src/middleware/        # request-id, error-handler, cors, logger

apps/web/package.json
apps/web/tsconfig.json
apps/web/vite.config.ts
apps/web/index.html
apps/web/src/main.tsx
apps/web/src/app.tsx            # Router skeleton
apps/web/src/lib/api-client.ts  # Ky wrapper
apps/web/src/lib/query-client.ts # TanStack Query config
apps/web/src/lib/i18n.ts        # i18next setup
apps/web/src/styles/globals.css # Tailwind + design tokens
apps/web/public/manifest.json   # PWA manifest

.github/workflows/ci.yml
```

### Database Changes

None — migration framework only. Migration `0000` creates no tables.

### Tests

| Test | Type | What It Verifies |
|------|------|-----------------|
| `env.test.ts` | Unit | Env schema rejects invalid config |
| `hash.test.ts` | Unit | Hash/verify round-trip |
| `jwt.test.ts` | Unit | Sign/verify/expiry cycle |
| `setup.ts` | Integration | DB + Redis test containers connect |

### Risks

| Risk | Severity | Mitigation |
|------|:--------:|-----------|
| Nix flake breaks on Apple Silicon vs. Intel vs. Linux | High | CI tests all platforms; Docker Compose fallback documented |
| Drizzle ORM + Bun edge cases (prepared statements, pooling) | Medium | Pin Drizzle version; test with `pg` driver directly as fallback |

---

## Phase 2: Authentication & Authorization

**Duration:** 1.5 weeks
**Complexity:** High
**Dependencies:** Phase 1
**Critical Path:** Yes

### Objectives

- Email + password registration with email verification
- Email + password login returning JWT access + refresh token pair
- Google OAuth login
- Refresh token rotation with reuse detection (breach response)
- Password reset flow (forgot → email → reset)
- Account soft-delete with data export option
- RBAC middleware (role-level enforcement)
- Child-level access control middleware (parent, family member, clinician consent)
- Rate limiting on auth endpoints (Redis-backed token bucket)

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|------------|------------------|
| 2.1 | User can register with email + password | Receives verification email; can verify; can login |
| 2.2 | User can login with Google OAuth | Redirects through Google consent; account created/linked; JWT returned |
| 2.3 | Access token expires after 15 min; refresh succeeds | 401 → automatic refresh → retry (transparent to user) |
| 2.4 | Reuse of revoked refresh token revokes entire token family | All active sessions for that user are terminated |
| 2.5 | Password reset completes end-to-end | Forgot → email with link → set new password → login with new password |
| 2.6 | Rate limiting blocks >5 login attempts/min per IP | 429 response with Retry-After header |
| 2.7 | RBAC middleware denies wrong-role access | 403 for parent accessing clinic endpoints and vice versa |
| 2.8 | Session timeout after 30 min idle | Warning toast at 28 min; forced logout at 30 min |
| 2.9 | Account soft-delete removes PII, retains anonymized data | Email confirmation; 30-day grace period; audit log recorded |

### Key API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|:----:|---------|
| `POST` | `/api/v1/auth/register` | None | Email + password registration |
| `POST` | `/api/v1/auth/login` | None | Email + password login |
| `POST` | `/api/v1/auth/login/google` | None | Google OAuth callback |
| `POST` | `/api/v1/auth/refresh` | Refresh Cookie | Rotate refresh token |
| `POST` | `/api/v1/auth/logout` | JWT | Revoke refresh token |
| `POST` | `/api/v1/auth/forgot-password` | None | Send password reset email |
| `POST` | `/api/v1/auth/reset-password` | None | Set new password (with token) |
| `POST` | `/api/v1/auth/verify-email` | None | Verify email with token |
| `GET` | `/api/v1/users/me` | JWT | Get current user profile |
| `PATCH` | `/api/v1/users/me` | JWT | Update profile |
| `DELETE` | `/api/v1/users/me` | JWT | Soft-delete account |
| `POST` | `/api/v1/users/me/export` | JWT | Request full data export |

### Key Frontend Components

```
auth/
├── components/
│   ├── LoginForm.tsx              # Email + password form
│   ├── SignUpForm.tsx             # Registration form with role selector
│   ├── GoogleLoginButton.tsx      # Google OAuth button
│   ├── ForgotPasswordForm.tsx     # Email input → success state
│   ├── ResetPasswordForm.tsx      # New password + confirm
│   ├── OnboardingWizard.tsx       # Steps: role → language → country
│   └── EmailVerificationBanner.tsx # "Check your email" prompt
├── hooks/
│   └── useAuth.ts                 # Auth state + token refresh interceptor
├── store.ts                       # Zustand: user, tokens, isAuthenticated
└── api.ts                         # register, login, loginWithGoogle, refresh, logout, forgot/reset password
```

### Database Migrations

| Migration | Tables |
|-----------|--------|
| `0001_create_users` | `users` (id, email, password_hash, full_name, role, language_preference, country_code, timezone, subscription_tier, email_verified_at, deleted_at, timestamps) |
| `0002_create_refresh_tokens` | `refresh_tokens` (id, user_id FK, token_hash UNIQUE, device_info JSONB, expires_at, revoked_at, revoked_by, created_at) |
| `0003_users_indexes` | `uq_users_email`, `uq_users_phone`, `ix_users_role` |

### Tests

| Test | Type | What It Verifies |
|------|------|-----------------|
| `auth.service.test.ts` | Unit | Registration, login, token refresh, reuse detection, password reset |
| `auth.routes.test.ts` | Integration | Full request/response cycle for all endpoints |
| `auth.middleware.test.ts` | Unit | Valid token passes, expired token fails, malformed token fails |
| `rbac.middleware.test.ts` | Unit | Parent can't access doctor routes, doctor can't access admin routes |
| `LoginForm.test.tsx` | Component | Validation errors, submission, loading state, error display |
| `useAuth.test.ts` | Hook | Token refresh trigger, redirect on 401, logout cleanup |

### Risks

| Risk | Severity | Mitigation |
|------|:--------:|-----------|
| Google OAuth verification takes 4+ weeks | Medium | Email+password is primary path; Google is convenience add-on |
| Argon2id memory pressure on small instances | Low | Tune: memory=19456KB, iterations=2, parallelism=1 (~50ms verify) |
| Password reset link abuse (enumeration) | Medium | Always respond "If email exists, a link was sent" regardless |

---

## Phase 3: Child Profile & Family Sharing

**Duration:** 1.5 weeks
**Complexity:** Medium
**Dependencies:** Phase 2
**Critical Path:** Yes

### Objectives

- Child profile CRUD (name, DOB, gender, birth metrics, gestational age, photo)
- Multi-child support per parent account (switcher UI)
- Child photo upload with S3 storage, WebP conversion, responsive thumbnails
- Corrected age calculation for preterm infants (used by growth module later)
- Family sharing: invite by email, magic link acceptance, role assignment
- Role-based permissions: Admin (full control), Editor (log data), Viewer (read-only)
- Activity feed: who logged what and when
- Invite lifecycle: pending → accepted → active / revoked / expired
- Child access middleware (checks family_members + clinician_patient_links)

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|------------|------------------|
| 3.1 | Create child profile with birth metrics | Validated fields, corrected age computed, photo uploaded, appears in parent's list |
| 3.2 | Edit child profile | Only Admin/Editor can edit; birth metrics editable by Admin only |
| 3.3 | Archive child | Data retained, hidden from active list, recoverable by Admin |
| 3.4 | Switch between multiple children | Switcher shows all active children with photo + name |
| 3.5 | Send family invite | Enter email + select role → invite email sent → pending state in list |
| 3.6 | Accept family invite | Magic link → create account if needed → linked as family member → activity feed updated |
| 3.7 | Remove family member | Admin can remove; removed member loses access immediately |
| 3.8 | View-only member cannot edit | All mutation actions hidden/disabled; API returns 403 if attempted |
| 3.9 | Activity feed shows recent actions | Chronological, with user name, action description, timestamp |

### Key API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|:----:|---------|
| `GET` | `/api/v1/children` | Parent | List user's children |
| `POST` | `/api/v1/children` | Parent | Create child profile |
| `GET` | `/api/v1/children/:childId` | Has access | Get child with latest summary |
| `PATCH` | `/api/v1/children/:childId` | Editor+ | Update child |
| `DELETE` | `/api/v1/children/:childId` | Admin | Archive child |
| `GET` | `/api/v1/children/:childId/summary` | Has access | Dashboard summary |
| `GET` | `/api/v1/children/:childId/family` | Has access | Family members + invites |
| `POST` | `/api/v1/children/:childId/family/invite` | Admin | Send invite |
| `DELETE` | `/api/v1/children/:childId/family/:memberId` | Admin | Remove member |
| `DELETE` | `/api/v1/children/:childId/family/invites/:inviteId` | Admin | Revoke invite |
| `POST` | `/api/v1/family/accept/:token` | JWT | Accept invite |
| `GET` | `/api/v1/children/:childId/activity` | Has access | Activity feed |
| `POST` | `/api/v1/files/upload-url` | JWT | Pre-signed upload URL |
| `POST` | `/api/v1/files/upload` | JWT | Direct multipart upload |

### Key Frontend Components

```
children/
├── components/
│   ├── ChildCard.tsx              # Summary card (photo, name, age, latest stats)
│   ├── ChildSwitcher.tsx          # Dropdown/tab switcher for multi-child
│   ├── ChildForm.tsx              # Create/edit form (DOB, gender, birth metrics, photo)
│   ├── ChildProfile.tsx           # Full profile view
│   └── PhotoUpload.tsx            # Upload with crop preview + progress
└── hooks/
    └── useChildren.ts             # TanStack Query: list, create, update, archive

family/
├── components/
│   ├── FamilyList.tsx             # Active members + pending invites
│   ├── InviteForm.tsx             # Email input + role selector + send
│   └── ActivityFeed.tsx           # Chronological feed with infinite scroll
└── hooks/
    └── useFamily.ts               # TanStack Query: members, invites, activity
```

### Database Migrations

| Migration | Tables |
|-----------|--------|
| `0004_create_children` | `children` (id PK, parent_admin_id FK→users, name, date_of_birth, gender ENUM, photo_url, birth_weight_g, birth_length_cm, birth_head_circumference_cm, gestational_age_weeks, country_code, status ENUM, timestamps) |
| `0005_create_family_members` | `family_members` (id PK, child_id FK, user_id FK nullable, role ENUM, status ENUM, invite_email, invite_token UNIQUE, invite_expires_at, invited_by FK, accepted_at, created_at) |
| `0006_create_activity_logs` | `activity_logs` (id BIGSERIAL, child_id FK, user_id FK, action, entity_type, entity_id, metadata JSONB, created_at) — partitioned by month |
| `0007_children_family_indexes` | `ix_children_parent`, `ix_children_dob_gender`, `ix_children_status`, `uq_family_child_user`, `ix_family_user`, `uq_family_invite_token`, `ix_activity_child_time` |

### Tests

| Test | Type | What It Verifies |
|------|------|-----------------|
| `children.service.test.ts` | Unit | CRUD, corrected age for term/preterm/post-date, photo URL generation |
| `children.routes.test.ts` | Integration | Access control: non-member 403, editor can update, viewer read-only |
| `family.service.test.ts` | Unit | Invite lifecycle: send → accept → active / revoke / expire |
| `family.routes.test.ts` | Integration | Invite acceptance with new vs. existing user |
| `child-access.middleware.test.ts` | Unit | Denies access for non-family, non-clinician users |
| `age.test.ts` (shared) | Unit | Corrected age: term (40w), preterm (32w), post-date (42w) |
| `ChildForm.test.tsx` | Component | Form validation, photo upload, birth metric limits |

### Risks

| Risk | Severity | Mitigation |
|------|:--------:|-----------|
| Invite emails marked as spam | Medium | Warm up SES sending domain; provide shareable link fallback |
| Photo uploads contain EXIF location data | High | Strip EXIF server-side before storage; never store raw uploads |
| Activity log grows to millions of rows | Low | Monthly partitioning from day 1; 24-month retention policy |

---

## Phase 4: Growth Tracking & WHO Charts

**Duration:** 2.5 weeks
**Complexity:** Very High
**Dependencies:** Phase 3
**Critical Path:** Yes

### Objectives

- Log weight (kg), height/length (cm), head circumference (cm) with date and method
- Compute WHO Z-scores and percentiles using the LMS methodology
- Auto-select correct WHO reference data by child's age, gender, and chart type
- Color-coded status: green (≥ -2 SD), yellow (-3 to -2 SD), red (< -3 SD)
- Implausible value detection with soft confirmation dialog
- Interactive growth charts: WFA, HFA, WFH, BMI-for-Age, HC-for-Age
  - WHO percentile curves (3rd, 15th, 50th, 85th, 97th) as background
  - Child's data points overlaid with connecting trend line
  - Zoom, pan, tooltip interaction
  - Chart type switcher
- Measurement history in sortable, filterable table
- Growth summary showing latest percentiles and trends
- Prematurity correction applied until 24 months chronological age
- Chart export as PNG (for sharing) and PDF (for printing)

### Critical: WHO Z-Score Calculation

```
Z-score = ((value/M)^L - 1) / (L * S)    [when L ≠ 0]
Z-score = ln(value/M) / S                [when L = 0]

Where L, M, S are the WHO LMS parameters for:
  - Specific chart type (wfa, hfa, etc.)
  - Specific gender (male, female)
  - Specific age (in days for 0–24 months, in months for 24–60 months)
  - Specific height (for WFH chart only)

Percentile = normal_CDF(z_score) * 100

Source: WHO Multicentre Growth Reference Study Group (2006)
        WHO Child Growth Standards (2007)
```

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|------------|------------------|
| 4.1 | Log weight measurement | Z-score + percentile computed, status color assigned, data point appears on chart |
| 4.2 | Log height with position (supine/standing) | Auto-detects position by age <2yr; stores position in record |
| 4.3 | Log head circumference | Appears on HC-for-age chart |
| 4.4 | Implausible value warning | Weight dropping >1 kg in 2 weeks triggers soft confirmation; still savable if confirmed |
| 4.5 | WFA chart renders with correct WHO curves | Curves match WHO Anthro output for same child; data points correctly placed |
| 4.6 | HFA chart shows height trend | Line connects all height measurements; percentile annotated on latest point |
| 4.7 | Switch between chart types | WFA ↔ HFA ↔ WFH ↔ BMI ↔ HC with no full page reload |
| 4.8 | Preterm baby uses corrected age | 32-week preemie at chronological 6 months shows age=4 months on chart |
| 4.9 | Chart PNG export matches screen render | 2x resolution; legend visible; child data visible but anonymized by default |
| 4.10 | Measurement history table | Sortable by date, filterable by type, inline edit/delete for own entries |
| 4.11 | WHO percentile accuracy validated | 10,000 test vectors against WHO Anthro reference software; 100% match |

### WHO Reference Data Seed

100,000+ rows loaded from WHO-published LMS parameter tables:

| Chart Type | Gender | Age Range | Rows |
|-----------|:------:|-----------|-----:|
| WFA (Weight-for-Age) | Male, Female | 0–60 months (daily 0-24m, monthly 24-60m) | ~1,500 |
| HFA (Height-for-Age) | Male, Female | 0–60 months | ~1,500 |
| WFH (Weight-for-Height) | Male, Female | 45–120 cm (0.5 cm increments) | ~300 |
| HC-for-Age | Male, Female | 0–60 months | ~1,500 |
| BMI-for-Age | Male, Female | 0–60 months | ~1,500 |

### Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/children/:childId/measurements` | List measurements (paginated, `?type=weight&from=2026-01-01`) |
| `POST` | `/api/v1/children/:childId/measurements` | Log measurement → compute Z-score → return percentile |
| `GET` | `/api/v1/children/:childId/measurements/:mid` | Get single measurement |
| `PATCH` | `/api/v1/children/:childId/measurements/:mid` | Edit measurement (recalculates Z-score) |
| `DELETE` | `/api/v1/children/:childId/measurements/:mid` | Delete measurement |
| `GET` | `/api/v1/children/:childId/growth-chart?type=wfa` | Chart-ready data: WHO curve arrays + child data points |
| `GET` | `/api/v1/children/:childId/growth-summary` | Latest percentiles for all types + trend direction |

### Key Frontend Components

```
growth/
├── components/
│   ├── MeasurementForm.tsx         # Type selector, value input, date picker, method selector
│   ├── GrowthChart.tsx             # Canvas-based interactive WHO chart
│   ├── ChartTypeSelector.tsx       # WFA | HFA | WFH | BMI | HC tab bar
│   ├── GrowthChartTooltip.tsx      # Hover tooltip: date, value, percentile, status
│   ├── MeasurementTable.tsx        # Sortable table with swipe-to-delete/edit
│   ├── PercentileBadge.tsx         # Green/yellow/red circle with percentile number
│   ├── ImplausibleWarning.tsx      # "This seems unusual. Is this correct?" dialog
│   ├── GrowthSummary.tsx           # Cards: weight %, height %, next recommended weigh-in
│   ├── ChartLegend.tsx             # WHO percentile curve labels
│   └── ChartDownloadButton.tsx     # Export as PNG or PDF
├── hooks/
│   ├── useGrowth.ts                # TanStack Query: measurements CRUD
│   ├── useGrowthChart.ts           # Transform API data to chart series
│   └── useChartDownload.ts         # html2canvas / PDF generation
└── api.ts
```

### Database Migrations

| Migration | Tables |
|-----------|--------|
| `0008_create_growth_records` | `growth_records` (id PK, child_id FK, type ENUM, value DECIMAL, unit, measurement_date, corrected_age_days, corrected_age_months, measurement_method, position, z_score DECIMAL, percentile DECIMAL, status_color ENUM, is_suspicious BOOL, created_by FK, source ENUM, notes, timestamps) |
| `0009_create_measurement_reference` | `measurement_reference` (id SERIAL, chart_type, gender ENUM, age_months, age_days nullable, height_cm nullable, L DECIMAL, M DECIMAL, S DECIMAL) |
| `0010_seed_who_standards` | Data migration: 100K+ rows from WHO JSON files |
| `0011_growth_indexes` | `ix_growth_child_type_date` (child_id, type, measurement_date DESC), `ix_growth_child_date`, `ix_growth_suspicious`, `uq_who_lookup` (chart_type, gender, age_months, age_days, height_cm) |

### Tests

| Test | Type | What It Verifies |
|------|------|-----------------|
| **`growth.calculator.test.ts`** | Unit | **CRITICAL**: Z-score against 10,000+ WHO Anthro vectors. Tests all chart types, both genders, boundary ages (0, 24, 60 months), edge cases (L=0, extreme values) |
| `growth.service.test.ts` | Unit | Implausible detection, status color mapping, preterm age correction, measurement validation |
| `growth.routes.test.ts` | Integration | CRUD lifecycle, recalculation on edit, chart data format |
| `percentile.test.ts` (shared) | Unit | Z-score ↔ percentile round-trip, standard normal CDF accuracy |
| `MeasurementForm.test.tsx` | Component | Unit conversion (g/kg), date validation, auto-position by age |
| `GrowthChart.test.tsx` | Component | Chart renders curve lines, data points, tooltip on hover |

### Risks

| Risk | Severity | Mitigation |
|------|:--------:|-----------|
| **Z-score calculation drifts from WHO Anthro** | Critical | 10K-vector test suite against WHO Anthro reference output; pediatrician review before release |
| Growth chart rendering slow on 2GB RAM phones | High | Canvas-based (not SVG), data point limit (max 200 per chart), debounced zoom/pan, WebGL fallback |
| LMS interpolation between WHO age points produces artifacts | High | Linear interpolation validated at 0.1-month increments; flag outliers for manual review |
| Parents panic over yellow/red indicators | Medium | Green copy: reassuring ("on track"), Yellow: informative ("discuss with doctor"), Red: urgent but calm ("schedule check-up soon"). Always show "not a diagnosis" disclaimer |

---

## Phase 5: Developmental Milestones

**Duration:** 1.5 weeks
**Complexity:** Medium
**Dependencies:** Phase 3
**Critical Path:** No (can parallel with Phase 6)

### Objectives

- Master milestone catalog: 100+ milestones across 5 domains (gross motor, fine motor, language, cognitive, social-emotional)
- Age-appropriate checklist per child (shows only milestones relevant to child's current age ± 2 months)
- Manual check-off with achievement date + optional photo
- Missed milestone detection: if child passes `expected_age_max_months` without achievement → red flag
- Milestone timeline: chronological view of all achievements
- Milestone achievement push notification ("Your 4-month-old may start reaching for objects")

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|------------|------------------|
| 5.1 | Age-appropriate checklist displays | Only milestones where child_age is between min-2 and max+2 months |
| 5.2 | Check off milestone | Toggles achieved/unachieved; date recorded; appears on timeline |
| 5.3 | Missed milestone flagged | Banner: "[Milestone] hasn't been achieved yet. Discuss with your pediatrician." |
| 5.4 | Attach photo to milestone | Upload → thumbnail on timeline; full-size in detail view |
| 5.5 | Timeline view | Chronological, grouped by month, with category color coding |
| 5.6 | Red flag milestones highlighted | Milestones with `red_flag=true` have prominent warning styling |

### Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/children/:childId/milestones` | Checklist with achievement status per milestone |
| `POST` | `/api/v1/children/:childId/milestones/:milestoneId/achieve` | Mark achieved |
| `DELETE` | `/api/v1/children/:childId/milestones/:milestoneId/achieve` | Undo |
| `POST` | `/api/v1/children/:childId/milestones/:milestoneId/photo` | Attach photo |

### Key Frontend Components

```
milestones/
├── components/
│   ├── MilestoneChecklist.tsx      # Categorized checklist with checkboxes
│   ├── MilestoneCategoryTabs.tsx   # Motor | Language | Cognitive | Social tabs
│   ├── MilestoneTimeline.tsx       # Chronological achievement timeline
│   ├── MilestoneCard.tsx           # Single milestone: title, description, age range, check
│   ├── MilestonePhotoUpload.tsx    # Attach photo to achievement
│   ├── RedFlagBanner.tsx           # Missed milestone warning
│   └── AgeProgressBar.tsx          # Visual age indicator on checklist
├── hooks/
│   └── useMilestones.ts
└── api.ts
```

### Database Migrations

| Migration | Tables |
|-----------|--------|
| `0012_create_milestone_categories` | `milestone_categories` (id PK, name VARCHAR UNIQUE, display_name, sort_order) |
| `0013_create_milestones` | `milestones` (id PK, category_id FK, title, description, expected_age_min_months, expected_age_max_months, screening_tool nullable, red_flag BOOL, sort_order) |
| `0014_create_milestone_records` | `milestone_records` (id PK, child_id FK, milestone_id FK, achieved BOOL, achieved_date, photo_url nullable, created_by FK, created_at) |
| `0015_seed_milestones` | Data migration: 100+ milestones across 5 categories |
| `0016_milestone_indexes` | `uq_milestone_record` (child_id, milestone_id), `ix_milestone_category`, `ix_milestone_age_range`, `ix_milestone_record_child` |

### Tests

| Test | Type | Coverage |
|------|------|----------|
| `milestones.service.test.ts` | Unit | Age filtering, missed detection, achievement/unachievement |
| `milestones.routes.test.ts` | Integration | All endpoints |
| `MilestoneChecklist.test.tsx` | Component | Correct milestones by age, check interaction |

---

## Phase 6: Vaccination Management

**Duration:** 1.5 weeks
**Complexity:** Medium
**Dependencies:** Phase 3
**Critical Path:** No (can parallel with Phase 5)

### Objectives

- Master vaccine schedules for 5 countries (ID, IN, PH, US, UK) based on WHO + national programs
- Auto-generate vaccination records when child is created (triggered by `children.country_code`)
- Mark doses as completed with date, brand, batch number, clinician
- Vaccination progress bar (% complete) and next-due indicator
- AEFI reporting with severity, symptoms, date
- Digital vaccination certificate (printable view + PDF export)
- Catch-up scheduling for missed doses
- Auto-status transition: `pending` → `missed` after `max_age_days` passes

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|------------|------------------|
| 6.1 | Vaccine schedule auto-created for child | 20–30 vaccination records generated on child creation based on country |
| 6.2 | Mark dose as completed | Date, brand, batch stored; progress bar updates; activity logged |
| 6.3 | Cannot complete dose before minimum age | API returns 422 with "Child too young for this vaccine" |
| 6.4 | Undo completion | Confirmation dialog; reverts to pending; activity logged |
| 6.5 | AEFI report | Date, symptoms, severity stored; viewable in child's record |
| 6.6 | Vaccine certificate view | All completed doses with dates; print-friendly layout |
| 6.7 | Progress indicator | "7 of 14 doses completed (50%)" with visual progress bar |
| 6.8 | Missed dose auto-detection | Scheduled job marks as missed 1 day after max_age_days |

### Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/children/:childId/vaccines` | Vaccine list with statuses, sorted by recommended age |
| `GET` | `/api/v1/children/:childId/vaccines/:recordId` | Single dose detail |
| `POST` | `/api/v1/children/:childId/vaccines/:recordId/complete` | Mark as completed |
| `DELETE` | `/api/v1/children/:childId/vaccines/:recordId/complete` | Undo completion |
| `POST` | `/api/v1/children/:childId/vaccines/:recordId/aefi` | Report AEFI |
| `GET` | `/api/v1/vaccine-schedules?country=ID` | Master schedule for reference |

### Key Frontend Components

```
vaccines/
├── components/
│   ├── VaccineList.tsx             # Age-ordered list with status badges
│   ├── VaccineCard.tsx             # Single dose: name, dose #, due date, status
│   ├── VaccineDetail.tsx           # Modal: description, prevents, side effects info
│   ├── VaccineCompleteForm.tsx     # Date, brand, batch, clinician fields
│   ├── AEFIForm.tsx                # Symptoms checklist, severity, date
│   ├── VaccineProgress.tsx         # Progress bar + "Next: DPT-3 on June 30"
│   └── VaccineCertificate.tsx      # Printable certificate view
├── hooks/
│   └── useVaccines.ts
└── api.ts
```

### Database Migrations

| Migration | Tables |
|-----------|--------|
| `0017_create_vaccine_schedules` | `vaccine_schedules` (id PK, country_code, vaccine_name, dose_number, min_age_days, recommended_age_days, max_age_days nullable, description, prevents TEXT[], sort_order) |
| `0018_create_vaccination_records` | `vaccination_records` (id PK, child_id FK, vaccine_schedule_id FK, status ENUM, administered_date nullable, brand_name nullable, batch_number nullable, administering_clinician nullable, clinic_name nullable, aefi_reported BOOL, aefi_details JSONB nullable, created_by FK, timestamps) |
| `0019_seed_vaccine_schedules` | Data: WHO + 5 national schedules |
| `0020_child_vaccine_trigger` | PostgreSQL function: on INSERT into `children`, auto-insert pending vaccination_records for matching country_code |
| `0021_vaccine_indexes` | `uq_vaccine_schedule` (country, name, dose), `uq_vaccination_child_dose` (child_id, schedule_id), `ix_vaccination_child_status`, `ix_vaccine_schedule_country` |

### Tests

| Test | Type | Coverage |
|------|------|----------|
| `vaccines.service.test.ts` | Unit | Schedule generation, age validation, AEFI recording |
| `vaccines.routes.test.ts` | Integration | Full lifecycle |
| `vaccine_trigger.test.ts` | DB Unit | Child insert triggers vaccination record creation |
| `VaccineList.test.tsx` | Component | Sorting, status badges, due date display |

---

## Phase 7: Notifications & Reminders

**Duration:** 2 weeks
**Complexity:** High
**Dependencies:** Phases 2, 3, 4, 5, 6
**Critical Path:** Yes (after Phase 6)

### Objectives

- Push notification infrastructure (FCM + Service Worker event handler)
- Email notification system (AWS SES with pre-approved templates)
- Reminder system: CRUD for user-created reminders, system-generated reminders
- Scheduled job: hourly vaccine due-date check + notification dispatch
- Milestone age-based notifications ("Your baby is 4 months old!")
- Notification preference center (per-channel toggles, quiet hours, disabled types)
- BullMQ workers for async notification dispatch
- Notification delivery tracking (sent → delivered → failed → opened)
- Deduplication: never send the same reminder twice within 24 hours

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|------------|------------------|
| 7.1 | Push notification received for upcoming vaccine | 7 days before and 1 day before due date; tap opens vaccine page |
| 7.2 | Email fallback when push disabled | User who opted out of push receives email 7 days before vaccine |
| 7.3 | Custom reminder created and fired | User sets "Vitamin D drops at 8 AM" → notification at set time |
| 7.4 | Notification preferences honored | Toggle push OFF → no push sent; quiet hours 22:00-06:00 → delayed until 06:00 |
| 7.5 | Deduplication prevents double-send | Same reminder not sent twice even if scheduler runs multiple times |
| 7.6 | Snooze reminder for 1h/3h/1d | Reminder reappears after snooze period |
| 7.7 | In-app notification center | Bell icon shows unread count; list of all past notifications |
| 7.8 | Handle FCM token expiration | Stale tokens removed; new token registered on each app open |

### Notification Types

| Type | Trigger | Channel | Content |
|------|---------|---------|---------|
| `vaccine_reminder_7d` | 7 days before `recommended_age_days` | Push + Email | "[Child]'s [Vaccine] is due in 7 days. Schedule now." |
| `vaccine_reminder_1d` | 1 day before `recommended_age_days` | Push + Email | "[Child]'s [Vaccine] is due tomorrow." |
| `vaccine_missed` | 1 day after `max_age_days` | Push + Email | "[Child] missed [Vaccine]. Catch up soon." |
| `milestone_checkin` | Child reaches milestone age windows | Push | "Your 4-month-old may start reaching. Check milestones." |
| `growth_alert` | Measurement crosses yellow/red | Push + Email | "[Child]'s weight dropped to 10th percentile. Schedule check-up." |
| `weekly_guide` | Every Monday for child <12 months | Push | "Your 6-month-old: What to expect this week." |
| `family_activity` | Family member logs data | Push | "[Mom] logged a new weight for [Child]." |
| `custom_reminder` | User-defined date/time | User's choice | Custom text |

### BullMQ Architecture

```
Scheduler (Cron — every 60 min):
  1. Group active users by timezone
  2. For each timezone at their 08:00:
     a. SELECT pending vaccination_records
     b. Calculate days_until_recommended
     c. If == 7: enqueue vaccine_reminder_7d
     d. If == 1: enqueue vaccine_reminder_1d
     e. If < 0 and no previous reminder: enqueue vaccine_missed
  3. Dedup: check notification_logs for same (user, type, entity_id) in past 24h

Worker (Push):
  1. Pickup job from queue
  2. Lookup user's FCM tokens
  3. Construct FCM message with data payload
  4. Send via FCM HTTP v1 API
  5. Log result (success/failure/bounce)
  6. On NotRegistered → delete token

Worker (Email):
  1. Pickup job from queue
  2. Render SES template with variables
  3. Send via SES SendTemplatedEmail
  4. Log message_id
  5. SNS bounce/complaint webhook → Lambda → update notification_logs
```

### Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/reminders` | List user's reminders |
| `POST` | `/api/v1/reminders` | Create custom reminder |
| `PATCH` | `/api/v1/reminders/:id` | Update reminder |
| `DELETE` | `/api/v1/reminders/:id` | Delete reminder |
| `POST` | `/api/v1/reminders/:id/snooze` | Snooze (1h, 3h, 1d) |
| `POST` | `/api/v1/reminders/:id/dismiss` | Dismiss permanently |
| `GET` | `/api/v1/notifications/preferences` | Get preferences |
| `PATCH` | `/api/v1/notifications/preferences` | Update preferences |
| `POST` | `/api/v1/notifications/push-token` | Register FCM token |
| `DELETE` | `/api/v1/notifications/push-token/:token` | Remove token |

### Key Frontend Components

```
notifications/
├── components/
│   ├── NotificationPreferences.tsx  # Channel toggles, quiet hours, disabled types
│   ├── ReminderList.tsx             # Active reminders with snooze/dismiss
│   ├── ReminderForm.tsx             # Create/edit: title, description, date, remind_before
│   ├── NotificationBell.tsx         # Bell icon + unread count badge
│   ├── NotificationCenter.tsx       # In-app notification history
│   └── PushPermissionPrompt.tsx     # Soft prompt to enable push notifications
├── hooks/
│   ├── usePushNotifications.ts      # FCM token + Service Worker + permission
│   └── useReminders.ts
└── api.ts
```

### Database Migrations

| Migration | Tables |
|-----------|--------|
| `0022_create_reminders` | `reminders` (id PK, user_id FK, child_id FK nullable, type ENUM, title, description, due_date, remind_before_days INT[], status ENUM, channel ENUM, reference_entity_type, reference_entity_id, timestamps) |
| `0023_create_notification_logs` | `notification_logs` (id BIGSERIAL, user_id FK, notification_type, title, body, channel ENUM, reference_entity_type, reference_entity_id, status ENUM, error_message, external_id, sent_at, delivered_at, opened_at, created_at) |
| `0024_create_push_tokens` | `user_push_tokens` (id PK, user_id FK, fcm_token UNIQUE, platform, device_id, created_at) |
| `0025_notification_indexes` | `ix_reminders_user_status`, `ix_reminders_user_due`, `ix_notif_user_time`, `ix_notif_dedup` |

### Tests

| Test | Type | Coverage |
|------|------|----------|
| `reminders.service.test.ts` | Unit | CRUD, snooze, dismissal |
| `vaccine-reminders.job.test.ts` | Unit | Due-date calc, dedup logic, timezone grouping |
| `push.worker.test.ts` | Unit | FCM message, error handling, token cleanup |
| `email.worker.test.ts` | Unit | SES template, bounce/complaint handling |
| `NotificationPreferences.test.tsx` | Component | Toggle interaction, save, reload |

### Risks

| Risk | Severity | Mitigation |
|------|:--------:|-----------|
| Push permission denied by majority of users | Medium | Soft prompt after meaningful action (first vaccine view); email fallback always available |
| Timezone grouping creates complexity | Medium | Store user timezone at registration; run batch per timezone; test DST transitions |
| FCM token rotation causes delivery failures | Low | Re-register token on each app open; handle NotRegistered errors immediately |
| BullMQ job backlog at peak (50K notifications at 08:00) | Medium | Rate limit per queue (50 concurrent); prioritize P0 (vaccine); batch send where possible |

---

## Phase 8: Parent Dashboard & Navigation

**Duration:** 2 weeks
**Complexity:** Medium
**Dependencies:** Phases 3, 4, 5, 6
**Critical Path:** Yes

### Objectives

- Parent home dashboard with multi-child summary cards
- At-a-glance health status per child (latest weight %, next vaccine, missed milestones)
- Color-coded quick indicators (green/yellow/red dots on child cards)
- Upcoming actions prioritized list (most urgent first)
- Age-gated educational content cards ("Your 6-month-old: Starting Solids")
- Quick-add floating action button for measurement logging
- Activity feed widget showing recent family actions
- Bottom tab navigation bar (Home, Education, Quick Add, Reminders, Settings)
- Empty states with guided onboarding for new users
- PWA install prompt and offline indicator

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|------------|------------------|
| 8.1 | Home dashboard shows all children | Each card: photo, name, age, latest weight %, next vaccine due, status dot |
| 8.2 | Status color indicators accurate | Green (all normal), Yellow (any metric at-risk), Red (any metric severe) |
| 8.3 | Upcoming actions prioritized | Vaccine due this week > missed milestone > check-up overdue > routine weigh-in |
| 8.4 | Educational cards age-relevant | 6-month-old sees solid food articles; 1-year-old sees toddler content |
| 8.5 | Quick-add FAB opens measurement form | Pre-selects the most recently viewed child |
| 8.6 | Bottom tab navigation works | 5 tabs: Home, Education, Quick Add (+), Reminders, Settings |
| 8.7 | Empty state for new users | Guided checklist: "1. Add your child → 2. Log first weight → 3. Check vaccines" |
| 8.8 | PWA installable | Manifest valid; service worker registers; "Add to Home Screen" prompt |
| 8.9 | Offline indicator | Banner at top: "You're offline. Data will sync when connected." |

### Key Frontend Components

```
dashboard/
├── components/
│   ├── ChildSummaryCard.tsx        # Photo, name, age, weight %, vaccine status, status dot
│   ├── HealthStatusIndicator.tsx   # Green/yellow/red circle with tooltip
│   ├── UpcomingActions.tsx         # Prioritized to-do list with CTAs
│   ├── EducationCard.tsx           # Article card with cover image + category tag
│   ├── ActivityFeedWidget.tsx      # Last 5 actions with relative timestamps
│   ├── QuickAddButton.tsx          # FAB with measurement type options
│   └── EmptyDashboardGuide.tsx     # Onboarding checklist for new parents

layout/
├── AppShell.tsx                    # Shell: header + bottom tab bar + content area
├── BottomTabBar.tsx                # 5 tabs with icons + labels
└── OfflineBanner.tsx               # Connectivity status banner
```

### API Endpoints (new/modified)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/children/:childId/summary` | Expanded: latest 3 measurements, next 3 vaccines, upcoming milestones, status flags |
| `GET` | `/api/v1/children/:childId/activity` | Activity feed (pagination, last 20) |
| `GET` | `/api/v1/content/articles?age_months=6` | Age-gated articles for dashboard cards |
| `GET` | `/api/v1/content/weekly-card?age_months=6` | "Your baby this week" curated content |

### Database Changes

No new tables. Possible performance optimization: Redis cache for dashboard summary with 5-minute TTL and write-through invalidation on measurement/vaccine/milestone changes.

### Tests

| Test | Type | Coverage |
|------|------|----------|
| `home.test.tsx` | Integration | Multi-child rendering, empty state, error state, offline state |
| `ChildSummaryCard.test.tsx` | Component | All status variations, no-data state |
| `UpcomingActions.test.tsx` | Component | Priority ordering, empty state, CTA interaction |

---

## Phase 9: Reports & Data Export

**Duration:** 2 weeks
**Complexity:** Medium-High
**Dependencies:** Phases 4, 5, 6
**Critical Path:** No (parallel with Phase 8)

### Objectives

- Child health summary PDF export (for doctor referrals)
- Growth chart PDF/PNG export (print-optimized)
- Digital vaccination certificate PDF
- Full data export for GDPR compliance (JSON, async generation)
- Clinician patient summary export
- Midwife monthly Posyandu aggregate report
- Print-optimized CSS and layouts

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|------------|------------------|
| 9.1 | Health summary PDF | Includes: growth charts, vaccine status, milestone summary, medical history; PDF downloads |
| 9.2 | Growth chart export PNG | 2x resolution; matches screen render; download button per chart |
| 9.3 | Vaccine certificate PDF | All completed doses in table; child name + DOB; "unofficial" disclaimer |
| 9.4 | GDPR data export | All child's data in JSON format; request → process async → email when ready → download link (expires 7 days) |
| 9.5 | Chart print preview | Print-optimized layout with higher resolution curves |

### Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/children/:childId/reports/health-summary` | Generate PDF |
| `POST` | `/api/v1/children/:childId/reports/growth-chart?type=wfa` | Chart export |
| `POST` | `/api/v1/children/:childId/reports/vaccine-certificate` | Vaccine certificate PDF |
| `POST` | `/api/v1/users/me/export` | Async GDPR export |
| `GET` | `/api/v1/users/me/export/:exportId/status` | Check status |
| `GET` | `/api/v1/users/me/export/:exportId/download` | Download completed export |

### Key Frontend Components

```
reports/
├── components/
│   ├── ExportButton.tsx            # Trigger dropdown: "Export as PDF" / "Export as PNG"
│   ├── ExportOptionsModal.tsx      # Select chart type, date range, format
│   └── DataExportRequest.tsx       # GDPR: "Request all your data" button + status tracker
├── hooks/
│   └── useExport.ts
└── api.ts
```

### Database Migrations

| Migration | Tables |
|-----------|--------|
| `0026_create_data_exports` | `data_exports` (id PK, user_id FK, type, status ENUM, file_url, expires_at, created_at) |

### Tests

| Test | Type | Coverage |
|------|------|----------|
| `reports.service.test.ts` | Unit | PDF generation, template data population |
| `reports.routes.test.ts` | Integration | Request → async process → status check → download |
| `data-export.worker.test.ts` | Unit | Large export chunking, error recovery |

### Risks

| Risk | Severity | Mitigation |
|------|:--------:|-----------|
| PDF generation CPU-intensive | Medium | Offload to BullMQ worker; non-blocking for API |
| Large exports (>5 years of data) timeout | Low | Chunk generation; 30-min timeout; partial export fallback |
| Vaccine certificate could be misused as official document | Medium | Watermark: "Unofficial record"; QR code to live verification page (future) |

---

## Phase 10: Educational Content & Localization

**Duration:** 1.5 weeks
**Complexity:** Low-Medium
**Dependencies:** Phase 3
**Critical Path:** No

### Objectives

- Article CRUD for content management (admin)
- Age-gated article display on dashboard and education tab
- Full-text search across articles (PostgreSQL FTS)
- Article categories (Growth, Development, Nutrition, Vaccination, Safety, Parenting)
- Multi-language content support (English + Bahasa Indonesia at MVP)
- "This week, your baby..." weekly guide cards
- Bookmark/save articles for later reading (future)

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|------------|------------------|
| 10.1 | Articles displayed by age relevance | Child age 6mo → shows articles tagged [4mo–8mo] |
| 10.2 | Search articles | Search "teething" → returns relevant articles ranked by relevance |
| 10.3 | Article detail view | Rich text rendered; estimated reading time; author + reviewer credits |
| 10.4 | Category browsing | Tabs: All / Growth / Development / Nutrition / Vaccination / Safety / Parenting |
| 10.5 | Weekly guide card | "Your 6-month-old this week: [Title]. [Brief summary]. Read more →" |
| 10.6 | Language toggle | Switch EN ↔ ID; content loads in selected language if available |
| 10.7 | Admin article management | Create/edit/publish/unpublish articles (system_admin only) |

### Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/content/articles?age_months=6&category=nutrition` | Age-gated articles |
| `GET` | `/api/v1/content/articles/:id` | Article detail |
| `GET` | `/api/v1/content/search?q=teething` | Full-text search |
| `GET` | `/api/v1/content/weekly-card?age_months=6` | Weekly guide |
| `GET` | `/api/v1/content/categories` | Category list |
| `POST` | `/api/v1/admin/content/articles` | Create article |
| `PUT` | `/api/v1/admin/content/articles/:id` | Update article |
| `DELETE` | `/api/v1/admin/content/articles/:id` | Delete article |

### Key Frontend Components

```
education/
├── components/
│   ├── ArticleList.tsx             # Card grid with category filters
│   ├── ArticleCard.tsx             # Cover image, title, summary, reading time
│   ├── ArticleDetail.tsx           # Full article view, related articles
│   ├── ArticleSearch.tsx           # Search bar + results list
│   ├── CategoryTabs.tsx            # Horizontal category scroll/tabs
│   └── WeeklyGuideCard.tsx         # "Your baby this week" highlight
└── hooks/
    └── useContent.ts
```

### Database Migrations

| Migration | Tables |
|-----------|--------|
| `0027_create_article_categories` | `article_categories` (id PK, name, slug UNIQUE, description, sort_order) |
| `0028_create_articles` | `articles` (id PK, title, slug, body TEXT, summary, cover_image_url, category_id FK, age_min_months, age_max_months, locale, reading_time_minutes, author_name, reviewed_by, published_at nullable, timestamps) |
| `0029_seed_articles` | Data: 20+ articles in EN + ID across categories |
| `0030_article_indexes` | `uq_articles_slug` (slug, locale), `ix_articles_age_locale`, `ix_articles_search` (GIN on tsvector) |

### Tests

| Test | Type | Coverage |
|------|------|----------|
| `content.service.test.ts` | Unit | Age filtering, search ranking, locale fallback |
| `content.routes.test.ts` | Integration | All endpoints |
| `ArticleList.test.tsx` | Component | Loading, empty, error states; category filtering |

---

## Timeline & Team Allocation

```
Week:  1    2    3    4    5    6    7    8    9   10   11   12   13   14
       ├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
P1:    ████
P2:         ██████
P3:               ██████
P4:                     ██████████
P5:                           ██████       (parallel)
P6:                           ██████       (parallel)
P7:                                     ████████
P8:                                             ████████
P9:                                             ████████
P10:                                                     ██████
```

### Team Allocation

**Engineer A (Critical Path Lead):**
- Phase 1 → 2 → 3 → 4 (with help) → 8

**Engineer B (Domain Features):**
- Phase 1 → 2 → 3 → 5 → 6 → 7 → 10

**Engineer C (Infrastructure + Growth Focus):**
- Phase 1 → 2 → 3 → 4 (co-lead) → 7 (workers) → 9

### MVP Cut Line

An MVP is shippable after Phase 8 (Parent Dashboard). The MVP includes:
- Authentication (email + Google)
- Child profile + family sharing
- Growth tracking with interactive WHO charts
- Developmental milestone checklists
- Vaccination tracking with progress
- Push/email notifications and reminders
- Parent dashboard with multi-child support
- Static educational articles

**Post-MVP (v1.1):**
- Phase 9: Reports & exports
- Phase 10: Enhanced content + localization
- Nutrition module (deferred from full plan)
- Clinic/midwife dashboard (separate workstream)

---

## Appendix A: Testing Standards

### Coverage Requirements

| Layer | Minimum Coverage | Focus |
|-------|:----------------:|-------|
| Shared utilities | 95% | Corrected age, percentile conversion, WHO formulas |
| API services | 90% | Business logic, validation, edge cases |
| API routes | 80% | Request/response cycles, auth, error paths |
| Middleware | 95% | Auth, RBAC, rate limiting, error handling |
| Frontend components | 75% | Rendering, user interaction, error states |
| E2E | Happy paths only | Login → create child → log measurement → view chart |

### Test Data Policy

- Never use real patient data in tests
- All test fixtures are procedurally generated or use known-public test vectors
- WHO test vectors from the official WHO Anthro validation suite
- Email addresses use `@test.goldenage.local` domain

---

## Appendix B: Definition of Done

A phase is complete when:

1. All deliverables meet acceptance criteria
2. Unit + integration tests pass with required coverage
3. Migration scripts run successfully (`up` and `down`)
4. API endpoints documented (OpenAPI spec generated from Hono routes)
5. Code reviewed by at least one other engineer
6. Manual QA on staging environment for user-facing changes
7. No critical or high-severity lint warnings
8. CI pipeline green on `main` branch
9. Performance: API p95 latency < 500ms for all new endpoints
10. Accessibility: New components pass WCAG 2.1 AA automated checks

---

## Appendix C: Environment Configuration

| Variable | Purpose | Default (Dev) | Production |
|----------|---------|:----:|:----:|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://postgres:postgres@localhost:5432/golden_age` | Secret |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` | Secret |
| `S3_ENDPOINT` | S3-compatible endpoint | `http://localhost:9000` | `https://s3.amazonaws.com` |
| `S3_BUCKET` | File storage bucket | `golden-age-dev` | `golden-age-prod` |
| `S3_ACCESS_KEY` | S3 access key | `minioadmin` | Secret |
| `S3_SECRET_KEY` | S3 secret key | `minioadmin` | Secret |
| `JWT_PRIVATE_KEY` | RS256 private key PEM | Local generated | Secret (KMS) |
| `JWT_PUBLIC_KEY` | RS256 public key PEM | Local generated | Secret (KMS) |
| `GOOGLE_CLIENT_ID` | Google OAuth client | — | Secret |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | — | Secret |
| `FCM_SERVICE_ACCOUNT` | Firebase service account JSON | — | Secret |
| `SES_FROM_ADDRESS` | Sender email address | `noreply@localhost` | `noreply@goldenage.app` |
| `APP_URL` | Frontend URL | `http://localhost:5173` | `https://app.goldenage.app` |
| `API_URL` | API URL | `http://localhost:3000` | `https://api.goldenage.app` |

---


WHO DATA REQUIREMENT:

Do not hardcode random percentile values.

Use official WHO growth standard datasets.

Store WHO reference data separately from child measurements.

Design the system so WHO datasets can be updated independently.

*This plan is a living document. Update it as phases are completed, new risks are discovered, and scope changes.*


