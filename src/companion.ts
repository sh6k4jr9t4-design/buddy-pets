import {
  type Companion,
  type CompanionBones,
  type CompanionSoul,
  type Eye,
  type Hat,
  type Rarity,
  type Species,
  type StatName,
  EYES,
  HATS,
  RARITIES,
  RARITY_FLOOR,
  RARITY_WEIGHTS,
  SPECIES,
  STAT_NAMES,
} from './types.js'
import { getLocale } from './i18n.js'

// ── Mulberry32 PRNG ──────────────────────────────────────────────────────────
// Tiny seeded PRNG. Good enough for picking ducks.

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Hash ─────────────────────────────────────────────────────────────────────

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!
}

function rollRarity(rng: () => number): Rarity {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let roll = rng() * total
  for (const rarity of RARITIES) {
    roll -= RARITY_WEIGHTS[rarity]
    if (roll < 0) return rarity
  }
  return 'common'
}

// One peak stat, one dump stat, rest scattered. Rarity bumps the floor.
function rollStats(
  rng: () => number,
  rarity: Rarity,
): Record<StatName, number> {
  const floor = RARITY_FLOOR[rarity]
  const peak = pick(rng, STAT_NAMES)
  let dump = pick(rng, STAT_NAMES)
  while (dump === peak) dump = pick(rng, STAT_NAMES)

  const stats = {} as Record<StatName, number>
  for (const name of STAT_NAMES) {
    if (name === peak) {
      stats[name] = Math.min(100, floor + 50 + Math.floor(rng() * 30))
    } else if (name === dump) {
      stats[name] = Math.max(1, floor - 10 + Math.floor(rng() * 15))
    } else {
      stats[name] = floor + Math.floor(rng() * 40)
    }
  }
  return stats
}

// ── Salt ─────────────────────────────────────────────────────────────────────

const SALT = 'friend-2026-401'

// ── Core roll logic ──────────────────────────────────────────────────────────

export type Roll = {
  bones: CompanionBones
  soul: CompanionSoul
  inspirationSeed: number
}

function rollFrom(rng: () => number): Roll {
  const locale = getLocale()
  const rarity = rollRarity(rng)
  const species = pick(rng, SPECIES)
  const eye = pick(rng, EYES)
  const hat = rarity === 'common' ? 'none' : pick(rng, HATS)
  const shiny = rng() < 0.01
  const stats = rollStats(rng, rarity)
  const inspirationSeed = Math.floor(rng() * 1e9)

  // Generate name from locale's name pool
  const prefix = pick(rng, locale.namePrefixes)
  const suffixes = locale.nameSuffixes[species] ?? ['?']
  const suffix = pick(rng, suffixes)
  const name = `${prefix} ${suffix}`

  // Generate personality from locale
  const personality = pick(rng, locale.personalities)

  return {
    bones: { rarity, species, eye, hat, shiny, stats },
    soul: { name, personality },
    inspirationSeed,
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Roll a companion deterministically from a seed string (e.g. user ID).
 * Same input always produces the same companion. Result depends on active locale.
 */
export function roll(seed: string): Roll {
  return rollFrom(mulberry32(hashString(seed + SALT)))
}

/**
 * Roll a companion with a custom seed (no salt added).
 */
export function rollWithSeed(seed: string): Roll {
  return rollFrom(mulberry32(hashString(seed)))
}

/**
 * Roll a completely random companion.
 */
export function rollRandom(): Roll {
  return rollFrom(mulberry32(Math.floor(Math.random() * 0xffffffff)))
}

/**
 * Get a full companion with hatchedAt timestamp.
 */
export function hatch(seed: string): Companion {
  const { bones, soul } = roll(seed)
  return { ...bones, ...soul, hatchedAt: Date.now() }
}

/**
 * Hatch a random companion.
 */
export function hatchRandom(): Companion {
  const { bones, soul } = rollRandom()
  return { ...bones, ...soul, hatchedAt: Date.now() }
}
