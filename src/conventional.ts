import * as core from '@actions/core'

export const getCommitTypes = (): string[] => {
  return core.getInput('commit-types').split(',')
}
