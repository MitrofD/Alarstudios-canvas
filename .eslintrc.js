const commonExtensions = [
  '.coffee',
  '.js',
  '.ts',
  '.mjs',
];

module.exports = {
  env: {
    browser: true,
  },
  extends: [
    'airbnb-base',
  ],
  overrides: [{
    files: [
      '*.coffee',
    ],
    parser: 'eslint-plugin-coffee',
    plugins: [
      'coffee',
    ],
    extends: [
      'plugin:coffee/airbnb-base',
    ],
    rules: {
      'coffee/vars-on-top': 0,
      'coffee/no-unused-vars': 0,
    },
  }, {
    files: [
      '*.ts',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: './src/tsconfig.json',
    },
    extends: [
      'airbnb-typescript/base',
    ],
  }],
  parserOptions: {
    extraFileExtensions: commonExtensions,
  },
  plugins: [
    'html',
    'import',
  ],
  root: true,
  rules: {
    'dot-notation': 0,
    'function-paren-newline': 0,
    'max-len': 0,
    'no-underscore-dangle': 0,
    'no-bitwise': 0,
    'no-console': 1,
    'no-continue': 0,
    'no-unused-vars': 1,
    'no-extend-native': 0,
    'no-multiple-empty-lines': [2, {
      max: 2,
    }],
    'prefer-const': 1,
    'radix': 0,
    'import/no-extraneous-dependencies': 0,
    'import/extensions': [2, 'ignorePackages', {
      coffee: 'never',
      ts: 'never',
      js: 'never',
      mjs: 'never',
    }],
    '@typescript-eslint/no-unused-vars': 0,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: commonExtensions,
      },
    },
    'import/extensions': commonExtensions,
  },
};
