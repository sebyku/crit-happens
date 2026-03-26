import { useState, useEffect } from 'react'
import yaml from 'js-yaml'

const BASE = import.meta.env.BASE_URL
const cache = new Map()

export function fetchYaml(path) {
  const url = `${BASE}${path}`
  if (cache.has(url)) return cache.get(url)
  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`)
      return res.text()
    })
    .then((text) => yaml.load(text, { schema: yaml.JSON_SCHEMA }))
    .catch((err) => {
      cache.delete(url)
      throw err
    })
  cache.set(url, promise)
  return promise
}

export function clearYamlCache() {
  cache.clear()
}

export function useYaml(path) {
  const [result, setResult] = useState({ data: null, error: null })

  useEffect(() => {
    let cancelled = false
    fetchYaml(path)
      .then((parsed) => {
        if (!cancelled) setResult({ data: parsed, error: null })
      })
      .catch((err) => {
        if (!cancelled) setResult({ data: null, error: err })
      })
    return () => { cancelled = true }
  }, [path])

  if (result.error) throw result.error
  return result.data
}