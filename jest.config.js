module.exports = {
    roots: ['<rootDir>/src'],
    testPathIgnorePatterns: ['/ts-dist/'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testMatch: ['**/*.test.ts', '**/__snapshot__/**/*.snap'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironment: 'node',
};
