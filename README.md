# @andrewheberle/ts-slog

A simple structured logger for TypeScript applications.

## Installation
```bash
npm install @andrewheberle/ts-slog
```

## Usage

### Basic Example
```typescript
import { Logger } from '@andrewheberle/ts-slog'

const logger = new Logger()

logger.info("Application started")
logger.debug("Debug information", "userId", 123, "action", "login")
logger.warn("Warning message", "retries", 3)
logger.error("An error occurred", "errorCode", 500)
```

### Log Levels

The logger supports four log levels:

- `Debug` (0) - Detailed debugging information
- `Info` (1) - General informational messages (default)
- `Warning` (2) - Warning messages
- `Error` (3) - Error messages

### Configuration

Configure the minimum log level when creating a logger instance:
```typescript
import { Logger, LogLevel } from '@andrewheberle/ts-slog'

// Only log warnings and errors
const logger = new Logger({ minLevel: LogLevel.Warning })

logger.debug("This won't be logged")
logger.info("This won't be logged either")
logger.warn("This will be logged")
logger.error("This will be logged too")
```

### Adding Context

Add key-value pairs to log entries by passing additional arguments:
```typescript
logger.info(
    "User logged in",
    "userId", 123,
    "username", "john.doe",
    "ip", "192.168.1.1"
)

// Output:
// {
//   level: 'INFO',
//   message: 'User logged in',
//   userId: 123,
//   username: 'john.doe',
//   ip: '192.168.1.1'
// }
```

## API

### `new Logger(settings?)`

Creates a new logger instance.

**Parameters:**
- `settings` (optional): Configuration object
  - `minLevel`: Minimum log level (default: `LogLevel.Info`)

### Methods

- `debug(message: string, ...args: unknown[]): void` - Log at DEBUG level
- `info(message: string, ...args: unknown[]): void` - Log at INFO level
- `warn(message: string, ...args: unknown[]): void` - Log at WARNING level
- `error(message: string, ...args: unknown[]): void` - Log at ERROR level

All methods accept a message string followed by optional key-value pairs.

## License

MIT
