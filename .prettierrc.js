module.exports = {
    tabWidth: 4,
    trailingComma: 'all',
    bracketSpacing: false,
    arrowParens: 'always',
    singleQuote: true,
    printWidth: 120,
    proseWrap: 'always',
    overrides: [
        {
            files: '*.yml',
            options: {
                tabWidth: 2,
            },
        },
    ],
};
