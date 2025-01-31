import { load as loadYaml } from 'js-yaml';
import { getInput, warning as logWarning } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { invertMapping } from './index';

export const defaultConfig = {
  'add-missing-labels': false,
  'clear-prexisting': true,
  'include-commits': false,
  'include-title': true,
  'label-for-breaking-changes': 'breaking',
  'label-mapping': {
    bugfix: ['fix'],
    configuration: ['build', 'ci'],
    documentation: ['docs'],
    feature: ['feat'],
    misc: ['chore', 'performance', 'refactor', 'style'],
    test: ['test'],
  },
};

export type Config = typeof defaultConfig;

type HttpError = typeof Error & { status: number | undefined };

export async function getConfig(path: string, ref: string): Promise<Config> {
  try {
    const client = getOctokit(getInput('token'));
    const response = await client.rest.repos.getContent({
      ...context.repo,
      path,
      ref,
    });

    if ('content' in response.data) {
      const config = { ...defaultConfig, ...parseConfig(response.data.content) };
      validate(config);
      return config;
    }

    throw new Error(`${path} does not point to a config file`);
  } catch (e) {
    // File wasn't found returning the default config
    if ((e as HttpError).status === 404) {
      logWarning(`[${path}] was not found; returning default config`);
      return defaultConfig;
    }
    throw e;
  }
}

const validate = (config: Config): void => {
  if (!config['include-title'] && !config['include-commits']) {
    throw new Error('At least one of ["include-title","include-commits"] must be enabled');
  }
  if (!Object.keys(config['label-mapping']).length) {
    throw new Error('At least one label-mapping needs to be provided');
  }

  const typeToLabels = invertMapping(config['label-mapping']);

  const mapsToSingle = Object.values(typeToLabels).every((value) => value.length === 1);
  if (!mapsToSingle) {
    logWarning('config[label-mapping] maps multiple labels to a single type');
  }
};

const parseConfig = (content: string): Config => {
  const decodedContent = Buffer.from(content, 'base64').toString();
  const parsedConfig = loadYaml(decodedContent);

  const isValidConfig = Object.keys(parsedConfig as object).every((key) => Object.keys(defaultConfig).includes(key));

  if (!isValidConfig) {
    throw new Error('The parsed file was not valid; check ');
  }
  return parsedConfig as Config;
};
