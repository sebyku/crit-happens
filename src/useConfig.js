import { useMemo } from 'react'
import yaml from 'js-yaml'
import configRaw from './data/config.yaml?raw'

function resolveLang(lang) {
  if (lang === 'auto') {
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('fr')) return 'fr'
    return 'us'
  }
  return lang
}

export function useConfig() {
  return useMemo(() => {
    const raw = yaml.load(configRaw)
    return {
      ...raw,
      language: resolveLang(raw.language),
    }
  }, [])
}