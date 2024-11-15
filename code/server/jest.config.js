module.exports = {
    testTimeout: 10000,
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/**test**/**/*.test.ts'],
    reporters: ["default"],
    collectCoverage: true, // Abilita la raccolta della coverage
  coverageDirectory: './coverage', // La cartella dove Jest salverà i report di coverage
  coverageReporters: ['lcov', 'text'], // Genera il report in formato LCOV e anche una sintesi nel terminale
  coveragePathIgnorePatterns: [
    '/node_modules/', // Ignora la cartella node_modules
    '/dist/', // Ignora i file di build (se li hai)
  ],
}
