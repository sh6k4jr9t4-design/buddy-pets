#!/usr/bin/env node

import { hatch, hatchRandom, roll, rollRandom } from './companion.js'
import { renderFace, renderSprite } from './sprites.js'
import { RARITY_COLORS, RARITY_STARS, STAT_NAMES } from './types.js'

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const BLINK = '\x1b[5m'
const SHINY_BG = '\x1b[48;5;226m\x1b[38;5;0m'

function padStat(name: string, value: number): string {
  const bar = '█'.repeat(Math.round(value / 10)) + '░'.repeat(10 - Math.round(value / 10))
  return `  ${name.padEnd(12)} ${bar} ${String(value).padStart(3)}`
}

function display(seed?: string) {
  const result = seed ? roll(seed) : rollRandom()
  const { bones, soul } = result
  const color = RARITY_COLORS[bones.rarity]
  const sprite = renderSprite(bones, 0)

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
  console.log(`  ${BOLD}Species${RESET}    ${bones.species}`)
  console.log(`  ${BOLD}Rarity${RESET}     ${color}${RARITY_STARS[bones.rarity]} ${bones.rarity}${RESET}`)
  console.log(`  ${BOLD}Eye${RESET}        ${bones.eye}`)
  console.log(`  ${BOLD}Hat${RESET}        ${bones.hat}`)
  console.log(`  ${BOLD}Shiny${RESET}      ${bones.shiny ? '✨ yes' : 'no'}`)
  console.log()
  console.log(`  ${BOLD}Personality${RESET} "${soul.personality}"`)
  console.log()

  // Stats
  console.log(`  ${BOLD}Stats${RESET}`)
  for (const name of STAT_NAMES) {
    const val = bones.stats[name]
    const barColor = val >= 70 ? '\x1b[32m' : val >= 40 ? '\x1b[33m' : '\x1b[31m'
    console.log(`${barColor}${padStat(name, val)}${RESET}`)
  }
  console.log()
}

// ── Main ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const command = args[0]

if (command === 'hatch' || command === undefined) {
  const seed = args[1]
  if (seed) {
    const companion = hatch(seed)
    display(seed)
    console.log(`  ${DIM}hatched with seed: "${seed}"${RESET}`)
  } else {
    // Use random seed based on time
    const randomSeed = Math.random().toString(36).slice(2)
    display()
    console.log(`  ${DIM}hatched randomly${RESET}`)
  }
} else if (command === 'roll') {
  const seed = args[1]
  if (!seed) {
    console.error('Usage: buddy roll <seed>')
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
      console.log(`  ${face}  ${bones.species}`)
    }
    attempts++
  }
} else if (command === 'help' || command === '--help' || command === '-h') {
  console.log(`
  🦆 buddy — electronic pet system

  Commands:
    hatch [seed]     Hatch a companion (deterministic if seed given)
    roll <seed>      Roll with a specific seed
    multi [count]    Hatch multiple random companions (max 10)
    face [count]     Show faces of random species
    help             Show this help

  Examples:
    buddy hatch
    buddy hatch "my-user-id"
    buddy roll "hello"
    buddy multi 5
    buddy face 6
`)
} else {
  // Treat unknown command as seed
  display(command)
}
