import { useMemo } from 'react'
import yaml from 'js-yaml'
import itemsUsRaw from './data/items.us.yaml?raw'
import itemsFrRaw from './data/items.fr.yaml?raw'

// Auto-import all SVGs from the items folder — no manual mapping needed
const iconModules = import.meta.glob('./assets/items/*.svg', { eager: true, query: '?url', import: 'default' })

// Build a map from filename to resolved URL: { 'rusted_key.svg': '/assets/items/rusted_key-abc123.svg' }
const iconMap = {}
for (const [path, url] of Object.entries(iconModules)) {
  const filename = path.split('/').pop()
  iconMap[filename] = url
}

const itemsFiles = {
  us: itemsUsRaw,
  fr: itemsFrRaw,
}

export function useItems(language) {
  return useMemo(() => {
    const raw = yaml.load(itemsFiles[language] || itemsUsRaw)
    const items = raw?.items || {}
    const resolved = {}
    for (const [id, def] of Object.entries(items)) {
      resolved[id] = {
        ...def,
        iconUrl: iconMap[def.icon] || null,
      }
    }
    return resolved
  }, [language])
}
