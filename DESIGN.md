---
version: alpha
name: SlintTech
description: A welcoming tech learning community built around ambition, practical skills, and mentorship.
colors:
  primary: "#008080"
  primary-hover: "#006666"
  ink: "#1e2929"
  muted: "#626e6c"
  background: "#f8f8f8"
  surface: "#ffffff"
  soft: "#eaf3f1"
  line: "#dce4e1"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
  body:
    fontFamily: "DM Sans, sans-serif"
  code:
    fontFamily: "ui-monospace, monospace"
rounded:
  control: "8px"
  card: "12px"
  feature: "16px"
spacing:
  page-max: "1240px"
  section: "104px"
  section-mobile: "60px"
components:
  button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
  button-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
  workspace-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  divider:
    backgroundColor: "{colors.line}"
  supporting-panel:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.muted}"
---

# SlintTech design system

## Overview

The public homepage should feel like a place to discover what you could become: a creative learning studio with real human support. Its job is to help prospective learners explore the existing 12 career paths and enter the existing signup flow. English copy, international audience, desktop and mobile browsing. The redesign preserves the established teal brand and existing account workflows.

The signature is a smiling learner framed by a teal architectural arch, oversized Bricolage typography, and small notes about making and mentorship. Career cards use authored code, interface, chart, and infrastructure illustrations. Avoid stock-photo grids, invented testimonials, unsupported employment promises, and simulated live learner activity.

Runtime ownership: `src/styles/tokens.css` owns all shared brand variables. This document mirrors those values. `--home-*` tokens feed the homepage components; no generated theme adapter exists. `src/index.css` owns the shared scrollbar baseline. The user approved extending the same identity to every route. `src/styles/tokens.css` now owns palette and typography values; `home.css` aliases them and `app.css` applies them to product pages. Existing Tailwind content components consume a documented CSS adapter for neutral surfaces and text; semantic status colors remain unchanged. Homepage styles are scoped to `.slint-home` or homepage-specific component classes.

## Colors

Primary teal remains #008080, with #006666 for hover and strong teal surfaces. Light neutral surfaces are #f8f8f8 and #ffffff; soft panels are #eaf3f1. Text uses #1e2929 and #626e6c. Borders use #dce4e1. Decorative illustrations may use muted teal and green tints.

Dark mode maps ink to #f0f5f3, muted to #aabbb6, background to #101a1a, surface to #172323, soft to #1b302e, and borders to #30423e. Text accents become #66d1c7 for contrast; filled brand buttons retain the original teal. The portrait and authored artwork retain their art-directed light surfaces. Focus uses a visible 3px accent outline and 5px offset. Forced-colors mode preserves system borders and focus.

## Typography

Bricolage Grotesque provides a distinctive, approachable display voice. DM Sans supports longer text and navigation. Monospace is reserved for the decorative code preview. Fonts have sans-serif fallbacks. Desktop hero type scales to 76px; section headings to 48px. Mobile hero scales to the viewport and section headings use 36px. Tight display tracking contrasts with small, spaced eyebrow labels. Body copy uses comfortable 1.8–1.85 line height.

## Layout

1240px content width with generous breathing room, 104px desktop section spacing and 60px mobile spacing. The hero pairs copy and portrait; the career grid changes from three to two to one column. Breakpoints: 1100px, 900px, 640px. Header navigation collapses at 900px. Mobile menus are anchored overlays with Escape dismissal and focus restoration. The page scrolls naturally with an offset for its sticky header.

### Product workspaces

Account pages pair a muted teal story panel with a focused form. On narrow screens the story becomes a compact introduction. Signup groups personal details, community preferences and the existing membership contract into three clear sections.

Learner, mentor and admin workspaces share a 232px desktop sidebar, 77px top bar and naturally scrolling content. Navigation becomes a disclosure at 1000px. Dashboards use the same restrained teal welcome panel with role-specific copy and real API-backed metrics. Lists, profiles, tasks, courses and detail pages use shared neutral surfaces, display headings and 13px body/control text. Product buttons use 8px corners; panels use 13–15px corners. Preserve readable, distinct status colors.

Shared product owners: `RouteSurface`, `Navigation`, `AuthLayout`, `LoginForm`, `PasswordInput`, `AppForm`, `PageIntro`, `Modal`, `Toast`, `SearchInput`, `WorkspaceError`, and `useTheme`. Native select/date popup ownership and preserved domain behavior are recorded in `UX-CONTRACT.md`.

## Elevation & Depth

Use borders and tonal changes for structure. Reserve shadows for portrait notes and light card hover feedback. The sticky header uses slight translucency. No ambient flashing, endless marquees, or scroll-dependent hidden content.

## Shapes

8px controls, 12px career cards, 16px larger features. A deliberately asymmetrical portrait arch is the visual exception. Small circles support icons, orbit artwork, and a quiet activity-like decorative dot; no fabricated activity claims.

## Components

Buttons use solid teal for the main conversion, outlines for catalog expansion, and text links for secondary navigation. All destinations use real links; filters and toggles use buttons. Filters expose pressed state and an accessible result count. Show-all is explicit, and switching category resets expansion. Career selection keeps the existing signup destination and makes no promise that a track has been selected in the signup form.

The theme toggle persists the existing `theme` preference. Page entrance and hover motion are restrained and disabled for reduced-motion preferences. Nonprofit program names describe memberships rather than imply endorsements. Contact uses the existing email address. Existing backend endpoints, membership pricing, and payment verification logic remain unchanged. Payment failures now use persistent inline feedback.

## Do's and Don'ts

- Keep the teal brand, readable contrast, original content facts, and working signup links.
- Give each section a role in the visitor's decision: possibility, exploration, support, purpose, contact, invitation.
- Check desktop, mobile, dark mode, keyboard navigation, filter counts, and reduced motion.
- Do not introduce fabricated success statistics, endorsements, testimonials, urgency, or guaranteed outcomes.
- Product pages share the approved palette and typography through `tokens.css`; use the workspace navigation, auth layout, and shared controls rather than duplicating screen-specific variants.
