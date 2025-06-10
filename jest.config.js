module.exports = {
    testEnvironment: 'jsdom',

    transform: {
      "^.+\.(js|jsx|ts|tsx)$": "babel-jest",
    },

    moduleNameMapper: {
      "\.(css|less|sass|scss)$": "identity-obj-proxy",
      '^@/(.*)$': '<rootDir>/$1',
    },

    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],

    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    transformIgnorePatterns: [
      "/node_modules/(?!react-toastify)/"
    ],
  };