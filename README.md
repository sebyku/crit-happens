# Crit Happens

A choose-your-own-adventure game with ELIZA-style NPC conversations. Built with React 19 and Vite 8.

## Getting Started

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173/crit-happens/`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## How It Works

Players navigate a branching story defined in YAML. Each step has a description and a set of reactions (choices) that lead to other steps. Some steps trigger conversations with NPCs powered by an ELIZA-style pattern-matching engine — the player types freely and the NPC responds based on keyword rules.

### Characters

Each NPC is built from 3 merged config layers:

- **Generic** — shared conversational rules (greetings, fallback responses)
- **Aggressivity** — personality tone (friendly, hostile, etc.)
- **Specific** — character-unique topics and exit keywords that end the conversation

### Internationalization

The game supports English (`us`) and French (`fr`). Language can be set to `auto` (detects from browser), `fr`, or `us` in `src/data/config.yaml`. All text — story content, UI labels, and NPC dialogue — is externalized in per-language YAML files.
