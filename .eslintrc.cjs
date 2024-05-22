module.exports = {
  extends: ['eslint-config/typescript'].map(require.resolve),
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  plugins: ['react-refresh'],
  rules: {
    'react/react-in-jsx-scope': 0,
    'no-console': ['warn'],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
          'error',
          {
              argsIgnorePattern: '^_',
              varsIgnorePattern: '^_',
              caughtErrorsIgnorePattern: '^_'
          }
      ]
  },
}
