# AGENTS.md - Golden Age App

## 1. Project Context

You are working on "Golden Age App".

This is a child growth and development tracking system for parents and healthcare workers.

Core domains:
- Child growth tracking
- Development milestones
- Vaccination records
- Nutrition tracking
- Medical history
- Reminder system
- Family sharing

---

## 2. AI Behavior Rules (STRICT)

- Always think before coding
- Always create a plan before implementation
- Never modify unrelated modules
- Never refactor large areas without explicit instruction
- Always prefer minimal and incremental changes
- Always explain what will be changed before coding
- Always stop after completing a phase
- Do not assume requirements that are not written

---

## 3. Execution Workflow

1. Understand the task
2. Analyze existing codebase
3. Create a step-by-step plan
4. Ask for confirmation if needed
5. Implement ONE phase only
6. Write tests if applicable
7. Stop and wait for next instruction

---

## 4. Architecture Rules

- Use modular feature-based architecture
- Separate layers:
  - UI layer
  - business logic layer
  - API layer
  - data layer
- Use TypeScript strictly
- Avoid tight coupling between modules
- Prefer composition over inheritance
- Use dependency injection where possible

---

## 5. UI / DESIGN SYSTEM RULES

- Use TailwindCSS only
- Mobile-first design
- Use 8px spacing system
- Use predefined color palette only
- Use shared components only:
  - Button
  - Input
  - Card
  - Modal
  - Table
  - Layout components
- Do not create ad-hoc styling
- Do not introduce new UI patterns without approval

Design style:
- clean
- minimal
- calm
- medical + child-friendly

---

## 6. Design Constraints (Golden Age UX)

- Max 3 primary cards per screen
- Always show selected child context at top
- Dashboard must be simple and readable in 3 seconds
- Avoid visual clutter
- Every action must have feedback (loading / toast / error state)

---

## 7. Component Rules

- All UI must use /components/ui
- Reusable components are mandatory
- Never duplicate UI implementations
- Extend existing components instead of creating new ones
- Keep components small and single-purpose
- No inline styling

---

## 8. Feature Development Rules

- Build features in phases
- Never implement full system at once
- Always start from API contract or backend structure
- UI must follow backend structure
- Keep features backward compatible

---

## 9. Testing Rules

- Write unit tests for business logic
- Write integration tests for API endpoints
- Do not skip tests for critical features
- Keep tests simple, deterministic, and maintainable

---

## 10. Safety Rules

- Never expose secrets in code
- Use environment variables for credentials
- Never hardcode API keys, passwords, or tokens
- Do not log sensitive data

---

## 11. Anti-Patterns (STRICTLY FORBIDDEN)

- No inline styles in React
- No random Tailwind usage without reuse
- No duplicated components
- No massive single-file components
- No uncontrolled state logic across files
- No unnecessary abstractions
- No over-engineering

---

## 12. UI Component Guidelines

Standard components:

- Button (primary, secondary, outline, danger)
- Input (with label + error state)
- Card (simple, shadow-sm, rounded-xl)
- Modal (mobile bottom-sheet preferred)
- Table (minimal styling)
- Chart wrapper (for growth data)

Rules:
- Always reuse components
- Never redesign per page
- Keep UI consistent across entire app

---

## 13. Golden Age UI Patterns

- Child Selector (global context switcher)
- Growth Dashboard (weight, height, BMI, percentile)
- Vaccination Timeline (status: done / upcoming / missed)
- Milestone Checklist (grouped by age range)
- Nutrition Tracking (simple daily log)

---

## 14. API & Data Rules

- All API calls must be typed
- Use DTOs for all requests/responses
- Validate all inputs
- Keep API RESTful and consistent
- Avoid mixing business logic in UI layer

---

## 15. Feature Execution Strategy

- Always break work into phases
- Each phase must be independently deployable
- Never combine multiple phases in one implementation
- Stop after completing a phase

Example phases:
- Phase 1: Setup project
- Phase 2: Authentication
- Phase 3: Child management
- Phase 4: Growth tracking
- Phase 5: Vaccination system

---

## 16. Modes of Operation

- PLAN MODE: analyze only, no code changes
- BUILD MODE: implement one phase only
- REVIEW MODE: critique existing implementation

If mode is not specified, always ask first.

---

## 17. Final Rule

Simplicity is more important than complexity.

Prefer working system over perfect architecture.

Never break existing functionality.