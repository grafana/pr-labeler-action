import yaml from 'js-yaml'
import * as core from '@actions/core'
import * as github from '@actions/github'

export const defaultConfig = {
  'add-missing-labels': false,
  'clear-prexisting': true,
  'include-commits': false,
  'include-title': true,
  'label-mapping': {
    bugfix: ['fix'],
    configuration: ['build', 'ci'],
    documentation: ['docs'],
    feature: ['feat'],
    misc: ['chore', 'performance', 'refactor', 'style'],
    test: ['test']
  },
  types: [
    'build',
    'chore',
    'ci',
    'docs',
    'feat',
    'fix',
    'perf',
    'refactor',
    'style',
    'test'
  ]
}

export type Config = typeof defaultConfig

type HttpError = typeof Error & {status: number | undefined}
export async function getConfig(path: string, ref: string): Promise<Config> {
  try {
    const client = github.getOctokit(core.getInput('token'))
    const response = await client.rest.repos.getContent({
      ...github.context.repo,
      path,
      ref
    })

    if ('content' in response.data) {
      const config = {...defaultConfig, ...parseConfig(response.data.content)}
      validate(config)
      return config
    }

    throw new Error(`${path} does not point to a config file`)
  } catch (e) {
    // File wasn't found returning the default config
    if ((e as HttpError).status === 404) {
      core.warning(`[${path}] was not found; returning default config`)
      return defaultConfig
    }
    throw e
  }
}

const validate = (config: Config): void => {
  if (!config['include-title'] && !config['include-commits']) {
    throw new Error(
      'At least one of ["include-title","include-commits"] must be enabled'
    )
  }
  if (!Object.keys(config['label-mapping']).length) {
    throw new Error('At least one label-mapping needs to be provided')
  }
}

const parseConfig = (content: string): Config => {
  const decodedContent = Buffer.from(content, 'base64').toString()
  const parsedConfig = yaml.load(decodedContent)

  const isValidConfig = Object.keys(parsedConfig as object).every(key =>
    Object.keys(defaultConfig).includes(key)
  )

  if (!isValidConfig) {
    throw new Error('The parsed file was not valid; check ')
  }
  return parsedConfig as Config
}
