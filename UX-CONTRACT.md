# SlintTech product UI contract

The user approved extending the homepage identity to all existing pages. The application is an English-language learning and mentorship community with Mentee, Mentor, and Admin roles. This change preserves API endpoints, membership amounts, signup requirements, authorization checks, account states, and mutation destinations. The current implementation and `src/lib/api.ts` are the available domain evidence; no separate PRD exists.

## Canonical UI map

| Capability      | Canonical owner                                                             | Source of truth                                          | Allowed variants                                                                 | Verification                                              |
| --------------- | --------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Navigation      | `Navigation.tsx`, `RouteSurface.tsx`                                        | Existing route and role definitions                      | Learner, mentor, admin; desktop sidebar and mobile disclosure                    | Browser route matrix, Escape, active links                |
| Select/Listbox  | Native HTML select, shared `app.css` styling                                | Existing option values and API fields                    | Operating-system popup accepted; custom styling applies to the closed field only | Keyboard selection and browser form checks                |
| Date            | Native HTML date/datetime field                                             | Existing task deadline and `toIsoDateTime` serialization | Browser-owned calendar, locale and popup accepted                                | Deadline form inspection                                  |
| Form            | `AppForm.tsx`, `PasswordInput.tsx`, `PasswordSettings.tsx`, `LoginForm.tsx` | Existing handlers and required constraints               | Signup, login, profile; existing modal handlers retained                         | Required-field focus, inline summary, password visibility |
| Scrollbar       | `src/index.css`                                                             | Shared brand tokens                                      | Document and horizontally scrolling table; no hidden product scrollbars          | Narrow viewport overflow review                           |
| Toast           | `Toast.tsx`                                                                 | Existing success and failure messages                    | Success dismisses after a delay; errors persist until dismissed                  | Status/alert role, dismiss button                         |
| Dialog          | `Modal.tsx`                                                                 | Existing modal content, setters, pending state           | Native dialog with authored content; non-dismissable payment verification state  | Focus trapping, Escape, restoration, scroll               |
| Table Selection | Existing enrollment selection in `MentorCourseDetailPage.tsx`               | API-returned eligible mentees and selected IDs           | Individual native checkboxes                                                     | Selection and confirmation inspection                     |
| CRUD            | Existing page handlers plus `src/lib/api.ts`                                | Current API and permission checks                        | Preserve owning list/detail destination and local refresh                        | Isolated browser fixtures; no live writes                 |

## Visual ownership

`src/styles/tokens.css` is the canonical source for palette and type roles. `home.css` aliases these tokens for the approved landing design. `app.css` consumes the same tokens directly and adapts the existing Tailwind surface/text classes. Status colors retain their semantic meaning. Homepage expressive composition stays on marketing/auth surfaces; workspaces use quieter panels, compact navigation, and a shared intro component.

## Interaction and state behavior

- Use links for navigation, buttons for actions, a labeled native select for choices, and named icon controls.
- `AppForm` uses `noValidate`, checks field validity without native popups, keeps entered values, displays a persistent error summary, marks invalid controls and focuses the first invalid field. Existing domain validation remains in the owning handler.
- Passwords stay masked by default and support paste, autofill, and explicit show/hide controls. The existing six-character signup minimum remains unchanged.
- Signup preserves the existing PDF contract requirement, 10 MB maximum and registration/upload sequence. A selected file is not described as uploaded.
- Existing pending/disabled states prevent repeated actions. Success and failure share the notification component; critical auth/payment errors also remain inline.
- Modal opening uses browser focus containment and an inert background. Escape closes a dismissable, idle modal. Busy states and verification overlays do not dismiss. Destructive confirmation initially focuses Cancel. Closing restores the initiating control when it still exists.
- Mobile navigation is an anchored, non-modal disclosure, not a modal drawer. Escape dismisses and restores the trigger. Navigating closes it. Desktop resize removes the mobile open state.
- Role controls, pending account restrictions, and payment boundaries remain enforced by existing route and page logic.
- Tables keep their existing pagination and all row actions. The table wrapper owns horizontal scrolling; the document remains the vertical scroll owner. Do not clip tables to force a mobile fit.
- Date and select popup geometry intentionally belongs to the browser/OS. No new date or listbox library is introduced.
- Theme selection uses the existing `theme` key, shared `useTheme`, and the `.dark` root class. Both homepage and product pages share the palette.

## Search and loading

`SearchInput.tsx` owns search fields, composition-safe input, the clear control and focus restoration. Search stays transient to preserve the existing workspace routing; filters are not added to shareable URLs in this redesign. Admin search retains its existing debounce with immediate clearing and ignores superseded responses. `WorkspaceError.tsx` gives primary learner lists, mentee lists, and submissions an explicit retry state instead of describing a failed request as an empty list.

## Route document title policy

`RouteSurface.tsx` assigns `{Page} — SlintTech` for product routes and `SlintTech` for the homepage. Dynamic details get descriptive resource titles without including private identifiers. The existing ScrollToTop resets document scroll on pathname transitions; query filters do not trigger a reset.

## Route errors and failure recovery

The 404 page offers a home destination and a back action. Existing access-denied handling remains in its owning route. Show API failures as errors rather than success. Mocked browser failures verify the changed visual recovery paths, but are not evidence of live backend operation.

## Verification scope and limits

`scripts/verify-ui.mjs` exercises all route groups using CDP-intercepted fixtures in a local browser. Fixtures exist only in the test process; no demo data or authentication bypass is added to the application. Every API request is intercepted, and test authentication is removed on completion. Tests cover representative populated/empty/error states, auth validation, dialogs, theme, navigation and responsive layouts. Actual payment completion, production email, cloud uploads, and live administrative mutations require backend integration testing and are not performed as part of a visual redesign.
