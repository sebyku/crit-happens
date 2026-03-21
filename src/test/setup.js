import '@testing-library/jest-dom/vitest'
import { vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { clearYamlCache } from '../useYaml.js'

beforeEach(() => {
  clearYamlCache()
})

// Mock fetch to serve YAML files from public/ on disk
const publicDir = resolve(import.meta.dirname, '../../public')

globalThis.fetch = vi.fn((url) => {
  // Strip any base path prefix (e.g. /crit-happens/ or just /)
  const path = url.replace(/^\/(?:crit-happens\/)?/, '')
  try {
    const content = readFileSync(resolve(publicDir, path), 'utf-8')
    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve(content),
    })
  } catch {
    return Promise.resolve({
      ok: false,
      status: 404,
      text: () => Promise.resolve(''),
    })
  }
})