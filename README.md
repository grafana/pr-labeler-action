<p align="center">
  <a href="https://github.com/grafana/pr-labeler-action/actions"><img alt="pr-labeler-action status" src="https://github.com/grafana/pr-labeler-action/workflows/build-test/badge.svg"></a>
</p>

# PR Labeler Action

Yet another iteration on a PR labeler action. This action will add labels to your PR based on the PR title and/or commit
messages. It does so by parsing the strings in a conventional commitish way. Meaning that it doesn't validate types, but
it does follow the syntax of `type(scope)!: message` where `(scope)` and `!` are optional.

## Inputs

| key                  | description                                                                                                         | default              | required |
|----------------------|---------------------------------------------------------------------------------------------------------------------|----------------------|----------|
| `configuration-path` | Path to the configuration file                                                                                      | `.github/pr-labeler` | `false`  |
| `token`              | Github access token with `contents: read`, `issues: read`, `pull-requests: write` permissions to add labels to a PR |                      | `true`   |

## Configuration

There is a default configuration that is provided, but if you would like to customize it add `pr-labeler.yml` to the
`.github/` directory.

| key                          | type      | default                               | description                                                                      |
|------------------------------|-----------|---------------------------------------|----------------------------------------------------------------------------------|
| `add-missing-labels`         | `boolean` | `false`                               | Whether missing labels should be added to the repository                         |
| `clear-prexisting`           | `boolean` | `true`                                | Whether the prexisting labels on the PR should be removed                        |
| `include-commits`            | `boolean` | `false`                               | Whether to consider commit messages when adding labels                           |
| `include-title`              | `boolean` | `true`                                | Whether to consider the pr title when adding labels                              |
| `label-for-breaking-changes` | `string`  | `breaking`                            | The label to be used for breaking changes. Can be set to empty string to ignore  |
| `label-mapping`              | `object`  | [See default config](#default-config) | Label to array of types for mapping. Labels and types can be whatever you decide |

### Default config

```yaml
add-missing-labels: false # Whether to add missing labels to the repository
clear-prexisting: true # Whether to remove preexisting labels from the PR in favor of the generated one
include-commits: false # Consider the PR commit messages when adding labels
include-title: true # Consider the PR title when adding labels
label-for-breaking-changes: 'breaking' # Label to be used when the message has the breaking change syntax '!:' E.g. "feat!: This break things"
label-mapping: # Label to array of types for mapping
  bugfix: [ 'fix' ]
  configuration: [ 'build', 'ci' ]
  documentation: [ 'docs' ]
  feature: [ 'feat' ]
  misc: [ 'chore','performance','refactor','style' ]
  test: [ 'test' ]
```

## Example usage

```yaml
# .github/pr-labeler.yml
add-missing-labels: true
label-mapping:
  bugfix: [ 'fix', 'bug' ]
  feature: [ 'feat', 'feature' ]
  misc: [ 'chore','performance','refactor','style' ]
```

```yaml
# .github/workflows/label-prs.yml
name: 'Label PR'
on:
  pull_request:

jobs:
  label-pr:
    permissions:
      contents: read
      issues: read
      pull-requests: write
    runs-on: ubuntu-latest
    steps:
      - uses: grafana/pr-labeler-action@v0.1.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

> [!IMPORTANT]
> Permissions are specified within the job definition. This prevents permitting more than is needed in other jobs.
> 
> If you prefer not using the generated `secrets.GITHUB_TOKEN` you can use a PAT or Github App (recommended) token with the correct permissions and omit the permissions block

The above example workflow will do the following

- Add any labels that are missing in the repository
- Map types to the three labels `bugfix`, `feature`, and `misc`
- If the PR title indicates a breaking change E.g. `feat!: add this feature` (notice the `!`) it will also add
  the `breaking` label
