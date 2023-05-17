import {createSandbox} from 'sinon'

import {mapTypesToLabels} from '../src/messages'
import {defaultConfig} from '../src/utils/config'

describe('messages', () => {
  const sandbox = createSandbox()
  const labelMapping = defaultConfig['label-mapping']
  const breakingChangeLabel = defaultConfig['label-for-breaking-changes']

  afterEach(() => {
    sandbox.restore()
  })
  describe('mapTypesToLabels', () => {
    it('can map a few types to the appropriate labels', () => {
      const response = mapTypesToLabels(
        {
          types: new Set(['fix', 'feat']),
          includesBreakingChange: false,
          scopes: new Set()
        },
        labelMapping,
        breakingChangeLabel
      )
      const expected: (keyof typeof labelMapping)[] = ['bugfix', 'feature']
      expect(response).toEqual(new Set(expected))
    })
    it('does not fail if a type does not map to a label', () => {
      const response = mapTypesToLabels(
        {
          types: new Set(['fix', 'feat', 'foobar']),
          includesBreakingChange: false,
          scopes: new Set()
        },
        labelMapping,
        breakingChangeLabel
      )
      const expected: (keyof typeof labelMapping)[] = ['bugfix', 'feature']
      expect(response).toEqual(new Set(expected))
    })
    it('includes breaking change label if needed', () => {
      const response = mapTypesToLabels(
        {
          types: new Set(['fix', 'feat']),
          includesBreakingChange: true,
          scopes: new Set()
        },
        labelMapping,
        breakingChangeLabel
      )
      const expected: (keyof typeof labelMapping | 'breaking')[] = [
        'breaking',
        'bugfix',
        'feature'
      ]
      expect(response).toEqual(new Set(expected))
    })
    it('does not include include breaking change label if not provided', () => {
      const response = mapTypesToLabels(
        {
          types: new Set(['fix', 'feat']),
          includesBreakingChange: true,
          scopes: new Set()
        },
        labelMapping,
        ''
      )
      const expected: (keyof typeof labelMapping)[] = ['bugfix', 'feature']
      expect(response).toEqual(new Set(expected))
    })
    it('returns a unique Set of labels', () => {
      const response = mapTypesToLabels(
        {
          types: new Set(['build', 'ci']),
          includesBreakingChange: false,
          scopes: new Set()
        },
        labelMapping,
        breakingChangeLabel
      )
      const expected: (keyof typeof labelMapping | 'breaking')[] = [
        'configuration'
      ]
      expect(response).toEqual(new Set(expected))
    })
    it('does not error if label maps to multiple types', () => {
      const multipleLabelMap = {
        feature: ['feat'],
        improvement: ['feat']
      }

      const response = mapTypesToLabels(
        {
          types: new Set(['feat']),
          includesBreakingChange: false,
          scopes: new Set()
        },
        multipleLabelMap,
        breakingChangeLabel
      )
      const expected: (keyof typeof labelMapping | 'improvement')[] = [
        'feature',
        'improvement'
      ]
      expect(response).toEqual(new Set(expected))
    })
  })
})
