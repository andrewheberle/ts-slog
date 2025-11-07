import { describe, it, expect, vi } from "vitest"
import { Logger, LogLevel, LoggerError } from "./index"

describe("Logger", () => {
    describe("Construction", () => {
        it("should create logger with default settings", () => {
            const logger = new Logger()
            expect(logger.settings.minLevel).toBe(1)
        })

        it("should create logger with custom minLevel", () => {
            const logger = new Logger({ minLevel: LogLevel.Error })
            expect(logger.settings.minLevel).toBe(LogLevel.Error)
        })

        it("should create logger with custom logHandler", () => {
            const customHandler = vi.fn()
            const logger = new Logger({ logHandler: customHandler })
            expect(logger.settings.logHandler).toBe(customHandler)
        })
    })

    describe("Log levels", () => {
        it("should call logHandler for debug messages when minLevel is Debug", () => {
            const handler = vi.fn()
            const logger = new Logger({ minLevel: LogLevel.Debug, logHandler: handler })
            
            logger.debug("test message")
            
            expect(handler).toHaveBeenCalledWith({
                level: "DEBUG",
                message: "test message"
            })
        })

        it("should call logHandler for info messages", () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler })
            
            logger.info("test message")
            
            expect(handler).toHaveBeenCalledWith({
                level: "INFO",
                message: "test message"
            })
        })

        it("should call logHandler for warning messages", () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler })
            
            logger.warn("test message")
            
            expect(handler).toHaveBeenCalledWith({
                level: "WARNING",
                message: "test message"
            })
        })

        it("should call logHandler for error messages", () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler })
            
            logger.error("test message")
            
            expect(handler).toHaveBeenCalledWith({
                level: "ERROR",
                message: "test message"
            })
        })

        it("should not log when level is below minLevel", () => {
            const handler = vi.fn()
            const logger = new Logger({ minLevel: LogLevel.Warning, logHandler: handler })
            
            logger.debug("debug message")
            logger.info("info message")
            
            expect(handler).not.toHaveBeenCalled()
        })

        it("should log when level is at or above minLevel", () => {
            const handler = vi.fn()
            const logger = new Logger({ minLevel: LogLevel.Warning, logHandler: handler })
            
            logger.warn("warning message")
            logger.error("error message")
            
            expect(handler).toHaveBeenCalledTimes(2)
        })
    })

    describe("Key-value pairs", () => {
        it("should include key-value pairs in output", () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler })
            
            logger.info("test message", "key1", "value1", "key2", 123)
            
            expect(handler).toHaveBeenCalledWith({
                level: "INFO",
                message: "test message",
                key1: "value1",
                key2: 123
            })
        })

        it("should handle odd number of args by setting last key to undefined", () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler })
            
            logger.info("test message", "key1", "value1", "key2")
            
            expect(handler).toHaveBeenCalledWith({
                level: "INFO",
                message: "test message",
                key1: "value1",
                key2: undefined
            })
        })

        it("should handle no key-value pairs", () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler })
            
            logger.info("test message")
            
            expect(handler).toHaveBeenCalledWith({
                level: "INFO",
                message: "test message"
            })
        })
    })

    describe("Error handling", () => {
        it("should throw LoggerError when key is not a string", () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler })
            
            expect(() => {
                logger.info("test message", 123 as any, "value")
            }).toThrow(LoggerError)
            
            expect(() => {
                logger.info("test message", 123 as any, "value")
            }).toThrow("key must be a string")
        })

        it("should not call handler when error is thrown", () => {
            const handler = vi.fn()
            const logger = new Logger({ logHandler: handler })
            
            try {
                logger.info("test message", 123 as any, "value")
            } catch {
                // Ignore error
            }
            
            expect(handler).not.toHaveBeenCalled()
        })
    })
})
