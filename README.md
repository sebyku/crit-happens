# Crit Happens

A choose-your-own-adventure game with ELIZA-style NPC conversations, D20 combat, and equipment. Built with React 19 and Vite 8.

## Play

**[Play online](https://sebyku.github.io/crit-happens/)**

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

Players explore a village, a dark forest, underground dungeons, and an abandoned mine. Each location has NPCs to talk to, items to buy, and monsters to fight.

### Conversations

NPCs use an ELIZA-style pattern-matching engine. The player types freely and the NPC responds based on keyword rules. Some NPCs sell items (with confirmation), others steal your gold, and insulting certain NPCs triggers combat.

### Combat

D20-based combat system. Roll a d20 each turn — critical hits on 20, fumbles on 1. Players can attack, flee, or use combat items (holy water, healing potions). Equipment (sword, shield, helmet, armor) affects attack and armor class.

### Characters

Each NPC is built from 3 merged config layers:
- **Generic** — shared conversational rules
- **Aggressivity** — personality tone (friendly or hostile)
- **Specific** — character-unique topics, shops, and exit conditions

### Internationalization

The game supports English and French. Language can be switched at any time via the settings gear (⚙) without losing progress.

### Save System

Game progress is automatically saved to localStorage and restored on page reload.

## License

CC BY-NC-SA 4.0 — See [LICENSE](LICENSE) for details.
