import * as core from '@actions/core'
import * as github from '@actions/github'

const token = core.getInput('token')

export const getCommitMessages = async (
  pullRequestNumber: number
): Promise<string[] | undefined> => {
  const client = github.getOctokit(token)
  const commits = await client.rest.pulls.listCommits({
    ...github.context.repo,
    pull_number: pullRequestNumber
  })

  return commits.data.map(commit => commit.commit.message)
}

export const getLabels = async (
  pullRequestNumber: number
): Promise<string[]> => {
  const client = github.getOctokit(token)
  const labels = await client.rest.issues.listLabelsOnIssue({
    ...github.context.repo,
    issue_number: pullRequestNumber
  })

  return labels.data.map(label => label.name)
}

export const getRepositorylabels = async (): Promise<string[]> => {
  const client = github.getOctokit(token)
  const labels = await client.rest.issues.listLabelsForRepo({
    ...github.context.repo
  })
  return labels.data.map(label => label.name)
}

export const addOrSetLabels = async (
  pullRequestNumber: number,
  labels: string[],
  clearPrexisting: boolean
): Promise<void> => {
  const client = github.getOctokit(token)
  await client.rest.issues[clearPrexisting ? 'setLabels' : 'addLabels']({
    ...github.context.repo,
    issue_number: pullRequestNumber,
    labels
  })
}
