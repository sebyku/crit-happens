import { describe, it, expect } from 'vitest'
import { Eliza, stripAccents, preprocess } from './eliza.js'

describe('stripAccents', () => {
  it('removes diacritics', () => {
    expect(stripAccents('deprime')).toBe('deprime')
    expect(stripAccents('déprimé')).toBe('deprime')
    expect(stripAccents('éàü')).toBe('eau')
  })

  it('expands ligatures', () => {
    expect(stripAccents('œuf')).toBe('oeuf')
    expect(stripAccents('Ærodynamic')).toBe('AErodynamic')
  })
})

describe('preprocess', () => {
  it('lowercases, trims, and strips punctuation', () => {
    expect(preprocess('  Hello World!  ')).toBe('hello world')
    expect(preprocess('Test...')).toBe('test')
  })

  it('normalizes whitespace', () => {
    expect(preprocess('too   many    spaces')).toBe('too many spaces')
  })
})

describe('Eliza', () => {
  function makeEngine(rules, reflections = {}) {
    return new Eliza(rules, reflections)
  }

  it('matches a keyword and returns a reassembly', () => {
    const engine = makeEngine([
      {
        keyword: 'hello',
        priority: 3,
        patterns: [
          { decomposition: '.*', reassemblies: ['Hi there!'] },
        ],
      },
    ])
    expect(engine.respond('hello').text).toBe('Hi there!')
  })

  it('falls back to @none when no keyword matches', () => {
    const engine = makeEngine([
      {
        keyword: '@none',
        priority: 0,
        patterns: [
          { decomposition: '.*', reassemblies: ['I do not understand.'] },
        ],
      },
    ])
    expect(engine.respond('random gibberish').text).toBe('I do not understand.')
  })

  it('cycles through reassemblies round-robin', () => {
    const engine = makeEngine([
      {
        keyword: 'test',
        priority: 3,
        patterns: [
          { decomposition: '.*', reassemblies: ['First', 'Second', 'Third'] },
        ],
      },
    ])
    expect(engine.respond('test').text).toBe('First')
    expect(engine.respond('test').text).toBe('Second')
    expect(engine.respond('test').text).toBe('Third')
    expect(engine.respond('test').text).toBe('First') // wraps around
  })

  it('picks higher priority rules first', () => {
    const engine = makeEngine([
      {
        keyword: 'sad',
        priority: 4,
        patterns: [
          { decomposition: '.*', reassemblies: ['You seem sad.'] },
        ],
      },
      {
        keyword: 'i am',
        priority: 2,
        patterns: [
          { decomposition: '.*', reassemblies: ['Tell me more.'] },
        ],
      },
    ])
    expect(engine.respond('i am sad').text).toBe('You seem sad.')
  })

  it('fills template placeholders with captured groups', () => {
    const engine = makeEngine([
      {
        keyword: 'i want',
        priority: 5,
        patterns: [
          {
            decomposition: '.*i want (.*)',
            reassemblies: ['Why do you want {1}?'],
          },
        ],
      },
    ])
    expect(engine.respond('i want peace').text).toBe('Why do you want peace?')
  })

  it('reflects pronouns in captured text', () => {
    const engine = makeEngine(
      [
        {
          keyword: 'i want',
          priority: 5,
          patterns: [
            {
              decomposition: '.*i want (.*)',
              reassemblies: ['Why do you want {1}?'],
            },
          ],
        },
      ],
      { my: 'your', i: 'you' }
    )
    expect(engine.respond('i want my dog').text).toBe('Why do you want your dog?')
  })

  it('stores @memory responses and recalls them later', () => {
    const engine = makeEngine([
      {
        keyword: 'vault',
        priority: 5,
        patterns: [
          {
            decomposition: '.*vault(.*)',
            reassemblies: ['@memory:You mentioned the vault.'],
          },
        ],
      },
      {
        keyword: '@none',
        priority: 0,
        patterns: [
          { decomposition: '.*', reassemblies: ['Go on.'] },
        ],
      },
    ])
    // First input stores memory, falls back to @none
    expect(engine.respond('tell me about the vault').text).toBe('Go on.')
    // Next unrecognized input recalls memory
    expect(engine.respond('anything else').text).toBe('You mentioned the vault.')
  })

  it('matches keywords with accents in input', () => {
    const engine = makeEngine([
      {
        keyword: 'deprime',
        priority: 4,
        patterns: [
          { decomposition: '.*', reassemblies: ['That sounds tough.'] },
        ],
      },
    ])
    expect(engine.respond('je suis déprimé').text).toBe('That sounds tough.')
  })

  it('returns hardcoded fallback when no @none rule exists', () => {
    const engine = makeEngine([])
    expect(engine.respond('hello').text).toBe('Please go on.')
  })

  it('returns items_give when rule has them', () => {
    const engine = makeEngine([
      {
        keyword: 'key',
        priority: 5,
        items_give: ['rusted_key'],
        patterns: [
          { decomposition: '.*key(.*)', reassemblies: ['Take this key.'] },
        ],
      },
    ])
    const response = engine.respond('tell me about the key')
    expect(response.text).toBe('Take this key.')
    expect(response.items_give).toEqual(['rusted_key'])
  })

  it('does not return items on fallback', () => {
    const engine = makeEngine([
      {
        keyword: '@none',
        priority: 0,
        patterns: [
          { decomposition: '.*', reassemblies: ['Hmm.'] },
        ],
      },
    ])
    const response = engine.respond('random')
    expect(response.text).toBe('Hmm.')
    expect(response.items_give).toBeUndefined()
  })
})