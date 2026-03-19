# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Crit Happens" is a choose-your-own-adventure game built with React 19 and Vite 8. Players navigate branching story steps and can have ELIZA-style conversations with NPCs.

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

`index.html` → `src/main.jsx` → `App` → `Journey` → (optionally) `Conversation`

**Journey** (`src/Journey.jsx`) loads a YAML story file (`src/data/journey.{lang}.yaml`) defining steps with descriptions, reactions (choices with `goto` targets), and optional `character` references. When a step has no `character`, it renders as a description + reaction buttons. When it has a `character`, it renders the `Conversation` component instead.

**Conversation** (`src/Conversation.jsx`) provides a chat UI (scrolling messages + text input) powered by the ELIZA engine. The player types free text; the engine pattern-matches and responds. Exit keywords (defined in the character config) end the conversation and navigate to a journey step. Journey reactions are also shown as clickable action buttons below the chat.

### ELIZA engine

`src/eliza.js` — JS port of the pattern-matching engine from `C:\workspace\eliza`. Core algorithm: preprocess input → match keywords → sort by priority → regex decomposition → fill response templates with reflected captures. Supports `@memory:` directives (store response, recall on fallback) and `@none` fallback rules.

### Character system

Characters are defined in `src/data/characters/`. Each character has an index file (e.g., `stranger.yaml`) referencing 3 config layers that get merged:

1. **Generic** (`generic.{lang}.yaml`) — shared rules (greetings, yes/no, fallback)
2. **Aggressivity** (`aggro_friendly.{lang}.yaml`) — personality tone rules
3. **Specific** (`stranger.{lang}.yaml`) — character-unique rules, greetings, and `exits`

Merging is done in `src/useCharacter.js`: rules arrays are concatenated (specific → aggressivity → generic); priority sorting in the engine handles precedence. Reflections come from shared `reflections.{lang}.yaml`.

### Internationalization

Language is set in `src/data/config.yaml` (`auto`, `fr`, or `us`). `auto` resolves from `navigator.language` in `src/useConfig.js`.

All user-facing text is externalized:
- **Journey content**: `src/data/journey.us.yaml` / `journey.fr.yaml`
- **UI labels**: `src/data/messages.us.yaml` / `messages.fr.yaml`
- **Character configs**: `*.us.yaml` / `*.fr.yaml` variants in `src/data/characters/`

### YAML loading pattern

All YAML files are imported as raw strings with Vite's `?raw` suffix and parsed at runtime with `js-yaml`. This avoids needing a Vite YAML plugin.

## Lint Rules

- ESLint flat config targets `**/*.{js,jsx}`
- `no-unused-vars` ignores variables starting with uppercase or underscore (`varsIgnorePattern: '^[A-Z_]'`)
- React Hooks and React Refresh rules are enabled (including purity checks — no `Math.random()` in render/useMemo)

## Testing

- Vitest with jsdom environment, setup in `src/test/setup.js` (loads `@testing-library/jest-dom`)
- Tests use `@testing-library/react` + `@testing-library/user-event`
- Explicit `cleanup` in `afterEach` is required (tests share a document otherwise)
- Base path is `/crit-happens/` (configured in `vite.config.js`)
