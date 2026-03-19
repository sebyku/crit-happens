import { useMemo } from 'react'
import yaml from 'js-yaml'

// Character index files
import strangerIndex from './data/characters/stranger.yaml?raw'

// Generic rules
import genericUs from './data/characters/generic.us.yaml?raw'
import genericFr from './data/characters/generic.fr.yaml?raw'

// Aggressivity rules
import aggroFriendlyUs from './data/characters/aggro_friendly.us.yaml?raw'
import aggroFriendlyFr from './data/characters/aggro_friendly.fr.yaml?raw'

// Character-specific rules
import strangerUs from './data/characters/stranger.us.yaml?raw'
import strangerFr from './data/characters/stranger.fr.yaml?raw'

// Reflections
import reflectionsUs from './data/characters/reflections.us.yaml?raw'
import reflectionsFr from './data/characters/reflections.fr.yaml?raw'

const indexes = {
  stranger: strangerIndex,
}

const layers = {
  generic: { us: genericUs, fr: genericFr },
  aggro_friendly: { us: aggroFriendlyUs, fr: aggroFriendlyFr },
  stranger: { us: strangerUs, fr: strangerFr },
  reflections: { us: reflectionsUs, fr: reflectionsFr },
}

function loadLayer(name, language) {
  const langFiles = layers[name]
  if (!langFiles) return null
  const raw = langFiles[language] || langFiles.us
  return yaml.load(raw)
}

export function loadCharacter(characterId, language) {
  const indexRaw = indexes[characterId]
  if (!indexRaw) return null

  const index = yaml.load(indexRaw)

  const genericData = loadLayer(index.generic, language)
  const aggroData = loadLayer(index.aggressivity, language)
  const specificData = loadLayer(index.specific, language)
  const reflectionsData = loadLayer(index.reflections, language)

  // Merge rules: specific first (higher priority wins naturally via sort),
  // then aggressivity, then generic
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

export function useCharacter(characterId, language) {
  return useMemo(
    () => (characterId ? loadCharacter(characterId, language) : null),
    [characterId, language]
  )
}
