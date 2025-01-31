import { getInput } from '@actions/core';
import { context, getOctokit } from '@actions/github';

const token = getInput('token');

export const getCommitMessages = async (pullRequestNumber: number): Promise<string[] | undefined> => {
  const client = getOctokit(token);
  const commits = await client.rest.pulls.listCommits({
    ...context.repo,
    pull_number: pullRequestNumber,
  });

  return commits.data.map((commit) => commit.commit.message);
};

export const getLabels = async (pullRequestNumber: number): Promise<string[]> => {
  const client = getOctokit(token);
  const labels = await client.rest.issues.listLabelsOnIssue({
    ...context.repo,
    issue_number: pullRequestNumber,
  });

  return labels.data.map((label) => label.name);
};

export const getRepositorylabels = async (): Promise<string[]> => {
  const client = getOctokit(token);
  const labels = await client.rest.issues.listLabelsForRepo({
    ...context.repo,
  });
  return labels.data.map((label) => label.name);
};

export const addOrSetLabels = async (
  pullRequestNumber: number,
  labels: string[],
  clearPrexisting: boolean
): Promise<void> => {
  const client = getOctokit(token);
  await client.rest.issues[clearPrexisting ? 'setLabels' : 'addLabels']({
    ...context.repo,
    issue_number: pullRequestNumber,
    labels,
  });
};
