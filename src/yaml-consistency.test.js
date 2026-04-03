import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import yaml from 'js-yaml'
import { readdirSync } from 'fs'

const publicDir = resolve(import.meta.dirname, '../public')

function loadYaml(path) {
  return yaml.load(readFileSync(resolve(publicDir, path), 'utf-8'), { schema: yaml.JSON_SCHEMA })
}

describe('US/FR YAML consistency', () => {

  describe('journey files', () => {
    const us = loadYaml('data/journey.us.yaml')
    const fr = loadYaml('data/journey.fr.yaml')

    it('have the same step IDs', () => {
      const usSteps = Object.keys(us.steps).sort()
      const frSteps = Object.keys(fr.steps).sort()
      expect(frSteps).toEqual(usSteps)
    })

    it('each step has the same structure', () => {
      for (const stepId of Object.keys(us.steps)) {
        const usStep = us.steps[stepId]
        const frStep = fr.steps[stepId]

        // Same character reference
        expect(frStep.character, `${stepId}.character`).toBe(usStep.character)

        // Same monster reference
        expect(frStep.monster, `${stepId}.monster`).toBe(usStep.monster)

        // Same victory/flee gotos
        expect(frStep.victory_goto, `${stepId}.victory_goto`).toBe(usStep.victory_goto)
        expect(frStep.flee_goto, `${stepId}.flee_goto`).toBe(usStep.flee_goto)

        // Same image
        expect(frStep.image, `${stepId}.image`).toBe(usStep.image)

        // Same gold/hp
        expect(frStep.gold, `${stepId}.gold`).toBe(usStep.gold)
        expect(frStep.hp, `${stepId}.hp`).toBe(usStep.hp)

        // Same items_give/items_take
        expect(frStep.items_give, `${stepId}.items_give`).toEqual(usStep.items_give)
        expect(frStep.items_take, `${stepId}.items_take`).toEqual(usStep.items_take)

        // Same number of reactions
        const usReactions = usStep.reactions || []
        const frReactions = frStep.reactions || []
        expect(frReactions.length, `${stepId}.reactions.length`).toBe(usReactions.length)

        // Each reaction has the same goto and conditions
        for (let i = 0; i < usReactions.length; i++) {
          const ur = usReactions[i]
          const fr_r = frReactions[i]
          const ctx = `${stepId}.reactions[${i}]`

          expect(fr_r.goto, `${ctx}.goto`).toBe(ur.goto)
          expect(fr_r.requires, `${ctx}.requires`).toBe(ur.requires)
          expect(fr_r.requires_not, `${ctx}.requires_not`).toBe(ur.requires_not)
          expect(fr_r.requires_equipped, `${ctx}.requires_equipped`).toBe(ur.requires_equipped)
          expect(fr_r.requires_not_equipped, `${ctx}.requires_not_equipped`).toBe(ur.requires_not_equipped)
          expect(fr_r.min_gold, `${ctx}.min_gold`).toBe(ur.min_gold)
          expect(fr_r.min_hp, `${ctx}.min_hp`).toBe(ur.min_hp)
          expect(fr_r.gold, `${ctx}.gold`).toBe(ur.gold)
          expect(fr_r.hp, `${ctx}.hp`).toBe(ur.hp)
          expect(fr_r.items_give, `${ctx}.items_give`).toEqual(ur.items_give)
          expect(fr_r.items_take, `${ctx}.items_take`).toEqual(ur.items_take)
        }
      }
    })
  })

  describe('items files', () => {
    const us = loadYaml('data/items.us.yaml')
    const fr = loadYaml('data/items.fr.yaml')

    it('have the same item IDs', () => {
      expect(Object.keys(fr.items).sort()).toEqual(Object.keys(us.items).sort())
    })

    it('each item has the same stats', () => {
      for (const itemId of Object.keys(us.items)) {
        const usItem = us.items[itemId]
        const frItem = fr.items[itemId]

        expect(frItem.icon, `${itemId}.icon`).toBe(usItem.icon)
        expect(frItem.max, `${itemId}.max`).toBe(usItem.max)
        expect(frItem.attack, `${itemId}.attack`).toBe(usItem.attack)
        expect(frItem.ac, `${itemId}.ac`).toBe(usItem.ac)
        expect(frItem.combat_damage, `${itemId}.combat_damage`).toBe(usItem.combat_damage)
        expect(frItem.combat_hp, `${itemId}.combat_hp`).toBe(usItem.combat_hp)
        expect(frItem.hidden, `${itemId}.hidden`).toBe(usItem.hidden)
        expect(frItem.slots, `${itemId}.slots`).toEqual(usItem.slots)
      }
    })
  })

  describe('messages files', () => {
    const us = loadYaml('data/messages.us.yaml')
    const fr = loadYaml('data/messages.fr.yaml')

    it('have the same keys', () => {
      expect(Object.keys(fr).sort()).toEqual(Object.keys(us).sort())
    })
  })

  describe('monster files', () => {
    const monsterDir = resolve(publicDir, 'data/monsters')
    const files = readdirSync(monsterDir)
    const usFiles = files.filter((f) => f.endsWith('.us.yaml')).map((f) => f.replace('.us.yaml', ''))
    const frFiles = files.filter((f) => f.endsWith('.fr.yaml')).map((f) => f.replace('.fr.yaml', ''))

    it('have the same monster IDs', () => {
      expect(frFiles.sort()).toEqual(usFiles.sort())
    })

    for (const id of usFiles) {
      it(`${id} has the same stats in US and FR`, () => {
        const us = loadYaml(`data/monsters/${id}.us.yaml`)
        const fr = loadYaml(`data/monsters/${id}.fr.yaml`)
        expect(fr.hp, `${id}.hp`).toBe(us.hp)
        expect(fr.ac, `${id}.ac`).toBe(us.ac)
        expect(fr.attack, `${id}.attack`).toBe(us.attack)
      })
    }
  })

  describe('character files', () => {
    const charDir = resolve(publicDir, 'data/characters')
    const files = readdirSync(charDir)
    const indexFiles = files.filter((f) => !f.includes('.us.') && !f.includes('.fr.') && f.endsWith('.yaml'))
    const usFiles = files.filter((f) => f.endsWith('.us.yaml')).map((f) => f.replace('.us.yaml', ''))
    const frFiles = files.filter((f) => f.endsWith('.fr.yaml')).map((f) => f.replace('.fr.yaml', ''))

    it('every US character file has a FR counterpart', () => {
      expect(frFiles.sort()).toEqual(usFiles.sort())
    })

    for (const id of indexFiles.map((f) => f.replace('.yaml', ''))) {
      it(`${id} index references existing layers`, () => {
        const index = loadYaml(`data/characters/${id}.yaml`)
        const layers = [index.generic, index.aggressivity, index.specific, index.reflections]
        for (const layer of layers) {
          expect(usFiles, `${id} references ${layer}`).toContain(layer)
          expect(frFiles, `${id} references ${layer}`).toContain(layer)
        }
      })
    }
  })
})
