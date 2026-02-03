const path = require('path');
const { FlatCompat } = require('@eslint/eslintrc');

/**
 * ESLint v9 uses the "flat config" system by default and no longer reads `eslintConfig`
 * from package.json. We keep using the existing React Native community config by
 * adapting it via FlatCompat.
 */
const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

module.exports = [
  // Adapt legacy shareable configs to flat config.
  ...compat.extends('@react-native-community', 'prettier'),

  // Project-specific ignores (kept in sync with previous eslintIgnore).
  {
    ignores: ['node_modules/**', 'lib/**'],
  },

  // Preserve the previous prettier rule customization.
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          quoteProps: 'consistent',
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          useTabs: false,
        },
      ],
    },
  },
];
