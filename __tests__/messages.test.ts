import { createSandbox } from 'sinon';

import { mapTypesToLabels, parseMessages } from '../src/messages';
import { defaultConfig } from '../src/utils/config';

describe('messages', () => {
  const sandbox = createSandbox();
  const labelMapping = defaultConfig['label-mapping'];
  const breakingChangeLabel = defaultConfig['label-for-breaking-changes'];

  afterEach(() => {
    sandbox.restore();
  });
  describe('mapTypesToLabels', () => {
    it('can map a few types to the appropriate labels', () => {
      const response = mapTypesToLabels(
        {
          types: new Set(['fix', 'feat']),
          includesBreakingChange: false,
          scopes: new Set(),
        },
        labelMapping,
        breakingChangeLabel
      );
      const expected: Array<keyof typeof labelMapping> = ['bugfix', 'feature'];
      expect(response).toEqual(new Set(expected));
    });
    it('does not fail if a type does not map to a label', () => {
      const response = mapTypesToLabels(
        {
          types: new Set(['fix', 'feat', 'foobar']),
          includesBreakingChange: false,
          scopes: new Set(),
        },
        labelMapping,
        breakingChangeLabel
      );
      const expected: Array<keyof typeof labelMapping> = ['bugfix', 'feature'];
      expect(response).toEqual(new Set(expected));
    });
    it('includes breaking change label if needed', () => {
      const response = mapTypesToLabels(
        {
          types: new Set(['fix', 'feat']),
          includesBreakingChange: true,
          scopes: new Set(),
        },
        labelMapping,
        breakingChangeLabel
      );
      const expected: Array<keyof typeof labelMapping | 'breaking'> = ['breaking', 'bugfix', 'feature'];
      expect(response).toEqual(new Set(expected));
    });
    it('does not include include breaking change label if not provided', () => {
      const response = mapTypesToLabels(
        {
          types: new Set(['fix', 'feat']),
          includesBreakingChange: true,
          scopes: new Set(),
        },
        labelMapping,
        ''
      );
      const expected: Array<keyof typeof labelMapping> = ['bugfix', 'feature'];
      expect(response).toEqual(new Set(expected));
    });
    it('returns a unique Set of labels', () => {
      const response = mapTypesToLabels(
        {
          types: new Set(['build', 'ci']),
          includesBreakingChange: false,
          scopes: new Set(),
        },
        labelMapping,
        breakingChangeLabel
      );
      const expected: Array<keyof typeof labelMapping | 'breaking'> = ['configuration'];
      expect(response).toEqual(new Set(expected));
    });
    it('does not error if label maps to multiple types', () => {
      const multipleLabelMap = {
        feature: ['feat'],
        improvement: ['feat'],
      };

      const response = mapTypesToLabels(
        {
          types: new Set(['feat']),
          includesBreakingChange: false,
          scopes: new Set(),
        },
        multipleLabelMap,
        breakingChangeLabel
      );
      const expected: Array<keyof typeof labelMapping | 'improvement'> = ['feature', 'improvement'];
      expect(response).toEqual(new Set(expected));
    });
  });
  describe('parseMessages', () => {
    it('can parse a single message', () => {
      const parsedPayload = parseMessages(new Set(['feat: test message']));
      expect(parsedPayload.types).toEqual(new Set(['feat']));
    });
    it('only returns unique types', () => {
      const parsedPayload = parseMessages(new Set(['feat: test message 1', 'feat: test message 2']));
      expect(parsedPayload.types).toEqual(new Set(['feat']));
    });
    it('can return multiple types', () => {
      const parsedPayload = parseMessages(new Set(['feat: test message 1', 'fix: test message 2']));
      expect(parsedPayload.types).toEqual(new Set(['feat', 'fix']));
    });
    it('can parse a message without a type', () => {
      const parsedPayload = parseMessages(
        new Set([
          'feat: test message 1',
          'no type on this one',
          '(weird): message',
          '(scope)!: and breaking',
          'fix: test message 2',
        ])
      );
      expect(parsedPayload.types).toEqual(new Set(['feat', 'fix']));
      expect(parsedPayload.scopes).toEqual(new Set());
      expect(parsedPayload.includesBreakingChange).toBeFalsy();
    });
    it('parses messages with scopes', () => {
      const parsedPayload = parseMessages(new Set(['feat(scope-here): test message 1']));
      expect(parsedPayload.types).toEqual(new Set(['feat']));
      expect(parsedPayload.scopes).toEqual(new Set(['scope-here']));
    });
    it('parses scope and breaking change', () => {
      const parsedPayload = parseMessages(new Set(['feat(scope-here)!: test message 1']));
      expect(parsedPayload.types).toEqual(new Set(['feat']));
      expect(parsedPayload.scopes).toEqual(new Set(['scope-here']));
      expect(parsedPayload.includesBreakingChange).toBeTruthy();
    });
    it('flags a breaking change', () => {
      const parsedPayload = parseMessages(new Set(['feat!: breaking change']));
      expect(parsedPayload.includesBreakingChange).toBeTruthy();
    });
    it('flags a breaking change even if subsequent messages are not breaking', () => {
      const parsedPayload = parseMessages(new Set(['feat!: breaking change', 'feat: not breaking change']));
      expect(parsedPayload.includesBreakingChange).toBeTruthy();
    });
  });
});
