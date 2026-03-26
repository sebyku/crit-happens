/**
 * ELIZA conversation engine — JS port of the Java implementation.
 * Pattern-matching with decomposition/reassembly rules and pronoun reflection.
 */

function stripAccents(text) {
  return text
    .replace(/œ/g, 'oe').replace(/Œ/g, 'OE')
    .replace(/æ/g, 'ae').replace(/Æ/g, 'AE')
    .replace(/ß/g, 'ss').replace(/ẞ/g, 'SS')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function preprocess(input) {
  return stripAccents(
    input.trim()
      .replace(/[.!,;]+$/, '')
      .replace(/\s+/g, ' ')
      .toLowerCase()
  )
}

export class Eliza {
  constructor(rules, reflections) {
    this.rules = rules
    this.memory = []
    // Normalize reflection keys to accent-stripped lowercase
    this.reflections = {}
    for (const [key, value] of Object.entries(reflections)) {
      this.reflections[stripAccents(key.toLowerCase())] = value
    }
    // Track reassembly index per pattern for round-robin cycling
    this.reassemblyIndexes = new Map()
  }

  respond(input) {
    const text = preprocess(input)

    // Collect matching rules
    const matchingRules = this.rules.filter(
      (rule) => rule.keyword !== '@none' && text.includes(stripAccents(rule.keyword))
    )
    // Sort by descending priority
    matchingRules.sort((a, b) => b.priority - a.priority)

    // Try each matching rule
    let storedMemory = false
    for (const rule of matchingRules) {
      const memSizeBefore = this.memory.length
      const response = this._applyRule(rule, text)
      storedMemory = storedMemory || this.memory.length > memSizeBefore
      if (response !== null) {
        return {
          text: response,
          items_give: rule.items_give,
          items_take: rule.items_take,
        }
      }
    }

    // Try memory recall (but not if we just stored one)
    if (!storedMemory && this.memory.length > 0) {
      return { text: this.memory.shift() }
    }

    // Fallback
    return { text: this._applyFallback() }
  }

  _applyRule(rule, text) {
    for (const pattern of rule.patterns) {
      let match
      try {
        const regex = new RegExp(stripAccents(pattern.decomposition), 'i')
        match = text.match(regex)
      } catch {
        continue
      }
      if (match) {
        const template = this._nextReassembly(pattern)

        if (template.startsWith('@memory:')) {
          const memTemplate = template.substring(8)
          this.memory.push(this._fillTemplate(memTemplate, match))
          return null
        }

        return this._fillTemplate(template, match)
      }
    }
    return null
  }

  _nextReassembly(pattern) {
    if (!this.reassemblyIndexes.has(pattern)) {
      this.reassemblyIndexes.set(pattern, 0)
    }
    const index = this.reassemblyIndexes.get(pattern)
    const result = pattern.reassemblies[index]
    this.reassemblyIndexes.set(pattern, (index + 1) % pattern.reassemblies.length)
    return result
  }

  _fillTemplate(template, match) {
    let result = template
    for (let i = 1; i < match.length; i++) {
      if (match[i] != null) {
        const reflected = this._reflect(match[i].trim())
        result = result.replace(`{${i}}`, reflected)
      }
    }
    return result
  }

  _reflect(text) {
    return text
      .split(/\s+/)
      .map((word) => {
        const lower = word.toLowerCase()
        return this.reflections[lower] ?? word
      })
      .join(' ')
  }

  _applyFallback() {
    for (const rule of this.rules) {
      if (rule.keyword === '@none' && rule.patterns.length > 0) {
        return this._nextReassembly(rule.patterns[0])
      }
    }
    return 'Please go on.'
  }
}

export { stripAccents, preprocess }
