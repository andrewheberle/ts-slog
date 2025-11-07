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

    constructor(settings?: LoggerSettings) {
        this.settings = {
            minLevel: settings?.minLevel ?? 1,
            logHandler: settings?.logHandler ?? console.log,
        }
    }

    private _log(logLevelId: number, logLevelName: string, message: string, ...args: unknown[]): void {
        if (logLevelId < this.settings.minLevel) {
            return
        }

        const output: Record<string, unknown> = {
            level: logLevelName,
            message: message
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
     * Logs a message at DEBUG level
     * @param message - Message for log entry
     * @param args    - K/V pairs to log
     */
    public debug(message: string, ...args: unknown[]): void {
        this._log(LogLevel.Debug, "DEBUG", message, ...args)
    }

    /**
     * Logs a message at INFO level
     * @param message - Message for log entry
     * @param args    - K/V pairs to log
     */
    public info(message: string, ...args: unknown[]): void {
        this._log(LogLevel.Info, "INFO", message, ...args)
    }

    /**
     * Logs a message at WARNING level
     * @param message - Message for log entry
     * @param args    - K/V pairs to log
     */
    public warn(message: string, ...args: unknown[]): void {
        this._log(LogLevel.Warning, "WARNING", message, ...args)
    }

    /**
     * Logs a message at ERROR level
     * @param message - Message for log entry
     * @param args    - K/V pairs to log
     */
    public error(message: string, ...args: unknown[]): void {
        this._log(LogLevel.Error, "ERROR", message, ...args)
    }
}
