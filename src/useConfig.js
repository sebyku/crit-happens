import { useMemo } from 'react'
import { useYaml } from './useYaml.js'

function resolveLang(lang) {
  if (lang === 'auto') {
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('fr')) return 'fr'
    return 'us'
  }
  return lang
}

export function useConfig() {
  const raw = useYaml('data/config.yaml')
  return useMemo(() => {
    if (!raw) return null
    return {
      ...raw,
      language: resolveLang(raw.language),
    }
  }, [raw])
}