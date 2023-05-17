import * as core from '@actions/core'
import * as github from '@actions/github'
import {getConfig} from './utils/config'
import {getCommitMessages, getLabels, getRepositorylabels} from './github'
import {PullRequest} from './types'

async function run(): Promise<void> {
  try {
    const configPath = core.getInput('configuration-path')
    const prContext: PullRequest | undefined =
      github.context.payload.pull_request

    if (!prContext) {
      throw new Error(
        "Payload doesn't contain `pull_request`. Make sure this Action is being triggered by a pull_request event (https://help.github.com/en/articles/events-that-trigger-workflows#pull-request-event-pull_request)."
      )
    }

    const ref = prContext.head.ref
    const config = await getConfig(configPath, ref)
    const repoLabels = await getRepositorylabels()

    const stringsToGetLabelsFor = []
    if (config['include-title']) {
      stringsToGetLabelsFor.push(prContext.title)
    }
    if (config['include-commits']) {
      stringsToGetLabelsFor.push(getCommitMessages(prContext.number))
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
