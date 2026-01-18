/**
 * Jest Test Setup
 * Configures test environment and mocks
 */

import '@testing-library/jest-dom'

// Mock mongoose for unit tests
jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose')
    return {
        ...actualMongoose,
        connect: jest.fn().mockResolvedValue(undefined),
        connection: {
            readyState: 1,
            on: jest.fn(),
            once: jest.fn(),
        },
    }
})

// Global test timeout
jest.setTimeout(10000)

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks()
})
