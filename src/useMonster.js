import { useState, useEffect } from 'react'
import { fetchYaml } from './useYaml.js'

export function useMonster(monsterId, language) {
  const [result, setResult] = useState({ id: null, data: null })

  useEffect(() => {
    if (!monsterId) return
    let cancelled = false
    fetchYaml(`data/monsters/${monsterId}.${language}.yaml`)
      .then((data) => {
        if (!cancelled) setResult({ id: monsterId, data })
      })
      .catch((err) => {
        if (!cancelled) console.error(`Failed to load monster "${monsterId}":`, err)
      })
    return () => { cancelled = true }
  }, [monsterId, language])

  if (!monsterId) return null
  // Return null if loaded data is for a different monster (stale)
  if (result.id !== monsterId) return null
  return result.data
}
