import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: {
    css: true,
  },
  ignores: ['**/*.svg'],
  rules: {
    'style/semi': 'off',
    'style/brace-style': 'off',
    'style/member-delimiter-style': [
      'warn',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },

        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
        multilineDetection: 'brackets',
      },
    ],
    'ts/ban-ts-comment': 'off',
    'ts/consistent-type-definitions': 'off',
    'style/indent': ['warn', 2],
    'no-console': 'off',
    'antfu/if-newline': 'off',
    'curly': ['off', 'multi', 'consistent'],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1,
        },
      },
    ],
    'vue/attribute-hyphenation': ['warn', 'never'],
    'vue/valid-v-model': ['off'],
    'vue/v-on-event-hyphenation': [
      'warn',
      'never',
      {
        autofix: true,
      },
    ],
  },
})
