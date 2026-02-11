import js from '@eslint/js'
import globals from 'globals'          // ← make sure this is imported
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'src/pages/Auth/components/**']),

  // Browser + React rules (your existing config)
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',                    // usually already implied, but explicit is good
      globals: globals.browser,                // ← browser globals (window, document, etc.)
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^(motion|[A-Z_])' }],
    },
  },

  // Add this new object → applies Node globals only to your scripts folder
  {
    files: ['scripts/**/*.{js,cjs}'],          // or ['scripts/**'] if you want to be broader
    languageOptions: {
      globals: {
        ...globals.node,                       // ← adds process, __dirname, require, module, etc.
      },
      sourceType: 'commonjs',                  // important for require/module
    },
    rules: {
      // Optional: you can relax some rules just for scripts if needed
      // 'no-console': 'off',
      // 'no-process-exit': 'off',
    },
  },
])