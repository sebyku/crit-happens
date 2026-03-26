import { useState, useEffect } from 'react'
import { fetchYaml } from './useYaml.js'

function mergeCharacter(genericData, aggroData, specificData, reflectionsData) {
  const rules = [
    ...(specificData?.rules || []),
    ...(aggroData?.rules || []),
    ...(genericData?.rules || []),
  ]

  return {
    greetings: specificData?.greetings || [],
    rules,
    reflections: reflectionsData?.reflections || {},
    exits: specificData?.exits || [],
  }
}

export function loadCharacter(characterId, language) {
  return fetchYaml(`data/characters/${characterId}.yaml`).then((index) => {
    return Promise.all([
      fetchYaml(`data/characters/${index.generic}.${language}.yaml`),
      fetchYaml(`data/characters/${index.aggressivity}.${language}.yaml`),
      fetchYaml(`data/characters/${index.specific}.${language}.yaml`),
      fetchYaml(`data/characters/${index.reflections}.${language}.yaml`),
    ]).then(([genericData, aggroData, specificData, reflectionsData]) =>
      mergeCharacter(genericData, aggroData, specificData, reflectionsData)
    )
  })
}

export function useCharacter(characterId, language) {
  const [character, setCharacter] = useState(null)

  useEffect(() => {
    if (!characterId) return
    let cancelled = false
    loadCharacter(characterId, language)
      .then((result) => {
        if (!cancelled) setCharacter(result)
      })
      .catch((err) => {
        if (!cancelled) console.error(`Failed to load character "${characterId}":`, err)
      })
    return () => { cancelled = true }
  }, [characterId, language])

  if (!characterId) return null
  return character
}