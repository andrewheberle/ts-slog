import { describe, expect, it, vi } from "vitest"
import { Logger, LoggerError, LogLevel } from "../src"

describe("Logger", () => {
    describe("constructor", () => {
        it("should create logger with default settings", () => {
            const logger = new Logger()
            expect(logger.settings.minLevel).toBe(1)
            expect(logger.settings.logHandler).toBe(console.log)
        })

        it("should create logger with custom settings", () => {
            const customHandler = vi.fn()
            const logger = new Logger({
                minLevel: LogLevel.Warning,
                logHandler: customHandler
            })
            expect(logger.settings.minLevel).toBe(LogLevel.Warning)
            expect(logger.settings.logHandler).toBe(customHandler)
        })
    })
    
    describe('logging methods', () => {
        it('should log debug message', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Debug })
            
            logger.debug('test message')
            
            expect(handler).toHaveBeenCalledWith({
                level: 'DEBUG',
                message: 'test message'
            })
        })

        it('should log info message', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Info })
            
            logger.info('test message')
            
            expect(handler).toHaveBeenCalledWith({
                level: 'INFO',
                message: 'test message'
            })
        })

        it('should log warning message', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Warning })
            
            logger.warn('test message')
            
            expect(handler).toHaveBeenCalledWith({
                level: 'WARNING',
                message: 'test message'
            })
        })

        it('should log error message', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Error })
            
            logger.error('test message')
            
            expect(handler).toHaveBeenCalledWith({
                level: 'ERROR',
                message: 'test message'
            })
        })

        it('should include key-value pairs in log output', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Info })
            
            logger.info('test message', 'userId', '123', 'action', 'login')
            
            expect(handler).toHaveBeenCalledWith({
                level: 'INFO',
                message: 'test message',
                userId: '123',
                action: 'login'
            })
        })

        it('should throw error when key is not a string', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Info })
            
            expect(() => {
                logger.info('test message', 123, 'value')
            }).toThrow(LoggerError)
            expect(() => {
                logger.info('test message', 123, 'value')
            }).toThrow('key must be a string')
        })

        it('should respect minLevel setting', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Warning })
            
            logger.debug('should not log')
            logger.info('should not log')
            logger.warn('should log')
            logger.error('should log')
            
            expect(handler).toHaveBeenCalledTimes(2)
        })

        it('should handle undefined value when odd number of args', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Info })
            
            logger.info('test message', 'key1', 'value1', 'key2')
            
            expect(handler).toHaveBeenCalledWith({
                level: 'INFO',
                message: 'test message',
                key1: 'value1',
                key2: undefined
            })
        })
    })

    describe('with method', () => {
        it('should create new logger with context fields', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Info })
            
            const contextLogger = logger.with('userId', '123')
            contextLogger.info('test message')
            
            expect(handler).toHaveBeenCalledWith({
                level: 'INFO',
                message: 'test message',
                userId: '123'
            })
        })

        it('should be chainable', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Info })
            
            const contextLogger = logger
                .with('userId', '123')
                .with('requestId', 'abc')
            
            contextLogger.info('test message')
            
            expect(handler).toHaveBeenCalledWith({
                level: 'INFO',
                message: 'test message',
                userId: '123',
                requestId: 'abc'
            })
        })

        it('should maintain context fields across multiple log calls', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Info })
            
            const contextLogger = logger.with('userId', '123')
            
            contextLogger.info('first message')
            contextLogger.info('second message')
            
            expect(handler).toHaveBeenCalledTimes(2)
            expect(handler).toHaveBeenNthCalledWith(1, {
                level: 'INFO',
                message: 'first message',
                userId: '123'
            })
            expect(handler).toHaveBeenNthCalledWith(2, {
                level: 'INFO',
                message: 'second message',
                userId: '123'
            })
        })

        it('should allow per-call args to be added alongside context fields', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Info })
            
            const contextLogger = logger.with('userId', '123')
            contextLogger.info('test message', 'action', 'login')
            
            expect(handler).toHaveBeenCalledWith({
                level: 'INFO',
                message: 'test message',
                userId: '123',
                action: 'login'
            })
        })

        it('should allow per-call args to override context fields', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Info })
            
            const contextLogger = logger.with('userId', '123')
            contextLogger.info('test message', 'userId', '456')
            
            expect(handler).toHaveBeenCalledWith({
                level: 'INFO',
                message: 'test message',
                userId: '456'
            })
        })

        it('should not affect original logger', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Info })
            
            const contextLogger = logger.with('userId', '123')
            
            logger.info('original logger')
            contextLogger.info('context logger')
            
            expect(handler).toHaveBeenNthCalledWith(1, {
                level: 'INFO',
                message: 'original logger'
            })
            expect(handler).toHaveBeenNthCalledWith(2, {
                level: 'INFO',
                message: 'context logger',
                userId: '123'
            })
        })

        it('should throw error for odd number of arguments', () => {
            const logger = new Logger()
            
            expect(() => {
                logger.with('userId', '123', 'orphanKey')
            }).toThrow(LoggerError)
            expect(() => {
                logger.with('userId', '123', 'orphanKey')
            }).toThrow('with() requires an even number of arguments (key-value pairs)')
        })

        it('should throw error when key is not a string', () => {
            const logger = new Logger()
            
            expect(() => {
                logger.with(123, 'value')
            }).toThrow(LoggerError)
            expect(() => {
                logger.with(123, 'value')
            }).toThrow('key must be a string')
        })

        it('should inherit settings from parent logger', () => {
            const handler = vi.fn()
            const logger = new Logger({ 
                logHandler: handler, 
                minLevel: LogLevel.Warning 
            })
            
            const contextLogger = logger.with('userId', '123')
            
            contextLogger.debug('should not log')
            contextLogger.info('should not log')
            contextLogger.warn('should log')
            
            expect(handler).toHaveBeenCalledTimes(1)
            expect(handler).toHaveBeenCalledWith({
                level: 'WARNING',
                message: 'should log',
                userId: '123'
            })
        })

        it('should allow with() to be called with no arguments', () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler, minLevel: LogLevel.Info })
            
            const contextLogger = logger.with()
            contextLogger.info('test message')
            
            expect(handler).toHaveBeenCalledWith({
                level: 'INFO',
                message: 'test message'
            })
        })
    })
})