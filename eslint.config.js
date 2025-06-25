import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

// Detectar producción o entorno de build (production o preview en Vercel)
const isBuildEnv =
  process.env.NODE_ENV === 'production' ||
  process.env.VERCEL_ENV === 'production' ||
  process.env.VERCEL_ENV === 'preview'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-console': 'warn',
      'react/prop-types': 'warn',
      ...(isBuildEnv ? { '@typescript-eslint/no-unused-vars': 'off' } : {}),
    },
  },
)
