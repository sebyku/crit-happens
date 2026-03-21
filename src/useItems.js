import { useMemo } from 'react'
import { useYaml } from './useYaml.js'

const BASE = import.meta.env.BASE_URL

export function useItems(language) {
  const raw = useYaml(`data/items.${language}.yaml`)
  return useMemo(() => {
    if (!raw) return {}
    const items = raw.items || {}
    const resolved = {}
    for (const [id, def] of Object.entries(items)) {
      resolved[id] = {
        ...def,
        iconUrl: def.icon ? `${BASE}items/${def.icon}` : null,
      }
    }
    return resolved
  }, [raw])
}