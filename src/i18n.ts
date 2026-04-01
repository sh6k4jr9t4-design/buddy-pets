// i18n types and loader for buddy-pets

export interface BuddyLocale {
  // Metadata
  lang: string
  label: string

  // Species names
  species: Record<string, string>

  // Rarity names
  rarity: {
    common: string
    uncommon: string
    rare: string
    epic: string
    legendary: string
  }

  // Hat names
  hats: {
    none: string
    crown: string
    tophat: string
    propeller: string
    halo: string
    wizard: string
    beanie: string
    tinyduck: string
  }

  // Stat names
  stats: {
    DEBUGGING: string
    PATIENCE: string
    CHAOS: string
    WISDOM: string
    SNARK: string
  }

  // Name generation
  namePrefixes: string[]
  nameSuffixes: Record<string, string[]>

  // Personality traits
  personalities: string[]

  // CLI labels
  cli: {
    species: string
    rarity: string
    eye: string
    hat: string
    shiny: string
    shinyYes: string
    shinyNo: string
    personality: string
    stats: string
    hatchedWithSeed: string
    hatchedRandom: string
    helpTitle: string
    helpCommands: {
      hatch: string
      roll: string
      multi: string
      face: string
      help: string
    }
  }
}

// ── Built-in locales ─────────────────────────────────────────────────────────

import { en } from './locales/en.js'
import { zh } from './locales/zh.js'
import { ja } from './locales/ja.js'

const LOCALES: Record<string, BuddyLocale> = {
  en,
  zh,
  ja,
}

// ── Active locale ────────────────────────────────────────────────────────────

let _active: BuddyLocale = en

export function setLocale(lang: string): BuddyLocale {
  const locale = LOCALES[lang.toLowerCase()]
  if (!locale) {
    const available = Object.keys(LOCALES).join(', ')
    throw new Error(`Unknown locale "${lang}". Available: ${available}`)
  }
  _active = locale
  return _active
}

export function getLocale(): BuddyLocale {
  return _active
}

export function availableLocales(): string[] {
  return Object.keys(LOCALES)
}

export function registerLocale(locale: BuddyLocale): void {
  LOCALES[locale.lang] = locale
}
