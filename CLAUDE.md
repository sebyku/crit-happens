# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Crit Happens" is a choose-your-own-adventure game built with React 19 and Vite 8. Players navigate branching story steps, have ELIZA-style conversations with NPCs, buy equipment, and fight monsters with D20 combat.

## Commands

- **Dev server**: `npm run dev`
- **Build**: `npm run build` (outputs to `dist/`)
- **Lint**: `npm run lint`
- **Run all tests**: `npm test`
- **Run tests in watch mode**: `npm run test:watch`
- **Run a single test file**: `npx vitest run src/eliza.test.js`
- **Preview production build**: `npm run preview`

## Architecture

### Game flow

`index.html` → `src/main.jsx` → `App` → `Journey` → `Conversation` | `Combat` | reactions

**Journey** (`src/Journey.jsx`) is the game controller. It manages all state (current step, inventory, equipment, gold, HP) and renders one of three modes based on the current step:
- **Normal step**: description + reaction buttons
- **Conversation step** (`character` field): ELIZA chat UI via `<Conversation>`
- **Combat step** (`monster` field): D20 combat UI via `<Combat>`

### ELIZA engine

`src/eliza.js` — JS port of the [ELIZA chatbot](https://github.com/sebyku/eliza) (Weizenbaum's 1966 pattern-matching algorithm). Core algorithm: preprocess input (strip accents, lowercase) → match keywords → sort by priority → regex decomposition → fill response templates with reflected captures. Supports `@memory:` directives (store response, recall on fallback) and `@none` fallback rules. Keywords and decomposition patterns stay accent-free in YAML (engine strips both sides); only reassemblies keep proper accents. Returns `{ text, items_give, items_take, gold, hp, confirm }` — rules can trigger item/stat changes and optionally require confirmation.

### Character system

Characters are defined in `public/data/characters/`. Each character has an index file (e.g., `stranger.yaml`) referencing 3 config layers that get merged:

1. **Generic** (`generic.{lang}.yaml`) — shared rules (greetings, yes/no, fallback)
2. **Aggressivity** (`aggro_friendly.{lang}.yaml`) — personality tone rules
3. **Specific** (`stranger.{lang}.yaml`) — character-unique rules, greetings, and `exits`

Merging is done in `src/useCharacter.js`: rules arrays are concatenated (specific → aggressivity → generic); priority sorting in the engine handles precedence. Reflections come from shared `reflections.{lang}.yaml`.

A character's `@none` rule in its specific config overrides the generic fallback (first match in rule order wins).

### D20 Combat system

`src/combat.js` — pure logic for D20 attack resolution:
- Roll 20: crit (damage ×2)
- Roll > defender AC: hit (normal weapon damage, 1 if unarmed)
- Roll 3 to AC: miss
- Roll 2: stumble (self-inflict 10% weapon damage, ceil)
- Roll 1: fumble (self-inflict 20% weapon damage, ceil)

`src/Combat.jsx` — combat UI with monster HP bar, scrolling log, Attack/Flee/Use buttons. Tracks local HP to avoid stale state between player and monster turns in the same tick. The Use button (🧪) shows usable combat items (items with `combat_damage`); using one deals direct damage (no dice roll) and consumes 1 from inventory.

Monsters defined in `public/data/monsters/{id}.{lang}.yaml` with `name`, `hp`, `ac`, `attack`.

### Equipment system

6 body slots: `head`, `torso`, `legs`, `feet`, `right_hand`, `left_hand`. Items define `slots` (array) and `ac`/`attack` bonuses in `public/data/items.{lang}.yaml`. Multi-slot items (e.g., two-handed weapons) occupy multiple slots.

Player stats derived from equipment: base AC 10 + sum of equipped AC, attack = max(1, equipped weapon attack). `computePlayerStats()` in `combat.js` deduplicates multi-slot items to prevent double-counting.

Equipment auto-cleared when items are removed from inventory (`cleanEquipment` in Journey).

### Inventory and stats

`src/Inventory.jsx` — inventory bar with item icons, equipped badge ("E"), count badge (when count > 1), and stats (❤️ HP, 🛡️ AC, ⚔️ ATK, 💰 Gold). Clicking an item opens a dialog card with description, stat icons (⚔️ attack, 🛡️ AC, 💥 combat damage), and equip/unequip button. Stat values flash green/red on change. Escape key closes the dialog.

Inventory is count-based (`{ item_id: count }`). Each item has a `max` property (default 1). Items with `hidden: true` are invisible in the UI but work as flags for conditional reactions (e.g., `shadow_wolf_killed`, `treasure_looted`).

### Conversation commerce

When an ELIZA rule has `confirm: true`, the Conversation component shows a Yes/No confirmation bar instead of applying changes immediately. Rules without `confirm` apply instantly (for theft, damage, gifts). Before displaying a purchase, checks:
- Item at max capacity → shows "already owned" message
- Not enough gold → shows NPC response + "not enough gold" message

### YAML loading pattern

All data files live in `public/data/` and `public/items/` — served as static assets, fetched at runtime via `fetch()`, no rebuild needed to change content. `src/useYaml.js` provides `fetchYaml(path)` with a Promise cache (evicts on error) and `useYaml(path)` hook. YAML parsed with `js-yaml` using `JSON_SCHEMA` (no anchors/aliases/custom tags).

### Background images

Journey steps can have an `image` field referencing a file in `public/images/`. Applied to `document.body.style.backgroundImage` via effect. When a step has no image, the last background persists. `#root` has 60% opacity; UI elements use 90% opaque backgrounds with `backdrop-filter: blur(8px)`.

### Internationalization

Language set in `public/data/config.yaml` (`auto`, `fr`, or `us`). `auto` resolves from `navigator.language`. All user-facing text externalized in per-language YAML: journey, messages, characters, items, monsters.

### Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) auto-deploys to GitHub Pages on push to master. Runs lint → tests → build → deploy.

## Data File Formats

All data files are YAML, live in `public/data/` (fetched at runtime), and must use `JSON_SCHEMA`-compatible YAML (no anchors, aliases, or custom tags). Each file has a `*.us.yaml` and `*.fr.yaml` variant for i18n.

### `config.yaml`

```yaml
language: auto        # auto | fr | us — "auto" detects from navigator.language
startGold: 10         # starting gold for new game
startHp: 100          # starting HP for new game
```

### `journey.{lang}.yaml`

Top-level: `title`, `description`, `steps` (map of step IDs).

```yaml
title: Crit Happens
description: A journey where every choice matters

steps:
  {step_id}:
    description: string           # narrative text shown to the player
    image: filename.jpg           # optional — background image from public/images/
    character: character_id       # optional — triggers Conversation mode
    monster: monster_id           # optional — triggers Combat mode
    victory_goto: step_id         # required if monster — step on victory
    flee_goto: step_id            # required if monster — step on flee
    gold: number                  # optional — gold change on entering step (negative = cost)
    hp: number                    # optional — HP change on entering step (negative = damage)
    items_give:                   # optional — items added on entering step
      - item_id
    items_take:                   # optional — items removed on entering step
      - item_id
    reactions:                    # list of choices (empty [] for endings/combat)
      - label: string             # button text
        goto: step_id             # target step
        requires: item_id         # optional — only shown if player has this item
        requires_not: item_id     # optional — only shown if player does NOT have this item
        min_gold: number          # optional — only shown if player has >= this gold
        min_hp: number            # optional — only shown if player has >= this HP
        gold: number              # optional — gold change when choosing this reaction
        hp: number                # optional — HP change when choosing this reaction
        items_give:               # optional — items added when choosing
          - item_id
        items_take:               # optional — items removed when choosing
          - item_id
```

Step rendering priority: `monster` > `character` > normal reactions. Steps with `reactions: []` show the "Play again" button (endings).

### `items.{lang}.yaml`

```yaml
items:
  {item_id}:
    name: string                  # display name
    description: string           # flavor text (no stat numbers — shown via icons)
    icon: filename.svg            # SVG file in public/items/ (optional if hidden)
    max: number                   # optional — max stack count (default: 1)
    attack: number                # optional — attack bonus (for weapons)
    ac: number                    # optional — armor class bonus (for armor/shields)
    combat_damage: number         # optional — direct damage when used in combat (consumable)
    hidden: boolean               # optional — if true, invisible in inventory (used as flags)
    slots:                        # optional — if present, item is equippable
      - right_hand                # valid: head, torso, legs, feet, right_hand, left_hand
```

Items without `slots` are not equippable (e.g., keys, quest items). Items can occupy multiple slots (e.g., `[right_hand, left_hand]` for two-handed weapons). Items with `hidden: true` are invisible flags used for game state tracking (e.g., `shadow_wolf_killed`) — they work with `requires`/`requires_not` on reactions but don't appear in the inventory bar. Items with `combat_damage` can be used in combat via the 🧪 button for direct damage (no dice roll, consumes 1 per use).

### `monsters/{id}.{lang}.yaml`

```yaml
name: Shadow Wolf               # display name
hp: 40                           # hit points
ac: 12                           # armor class (player must roll >= this to hit)
attack: 8                        # damage dealt on hit
```

### `messages.{lang}.yaml`

Flat key-value map of UI labels. Supports `{name}`, `{damage}`, `{roll}` placeholders in combat messages.

```yaml
playAgain: Play again
chatPlaceholder: Type something...
confirmPrompt: Accept?
confirmYes: Yes
confirmNo: No
notEnoughGold: "You don't have enough gold for that."
alreadyOwned: "You already have that."
combatAttack: Attack
combatFlee: Flee
combatVictory: "You defeated {name}!"
combatDefeat: "You have been defeated..."
equipButton: Equip
unequipButton: Unequip
```

### `characters/{id}.yaml` (index file, no lang variant)

```yaml
generic: generic                 # generic rules layer name
aggressivity: aggro_friendly     # aggressivity layer name
specific: blacksmith             # character-specific layer name
reflections: reflections         # reflections file name
```

### `characters/{layer}.{lang}.yaml` (rules layer)

Used for generic, aggressivity, and specific layers. All share the same format:

```yaml
greetings:                       # optional — only in specific layer
  - "Welcome!"                   # random greeting shown on conversation start

rules:
  - keyword: string              # substring matched in preprocessed input (accent-free)
    priority: number             # higher wins; 0 for @none fallback
    confirm: boolean             # optional — if true, show Yes/No before applying changes
    gold: number                 # optional — gold change when rule matches
    hp: number                   # optional — HP change when rule matches
    items_give:                  # optional — items added when rule matches
      - item_id
    items_take:                  # optional — items removed when rule matches
      - item_id
    patterns:
      - decomposition: string    # regex pattern (accent-free, case-insensitive)
        reassemblies:            # response templates (keep proper accents)
          - "Response with {1}"  # {1}, {2} = reflected regex captures
          - "@memory:Remember"   # @memory: prefix stores for later recall

exits:                           # optional — only in specific layer
  - keyword: string              # word-boundary matched in preprocessed input
    goto: step_id                # journey step to navigate to
    gold: number                 # optional — gold change on exit
    hp: number                   # optional — HP change on exit
    items_give:                  # optional — items added on exit
      - item_id
    items_take:                  # optional — items removed on exit
      - item_id
```

Rules with `keyword: "@none"` are fallback rules used when no other keyword matches. A specific layer's `@none` overrides the generic layer's (first match in concatenated rule order).

### `characters/reflections.{lang}.yaml`

```yaml
reflections:
  i: "you"                       # keys are accent-stripped at load time
  my: "your"                     # values keep proper accents
  "i'm": "you are"              # multi-word keys in quotes
```

### Static assets

| Directory | Content |
|---|---|
| `public/images/` | Background images (`.jpg`), referenced by `image` field in journey steps |
| `public/items/` | Item icon SVGs, referenced by `icon` field in items YAML |

## Lint Rules

- ESLint flat config targets `**/*.{js,jsx}`, ignores `dist` and `.vite`
- `no-unused-vars` ignores variables starting with uppercase or underscore (`varsIgnorePattern: '^[A-Z_]'`)
- React Hooks and React Refresh rules are enabled (including purity checks — no `Math.random()` in render/useMemo, no setState in effects, no ref access during render)

## Testing

- Vitest with jsdom environment, setup in `src/test/setup.js` (loads `@testing-library/jest-dom`)
- Tests use `@testing-library/react` + `@testing-library/user-event`
- Explicit `cleanup` in `afterEach` is required (tests share a document otherwise)
- `fetch` is mocked globally to serve YAML files from `public/` on disk; `clearYamlCache()` called in `beforeEach`
- Journey/Conversation tests use async `findByText` since YAML loads asynchronously
- Base path is `/crit-happens/` (configured in `vite.config.js`)