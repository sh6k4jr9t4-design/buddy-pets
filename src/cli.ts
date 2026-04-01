#!/usr/bin/env node

import { roll, rollRandom } from './companion.js'
import { renderFace, renderSprite } from './sprites.js'
import { RARITY_COLORS, RARITY_STARS, STAT_NAMES } from './types.js'
import { getLocale, setLocale, availableLocales } from './i18n.js'

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const SHINY_BG = '\x1b[48;5;226m\x1b[38;5;0m'

function padStat(name: string, value: number): string {
  const bar = '█'.repeat(Math.round(value / 10)) + '░'.repeat(10 - Math.round(value / 10))
  return `  ${name.padEnd(12)} ${bar} ${String(value).padStart(3)}`
}

function display(seed?: string) {
  const L = getLocale()
  const result = seed ? roll(seed) : rollRandom()
  const { bones, soul } = result
  const color = RARITY_COLORS[bones.rarity]
  const sprite = renderSprite(bones, 0)
  const rarityLabel = L.rarity[bones.rarity] ?? bones.rarity
  const speciesLabel = L.species[bones.species] ?? bones.species
  const hatLabel = L.hats[bones.hat] ?? bones.hat

  console.log()
  if (bones.shiny) {
    console.log(`${SHINY_BG}  ✨ SHINY! ✨  ${RESET}`)
  }
  console.log(`${color}${BOLD}  ╔══════════════════════════════╗${RESET}`)
  console.log(`${color}${BOLD}  ║  ${soul.name.padEnd(26)}  ║${RESET}`)
  console.log(`${color}${BOLD}  ╚══════════════════════════════╝${RESET}`)
  console.log()

  // Sprite
  for (const line of sprite) {
    console.log(`  ${color}${line}${RESET}`)
  }
  console.log()

  // Info
  console.log(`  ${BOLD}${L.cli.species.padEnd(12)}${RESET} ${speciesLabel}`)
  console.log(`  ${BOLD}${L.cli.rarity.padEnd(12)}${RESET} ${color}${RARITY_STARS[bones.rarity]} ${rarityLabel}${RESET}`)
  console.log(`  ${BOLD}${L.cli.eye.padEnd(12)}${RESET} ${bones.eye}`)
  console.log(`  ${BOLD}${L.cli.hat.padEnd(12)}${RESET} ${hatLabel}`)
  console.log(`  ${BOLD}${L.cli.shiny.padEnd(12)}${RESET} ${bones.shiny ? L.cli.shinyYes : L.cli.shinyNo}`)
  console.log()
  console.log(`  ${BOLD}${L.cli.personality}${RESET} "${soul.personality}"`)
  console.log()

  // Stats
  console.log(`  ${BOLD}${L.cli.stats}${RESET}`)
  for (const name of STAT_NAMES) {
    const val = bones.stats[name]
    const statLabel = L.stats[name] ?? name
    const barColor = val >= 70 ? '\x1b[32m' : val >= 40 ? '\x1b[33m' : '\x1b[31m'
    console.log(`${barColor}${padStat(statLabel, val)}${RESET}`)
  }
  console.log()
}

// ── Parse args ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2)

// Check for --lang flag
let langIndex = args.indexOf('--lang')
if (langIndex === -1) langIndex = args.indexOf('-l')
let lang: string | undefined
if (langIndex !== -1 && args[langIndex + 1]) {
  lang = args[langIndex + 1]
  setLocale(lang)
  args.splice(langIndex, 2)
}

const command = args[0]

if (command === 'hatch' || command === undefined) {
  const seed = args[1]
  if (seed) {
    display(seed)
    console.log(`  ${DIM}${getLocale().cli.hatchedWithSeed} "${seed}"${RESET}`)
  } else {
    display()
    console.log(`  ${DIM}${getLocale().cli.hatchedRandom}${RESET}`)
  }
} else if (command === 'roll') {
  const seed = args[1]
  if (!seed) {
    console.error('Usage: buddy roll <seed> [--lang zh]')
    process.exit(1)
  }
  display(seed)
} else if (command === 'multi') {
  const count = Math.min(parseInt(args[1] || '3', 10), 10)
  for (let i = 0; i < count; i++) {
    display()
  }
} else if (command === 'face') {
  const count = Math.min(parseInt(args[1] || '18', 10), 18)
  const seen = new Set<string>()
  let attempts = 0
  while (seen.size < count && attempts < 1000) {
    const { bones } = rollRandom()
    if (!seen.has(bones.species)) {
      seen.add(bones.species)
      const face = renderFace(bones)
      const label = getLocale().species[bones.species] ?? bones.species
      console.log(`  ${face}  ${label}`)
    }
    attempts++
  }
} else if (command === 'langs' || command === 'languages') {
  console.log('\n  Available locales:')
  for (const l of availableLocales()) {
    setLocale(l)
    console.log(`    ${l} — ${getLocale().label}`)
  }
  console.log()
} else if (command === 'help' || command === '--help' || command === '-h') {
  const L = getLocale()
  console.log(`\n  ${L.cli.helpTitle}\n`)
  console.log('  Commands:')
  console.log(`    hatch [seed]     ${L.cli.helpCommands.hatch}`)
  console.log(`    roll <seed>      ${L.cli.helpCommands.roll}`)
  console.log(`    multi [count]    ${L.cli.helpCommands.multi}`)
  console.log(`    face [count]     ${L.cli.helpCommands.face}`)
  console.log(`    langs            List available languages`)
  console.log(`    help             ${L.cli.helpCommands.help}`)
  console.log('\n  Options:')
  console.log('    --lang, -l <code>  Set language (en, zh, ja)')
  console.log('\n  Examples:')
  console.log('    buddy hatch --lang zh')
  console.log('    buddy hatch "user-123" -l ja')
  console.log('    buddy langs')
  console.log()
} else {
  // Treat unknown command as seed
  display(command)
}
