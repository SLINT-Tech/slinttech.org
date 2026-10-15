# Contributing to slinttech.org

General guidelines (code of conduct, issues, governance) live in the organisation repository [SLINT-Tech/.github](https://github.com/SLINT-Tech/.github). This file covers how changes reach the live site.

## Branches and environments

| Branch | Deploys to | Purpose |
|---|---|---|
| `testing` | https://delightful-meadow-071a8410f-testing.eastus2.3.azurestaticapps.net | First place every change lands. Try it here. |
| `staging` | https://delightful-meadow-071a8410f-staging.eastus2.3.azurestaticapps.net | Release candidate. Final check before production. |
| `azure-migration` | **https://slinttech.org** (production) | What the public sees. |

**Rule:** every approved feature goes through testing, then staging, before production. No exceptions, including hotfixes.

Every change follows the same path:

```
feature/ST-<n>-<short-slug>  →  testing  →  staging  →  azure-migration
```

- Branch from `testing` and open your pull request into `testing`.
- Promote by opening a pull request from `testing` into `staging`, then from `staging` into `azure-migration`.
- Never push directly to `testing`, `staging` or `azure-migration`. They are protected.
- Each pull request gets its own preview URL from Azure. Note: the live API only accepts requests from `https://slinttech.org`, so logging in does not work on preview, testing or staging URLs until the non-production API exists (ticket ST-A3).

The API (`server/`) deploys to the `slinttech-api` Azure Web App when files under `server/` or its workflow file change on `azure-migration`. It can also be run by hand from the Actions tab.

## Tickets

Work is tracked as tickets with keys like `ST-C2` (the roadmap is kept privately; ask a maintainer for access). Use the ticket key everywhere:

- Branch: `feature/ST-C2-career-covers`
- Commit: `feat(ST-C2): add illustrated career covers`
- Pull request title: `feat(ST-C2): add illustrated career covers`

## Commits and pull requests

- [Conventional Commits](https://www.conventionalcommits.org): `type(ST-<n>): imperative subject`.
- One logical change per commit.
- No AI attribution lines (`Co-Authored-By` an AI tool, "Generated with …"). A CI check rejects them.
- Each pull request says what changed, why, how it was tested and what was not verified.

## Checks on every pull request

- **Required to merge:** **Build** (`npm run build`) and **No AI attribution** (status check `Check commits and description`: commit messages, PR title and description).
- **Reported, not blocking yet:** **Type check** (`tsc -b`) and **lint** (`npm run lint`), because of existing errors (ticket ST-X6). Do not add new ones.
- **Reported:** SonarCloud code analysis.

## Local development

```bash
npm ci
npm run dev
```

Run commands from the project folder itself. Tailwind v4 scans files relative to where Vite starts, so running Vite from another folder produces missing styles.
