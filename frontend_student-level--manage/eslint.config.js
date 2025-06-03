import eslint from '@eslint/js'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import vuePlugin from 'eslint-plugin-vue'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'

export default [
  // 基本配置
  eslint.configs.recommended, // 使用 ESLint 的推荐配置

  // 设置全局变量
  {
    languageOptions: {
      globals: {
        ...globals.browser, // 启用浏览器环境的全局变量，例如 localStorage 和 URL
      },
    },
  },

  // Vue 配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: {
          ts: tsParser,
          js: 'espree',
        },
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      vue: vuePlugin,
    },
    rules: {
      'vue/valid-v-for': 'warn', // 这里可以手动配置 Vue 3 规则
    },
  },

  // TypeScript 配置
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Vitest 配置
  {
    files: ['**/__tests__/**/*'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    plugins: {
      vitest: {
        rules: {
          'vitest/expect-expect': 'error',
          'vitest/no-identical-title': 'error',
        },
      },
    },
  },

  // Prettier 配置
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          printWidth: 100,
          trailingComma: 'es5',
          endOfLine: 'auto',
        },
      ],
    },
  },

  // 全局配置
  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**'],
  },
]
