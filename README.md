# slinttech.org

The official website of **SLINT Tech** — *Selfless Leadership and Innovation for a New Tomorrow*,
a nonprofit in Ghana equipping young people with technical skills, mentorship, and values-driven
leadership.

🌍 **Live site:** [slinttech.org](https://slinttech.org)

## Tech stack

| | |
| --- | --- |
| Framework | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Build tool | [Vite 7](https://vite.dev) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Routing | [React Router 7](https://reactrouter.com) |
| Icons | [Lucide](https://lucide.dev) |
| Linting | [ESLint 9](https://eslint.org) with `typescript-eslint` |

## Running it locally

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
git clone https://github.com/SLINT-Tech/slinttech.org.git
cd slinttech.org
npm install
npm run dev
```

The dev server prints a local URL — open it in your browser. It runs with `--host`, so you can
also open it from your phone on the same network to check responsive layouts.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

## Project structure

```
src/
├── App.tsx           Route definitions and page shell
├── main.tsx          Entry point
├── index.css         Tailwind directives and global styles
├── Components/       Reusable UI pieces
└── Sections/         Page sections (Header, Courses, etc.)
public/               Static assets served as-is — images, fonts
```

## Contributing

New to open source? This is a good place to start — see
[CONTRIBUTING.md](https://github.com/SLINT-Tech/.github/blob/main/CONTRIBUTING.md) for our branch
naming, commit conventions, and review process, and look for issues labelled `good first issue`.

Everyone here follows our
[Code of Conduct](https://github.com/SLINT-Tech/.github/blob/main/CODE_OF_CONDUCT.md).

Before you open a pull request:

```bash
npm run build   # must pass
npm run lint    # keep it clean
```

Never commit `.env` files, API keys, or credentials.

## Security

Found a vulnerability? Do not open a public issue —
follow our [security policy](https://github.com/SLINT-Tech/.github/blob/main/SECURITY.md).

## Licence

[MIT](LICENSE) © Selfless Leadership & Innovation for a New Tomorrow LBG (SLINT Tech)
