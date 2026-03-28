/**
 * D20 combat resolution logic.
 */

export function rollD20() {
  return Math.floor(Math.random() * 20) + 1
}

export function resolveAttack(roll, attackerAttack, defenderAC) {
  if (roll === 20) {
    return { hit: true, damage: Math.ceil(attackerAttack * 2), crit: true }
  }
  if (roll === 1) {
    return { hit: false, selfDamage: Math.ceil(attackerAttack * 0.2), fumble: true }
  }
  if (roll === 2) {
    return { hit: false, selfDamage: Math.ceil(attackerAttack * 0.1), stumble: true }
  }
  if (roll >= defenderAC) {
    return { hit: true, damage: attackerAttack }
  }
  return { hit: false, damage: 0 }
}

export function computePlayerStats(equipment, itemDefs) {
  let ac = 10
  let attack = 1
  for (const itemId of Object.values(equipment)) {
    if (!itemId) continue
    const def = itemDefs[itemId]
    if (def?.ac) ac += def.ac
    if (def?.attack) attack = Math.max(attack, def.attack)
  }
  return { ac, attack }
}
