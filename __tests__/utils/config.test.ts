import { createSandbox } from 'sinon';
// eslint-disable-next-line import/no-namespace
import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';

import { defaultConfig, getConfig } from '../../src/utils/config';

describe('config', () => {
  const sandbox = createSandbox();
  const getContentStub = sandbox.stub();
  beforeEach(() => {
    sandbox.stub(github.context, 'repo').value({ owner: 'org', repo: 'repo' });
    sandbox.stub(github, 'getOctokit').returns({
      rest: {
        repos: {
          getContent: getContentStub.returns(Promise.resolve({ data: {} })),
        },
      },
    } as unknown as InstanceType<typeof GitHub>);
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('throws an error if the path does not point to a config file', async () => {
    await expect(getConfig('.github/test-config.yml', 'mybranch')).rejects.toThrow(
      '.github/test-config.yml does not point to a config file'
    );
  });

  it('returns default config if the file was not found', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    getContentStub.returns(Promise.reject({ status: 404 }));
    const config = await getConfig('.github/test-config.yml', 'mybranch');

    expect(config).toEqual(defaultConfig);
  });

  it('returns config merged with default values', async () => {
    const exampleConfig = `
add-missing-labels: true
clear-prexisting: false
`;

    getContentStub.returns(
      Promise.resolve({
        data: {
          content: Buffer.from(exampleConfig).toString('base64'),
        },
      })
    );
    const config = await getConfig('.github/test-config.yml', 'mybranch');

    expect(config['add-missing-labels']).toBeTruthy(); // not default
    expect(config['clear-prexisting']).toBeFalsy(); // not default
    expect(config['label-mapping']).toEqual(defaultConfig['label-mapping']);
    expect(config['include-title']).toEqual(defaultConfig['include-title']);
  });
  describe('config validation', () => {
    it('throws error if title and commits are disabled in config', async () => {
      const exampleConfig = `
include-title: false
include-commits: false
`;

      getContentStub.returns(
        Promise.resolve({
          data: {
            content: Buffer.from(exampleConfig).toString('base64'),
          },
        })
      );
      await expect(getConfig('.github/test-config.yml', 'mybranch')).rejects.toThrow(
        'At least one of ["include-title","include-commits"] must be enabled'
      );
    });
    it('throws error if no label mappings provided', async () => {
      const exampleConfig = `
label-mapping: {}
`;
      getContentStub.returns(
        Promise.resolve({
          data: {
            content: Buffer.from(exampleConfig).toString('base64'),
          },
        })
      );
      await expect(getConfig('.github/test-config.yml', 'mybranch')).rejects.toThrow(
        'At least one label-mapping needs to be provided'
      );
    });
  });
});
