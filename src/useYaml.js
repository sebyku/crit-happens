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
    .then((text) => yaml.load(text))
  cache.set(url, promise)
  return promise
}

export function clearYamlCache() {
  cache.clear()
}

export function useYaml(path) {
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchYaml(path).then((parsed) => {
      if (!cancelled) setData(parsed)
    })
    return () => { cancelled = true }
  }, [path])

  return data
}