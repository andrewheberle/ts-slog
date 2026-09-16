export interface LoggerSettings {
    logHandler?(output: Record<string, unknown>): void
    minLevel?: number
}

// log levels
export enum LogLevel {
    Debug = 0,
    Info,
    Warning,
    Error,
    None
}

export class LoggerError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "LoggerError"
        Object.setPrototypeOf(this, LoggerError.prototype)
    }
}

export class Logger {
    public settings: Required<LoggerSettings>
    private contextFields: Record<string, unknown>

    constructor(settings?: LoggerSettings, contextFields?: Record<string, unknown>) {
        this.settings = {
            minLevel: settings?.minLevel ?? 1,
            logHandler: settings?.logHandler ?? console.log,
        }
        this.contextFields = contextFields ?? {}
    }

    private _log(logLevelId: number, logLevelName: string, message: string, ...args: unknown[]): void {
        if (logLevelId < this.settings.minLevel) {
            return
        }

        const output: Record<string, unknown> = {
            level: logLevelName,
            message: message,
            ...this.contextFields
        }

        // loop over args and add as k/v pairs
        for (let i = 0; i < args.length; i += 2) {
            if (typeof args[i] !== "string") {
                throw new LoggerError("key must be a string")
            }

            const key = args[i] as string
            const value = i + 1 < args.length ? args[i + 1] : undefined
            output[key] = value
        }

        this.settings.logHandler(output)
    }

    /**
     * Logs a message at debug level
     * @param message - Message for log entry
     * @param args    - K/V pairs to log
     */
    public debug(message: string, ...args: unknown[]): void {
        this._log(LogLevel.Debug, "debug", message, ...args)
    }

    /**
     * Logs a message at info level
     * @param message - Message for log entry
     * @param args    - K/V pairs to log
     */
    public info(message: string, ...args: unknown[]): void {
        this._log(LogLevel.Info, "info", message, ...args)
    }

    /**
     * Logs a message at warning level
     * @param message - Message for log entry
     * @param args    - K/V pairs to log
     */
    public warn(message: string, ...args: unknown[]): void {
        this._log(LogLevel.Warning, "warning", message, ...args)
    }

    /**
     * Logs a message at error level
     * @param message - Message for log entry
     * @param args    - K/V pairs to log
     */
    public error(message: string, ...args: unknown[]): void {
        this._log(LogLevel.Error, "error", message, ...args)
    }

    /**
     * Creates a new Logger with additional context fields
     * @param args - K/V pairs to include in all log entries
     */
    public with(...args: unknown[]): Logger {
        if (args.length % 2 !== 0) {
            throw new LoggerError("with() requires an even number of arguments (key-value pairs)")
        }

        const newContextFields: Record<string, unknown> = { ...this.contextFields }

        // loop over args and add as k/v pairs
        for (let i = 0; i < args.length; i += 2) {
            if (typeof args[i] !== "string") {
                throw new LoggerError("key must be a string")
            }

            const key = args[i] as string
            const value = args[i + 1]
            newContextFields[key] = value
        }

        return new Logger(this.settings, newContextFields)
    }
}

const formatValue = (value: unknown): string => {
    if (typeof value === "object" && value !== null) {
        return JSON.stringify(value)
    }

    if (typeof value === "string" && /\s/.test(value)) {
        return JSON.stringify(value)
    }

    return String(value)
}

/**
 * A logHandler that formats output as a single line of text in the form:
 * `${level}: ${message} key=value ...` and writes it via console.log
 *
 * @param output - The log entry to format and write
 *
 * Example usage with Logger:
 *
 * const logger = new Logger({ logHandler: TextHandler })
 * logger.info("User logged in", "userId", 123)
 * // INFO: User logged in userId=123
 */
export const TextHandler = (output: Record<string, unknown>): void => {
    const { level, message, ...rest } = output

    const kvPairs = Object.entries(rest)
        .map(([key, value]) => `${key}=${formatValue(value)}`)
        .join(" ")

	// type check but should always be a string
	if (typeof level !== "string") {
        throw new LoggerError("level must be a string")
    }
    console.log(kvPairs ? `${level.toUpperCase()}: ${message} ${kvPairs}` : `${level.toUpperCase()}: ${message}`)
}

/**
 *
 * @param key - prefix for all keys in the group
 * @param args - K/V pairs to include in the group (must be an even number of arguments)
 * @returns An array of K/V pairs with keys prefixed by the group key
 * @throws LoggerError if the number of arguments is not even or if any key is not a string
 *
 * Example usage with Logger:
 *
 * const logger = new Logger()
 * logger.info("User logged in", ...group("user", "id", 123, "name", "Alice"))
 */
export const group = (key: string, ...args: unknown[]): unknown[] => {
    if (args.length % 2 !== 0) {
        throw new LoggerError("group() requires an even number of arguments (key-value pairs)")
    }

    const output: unknown[] = []

    for (let i = 0; i < args.length; i += 2) {
        if (typeof args[i] !== "string") {
            throw new LoggerError("key must be a string")
        }

        output.push(key + "." + args[i] as string, args[i + 1])
    }

    return output
}
