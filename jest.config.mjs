import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Putanja do tvoje Next.js aplikacije
  dir: './',
})

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}

export default createJestConfig(config)