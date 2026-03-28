import { describe, it, expect } from 'vitest'
import { resolveAttack, computePlayerStats } from './combat.js'

describe('resolveAttack', () => {
  it('critical hit on 20 doubles damage', () => {
    const result = resolveAttack(20, 6, 12)
    expect(result).toEqual({ hit: true, damage: 12, crit: true })
  })

  it('fumble on 1 self-inflicts 20% damage', () => {
    const result = resolveAttack(1, 6, 12)
    expect(result).toEqual({ hit: false, selfDamage: 2, fumble: true })
  })

  it('fumble rounds up self-damage', () => {
    const result = resolveAttack(1, 5, 12)
    expect(result).toEqual({ hit: false, selfDamage: 1, fumble: true })
  })

  it('stumble on 2 self-inflicts 10% damage', () => {
    const result = resolveAttack(2, 6, 12)
    expect(result).toEqual({ hit: false, selfDamage: 1, stumble: true })
  })

  it('stumble rounds up self-damage', () => {
    const result = resolveAttack(2, 15, 12)
    expect(result).toEqual({ hit: false, selfDamage: 2, stumble: true })
  })

  it('hit when roll >= defender AC', () => {
    const result = resolveAttack(12, 6, 12)
    expect(result).toEqual({ hit: true, damage: 6 })
  })

  it('hit when roll > defender AC', () => {
    const result = resolveAttack(15, 6, 12)
    expect(result).toEqual({ hit: true, damage: 6 })
  })

  it('miss when roll < defender AC and > 2', () => {
    const result = resolveAttack(5, 6, 12)
    expect(result).toEqual({ hit: false, damage: 0 })
  })

  it('miss on roll 3 against high AC', () => {
    const result = resolveAttack(3, 6, 15)
    expect(result).toEqual({ hit: false, damage: 0 })
  })

  it('unarmed attack (1 damage) works correctly', () => {
    const result = resolveAttack(15, 1, 10)
    expect(result).toEqual({ hit: true, damage: 1 })
  })

  it('unarmed crit doubles to 2', () => {
    const result = resolveAttack(20, 1, 10)
    expect(result).toEqual({ hit: true, damage: 2, crit: true })
  })

  it('unarmed fumble self-damage rounds up to 1', () => {
    const result = resolveAttack(1, 1, 10)
    expect(result).toEqual({ hit: false, selfDamage: 1, fumble: true })
  })
})

describe('computePlayerStats', () => {
  const itemDefs = {
    iron_sword: { attack: 6 },
    wooden_shield: { ac: 2 },
    iron_helmet: { ac: 1 },
    rusted_key: {},
  }

  it('returns base stats when no equipment', () => {
    const equipment = {
      head: null, torso: null, legs: null,
      feet: null, right_hand: null, left_hand: null,
    }
    expect(computePlayerStats(equipment, itemDefs)).toEqual({ ac: 10, attack: 1 })
  })

  it('adds weapon attack from right hand', () => {
    const equipment = {
      head: null, torso: null, legs: null,
      feet: null, right_hand: 'iron_sword', left_hand: null,
    }
    expect(computePlayerStats(equipment, itemDefs)).toEqual({ ac: 10, attack: 6 })
  })

  it('adds AC from shield and helmet', () => {
    const equipment = {
      head: 'iron_helmet', torso: null, legs: null,
      feet: null, right_hand: null, left_hand: 'wooden_shield',
    }
    expect(computePlayerStats(equipment, itemDefs)).toEqual({ ac: 13, attack: 1 })
  })

  it('combines all equipment stats', () => {
    const equipment = {
      head: 'iron_helmet', torso: null, legs: null,
      feet: null, right_hand: 'iron_sword', left_hand: 'wooden_shield',
    }
    expect(computePlayerStats(equipment, itemDefs)).toEqual({ ac: 13, attack: 6 })
  })

  it('ignores items with no stats', () => {
    const equipment = {
      head: null, torso: null, legs: null,
      feet: null, right_hand: 'rusted_key', left_hand: null,
    }
    expect(computePlayerStats(equipment, itemDefs)).toEqual({ ac: 10, attack: 1 })
  })
})
