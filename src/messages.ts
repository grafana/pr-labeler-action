import { warning as logWarning } from '@actions/core';
import { invertMapping } from './utils';
export const mapTypesToLabels = (
  payload: ParseMessagesPayload,
  labelMapping: { [p: string]: string[] },
  labelForBreakingChanges: string
): Set<string> => {
  const labels = new Set<string>();

  const typeToLabels: { [p: string]: string[] } = invertMapping(labelMapping);

  for (const type of payload.types) {
    const mappedLabels: string[] = typeToLabels[type];
    if (mappedLabels) {
      for (const label of mappedLabels) {
        labels.add(label);
      }
    } else {
      logWarning(`Type [${type}] did not map to a label. Check your label-mapping config`);
    }
  }

  if (payload.includesBreakingChange && labelForBreakingChanges) {
    labels.add(labelForBreakingChanges);
  }

  return labels;
};

type ParseMessagesPayload = {
  includesBreakingChange: boolean;
  scopes: Set<string>;
  types: Set<string>;
};

/**
 * Parses through messages and returns Sets of types, scopes, and whether breaking changes are included
 */
export const parseMessages = (messages: Set<string>): ParseMessagesPayload => {
  const typeRegex = /^(\w+)(\(.+\))?(!)?:\s.*/;

  const scopes = new Set<string>();
  const types = new Set<string>();
  let includesBreakingChange = false;

  for (const message of messages) {
    const match = typeRegex.exec(message);
    if (match) {
      const type = match[1];
      const scope = match[2] ? match[2].slice(1, -1) : null; // Remove the parentheses
      const isBreakingChange = !!match[3];

      types.add(type);

      if (isBreakingChange) {
        includesBreakingChange = true;
      }

      if (scope) {
        scopes.add(scope);
      }
    }
  }

  return {
    includesBreakingChange,
    scopes,
    types,
  };
};
