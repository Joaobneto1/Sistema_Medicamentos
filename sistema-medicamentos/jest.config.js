export default {
    transform: {
        "^.+\\.[jt]sx?$": "babel-jest"
    },
    transformIgnorePatterns: [
        "node_modules/(?!(axios)/)"
    ],
    moduleNameMapper: {
        "\\.(css|less|scss)$": "identity-obj-proxy",
        "^@vercel/analytics/react$": "<rootDir>/mocks/vercelAnalyticsMock.js"
    },
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
};