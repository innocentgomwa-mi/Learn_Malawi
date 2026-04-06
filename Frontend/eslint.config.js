import js from '@eslint/js'
import globals from 'globals'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReactRefresh from 'eslint-plugin-react-refresh'
import pluginUnusedImports from 'eslint-plugin-unused-imports'
import { defineConfig } from 'eslint/config'

export default defineConfig({
  ignores: ['dist'],
  overrides: [
    {
      files: ['**/*.{js,jsx}'],
      ignores: ['src/lib/**/*', 'src/components/ui/**/*'],
      ...js.configs.recommended,
      ...pluginReact.configs.flat.recommended,
      languageOptions: {
        globals: globals.browser,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
          ecmaFeatures: { jsx: true },
        },
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
      plugins: {
        react: pluginReact,
        'react-hooks': pluginReactHooks,
        'react-refresh': pluginReactRefresh,
        'unused-imports': pluginUnusedImports,
      },
      rules: {
        'no-unused-vars': 'off',
        'react/jsx-uses-vars': 'error',
        'react/jsx-uses-react': 'error',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/no-unknown-property': [
          'error',
          { ignore: ['cmdk-input-wrapper', 'toast-close'] },
        ],
        'react-hooks/rules-of-hooks': 'error',
      },
    },
  ],
})
