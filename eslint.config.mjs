import globals from 'globals';
import pluginJs from '@eslint/js';
// eslint-disable-next-line import/no-unresolved
import tseslint from 'typescript-eslint';
import pluginJest from 'eslint-plugin-jest';
import github from 'eslint-plugin-github';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.spec.{js,mjs,cjs,ts}', '**/*.test.{js,mjs,cjs,ts}'], ...pluginJest.configs['flat/recommended'] },
  github.getFlatConfigs().browser,
  github.getFlatConfigs().recommended,
  ...github.getFlatConfigs().typescript,
  eslintPluginPrettierRecommended,
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'i18n-text/no-en': 'off',
    },
  },
  { ignores: ['dist/', '.yarn/', 'lib/'] },
];
