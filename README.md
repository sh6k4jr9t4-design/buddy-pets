# 🐾 buddy-pets

Deterministic ASCII pet system. 18 species, 5 rarities, shiny variants, hats, stats.

Extracted and refactored from Claude Code's Buddy subsystem (v2.1.88).

```
  ╔══════════════════════════════╗
  ║  Captain Smokey              ║
  ╚══════════════════════════════╝

            /^\  /^\
           <  ✦  ✦  >
           (   ~~   )
            `-vvvv´-

  Species    dragon
  Rarity     ★★★★ epic
  Eye        ✦
  Hat        wizard
  Shiny      no

  Personality "chaotic and proud of it"

  DEBUGGING   ███████░░░  73
  PATIENCE    ████░░░░░░  42
  CHAOS       █████████░  91
  WISDOM      ███░░░░░░░  35
  SNARK       ██████░░░░  64
```

## Features

- **Deterministic**: Same seed → same pet. Use user IDs, emails, anything
- **18 species**: duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk
- **5 rarities**: common (60%), uncommon (25%), rare (10%), epic (4%), legendary (1%)
- **Shiny**: 1% chance, golden display
- **8 hats**: crown, tophat, propeller, halo, wizard, beanie, tinyduck
- **5 stats**: DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK — with peak/dump mechanics
- **ASCII sprites**: 3-frame idle animations per species
- **Named**: Auto-generated names like "Grumpy Whiskers" or "Cosmic Flame"
- **Personalities**: "secretly affectionate but hides it", "perpetually unimpressed", etc.
- **Zero dependencies**: Pure TypeScript, no runtime deps

## Install

```bash
npm install buddy-pets
```

## CLI

```bash
# Hatch a random companion
npx buddy-pets

# Deterministic hatch from seed
npx buddy-pets hatch "user-12345"

# Roll with specific seed
npx buddy-pets roll "hello-world"

# Show multiple random pets
npx buddy-pets multi 5

# Show all species faces
npx buddy-pets face 18
```

## API

```typescript
import { roll, hatch, renderSprite, renderFace } from 'buddy-pets'

// Deterministic roll from seed
const { bones, soul } = roll('user-12345')
console.log(soul.name)         // "Tiny Flame"
console.log(bones.rarity)     // "rare"
console.log(bones.species)    // "dragon"
console.log(bones.shiny)      // false
console.log(bones.stats)      // { DEBUGGING: 73, PATIENCE: 42, ... }

// Hatch with timestamp
const companion = hatch('user-12345')
console.log(companion.hatchedAt) // 1712030400000

// Render ASCII sprite
const lines = renderSprite(bones, 0)
lines.forEach(line => console.log(line))

// Render just the face
const face = renderFace(bones)  // "<✦~✦>"

// Random roll (non-deterministic)
import { rollRandom, hatchRandom } from 'buddy-pets'
const random = rollRandom()
```

## How the seeding works

```
seed = userId + "friend-2026-401"
hash = FNV-1a(seed)
rng  = Mulberry32(hash)
```

The salt (`friend-2026-401`) is the original Claude Code value — April 1st, 2026 Easter egg date. You can change it in `companion.ts`.

Bones (species, rarity, eye, hat, stats) are **deterministic from seed**. Soul (name, personality) is also deterministic but generated separately. This means:

- Same user always gets the same pet
- You can't cheat by editing config — species/rarity come from hash
- No server needed — everything is client-side deterministic

## Origin

Found in Claude Code v2.1.88's leaked source code under the `buddy/` subsystem. The original had:

- `types.ts` — type definitions and constants
- `companion.ts` — roll logic with Mulberry32 PRNG
- `sprites.ts` — ASCII sprite definitions (18 species × 3 frames)
- `CompanionSprite.tsx` — React/Ink terminal UI
- `prompt.ts` — integration with Claude Code's prompt system
- `useBuddyNotification.tsx` — React hooks for notifications

This standalone version keeps the core logic (types, companion, sprites) and replaces the UI with a simple ANSI terminal renderer. Claude Code dependencies removed.

## License

MIT

---

*The salt value is `friend-2026-401`. Your duck was born on April Fools' Day.*
