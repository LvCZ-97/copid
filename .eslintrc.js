module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
        browser: true,
    },
    parser: 'vue-eslint-parser',
    plugins: ['vue', '@typescript-eslint'],
    extends: ['standard', 'plugin:@typescript-eslint/recommended', 'plugin:vue/vue3-essential', 'prettier'],
    parserOptions: {
        ecmaVersion: 2022,
        ecmaFeatures: {
            jsx: true,
        },
        parser: '@typescript-eslint/parser',
    },
    rules: {
        'no-new': 'off',
        'no-void': 'off',
        'no-empty-pattern': 'off',
        'no-use-before-define': 'off',
        'no-case-declarations': 'off',
        'import/no-absolute-path': 'off',
        semi: ['error', 'always'],
        'import/no-named-default': 'off',
        indent: [
            'error',
            4,
            {
                SwitchCase: 1,
            },
        ],
        'prefer-promise-reject-errors': [
            'off',
            {
                allowEmptyReject: true,
            },
        ],
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/explicit-module-boundary-types': 'off',
            },
        },
    ],
};
