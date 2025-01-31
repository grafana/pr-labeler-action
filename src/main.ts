import { getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { getConfig } from './utils/config';
import { addOrSetLabels, getCommitMessages, getRepositorylabels } from './github';
import { PullRequest } from './types';
import { mapTypesToLabels, parseMessages } from './messages';

async function run(): Promise<void> {
  try {
    const configPath = getInput('configuration-path');
    const prContext: PullRequest | undefined = context.payload.pull_request;

    if (!prContext) {
      throw new Error(
        "Payload doesn't contain `pull_request`. Make sure this Action is being triggered by a pull_request event (https://help.github.com/en/articles/events-that-trigger-workflows#pull-request-event-pull_request)."
      );
    }

    const ref = prContext.head.ref;
    const config = await getConfig(configPath, ref);

    const messageSet = new Set<string>();
    if (config['include-title']) {
      messageSet.add(prContext.title || '');
    }
    if (config['include-commits']) {
      const commitMessages = await getCommitMessages(prContext.number);
      if (commitMessages) {
        for (const message of commitMessages) {
          messageSet.add(message);
        }
      }
    }

    const parseMessagesPayload = parseMessages(messageSet);

    const labelsFromMessages = mapTypesToLabels(
      parseMessagesPayload,
      config['label-mapping'],
      config['label-for-breaking-changes']
    );

    const repoLabels = await getRepositorylabels();

    const missingLabels = new Set<string>();

    for (const label of labelsFromMessages) {
      if (!repoLabels.includes(label)) {
        missingLabels.add(label);
      }
    }

    if ([...missingLabels].length && !config['add-missing-labels']) {
      throw new Error(
        `Not all labels being added are included in the repository. Please add the labels ${JSON.stringify([
          ...missingLabels,
        ])} or set config["add-missing-labels"] to true`
      );
    }

    await addOrSetLabels(prContext.number, [...labelsFromMessages], config['clear-prexisting']);
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    }
  }
}

run();
