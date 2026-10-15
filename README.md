# slinttech.org

The website and learning platform of **SLINT Tech** (Selfless Leadership & Innovation for a New Tomorrow), a Ghanaian nonprofit equipping young people with technical skills, mentorship and values-driven leadership.

## Environments

| Environment | URL | Deploys from |
|---|---|---|
| Testing | https://delightful-meadow-071a8410f-testing.eastus2.3.azurestaticapps.net | `testing` |
| Staging | https://delightful-meadow-071a8410f-staging.eastus2.3.azurestaticapps.net | `staging` |
| Production | https://slinttech.org | `azure-migration` |

## The release rule

> **Every approved feature goes through testing, then staging, before it reaches production. No exceptions.**

```
feature/ST-<n>-<short-slug>  →  testing  →  staging  →  azure-migration (production)
```

1. Branch from `testing` and open your pull request into `testing`. Check your change on the testing site.
2. When it works on testing, open a pull request from `testing` into `staging`. Check it again on the staging site.
3. Only then open a pull request from `staging` into `azure-migration`, which deploys to https://slinttech.org.

`testing`, `staging` and `azure-migration` are protected: nobody, including admins, can push to them directly or skip the required checks. Hotfixes follow the same path.

Login does not work on the testing and staging sites: the API accepts browser requests only from the production site.

## Project layout

| Path | What it is | Deploys to |
|---|---|---|
| `/` (`src/`, `public/`) | React + Vite + Tailwind frontend | Azure Static Web Apps |
| `server/` | Node.js + Express + TypeScript API | Azure App Service `slinttech-api` (only when `server/` changes) |

## Getting started

```bash
npm ci
npm run dev
```

Run commands from the project folder itself. Tailwind v4 scans files relative to where Vite starts, so running Vite from another folder produces missing styles.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for branch names, commit format, pull request checks and what every pull request must describe.
