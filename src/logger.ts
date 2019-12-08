import { createLogger, format, Logger, transports } from "winston"

const { combine, printf, timestamp, colorize } = format
const pretty = printf((data) => `${data.timestamp} ${data.level}: ${data.message}`)

export const getLogger = (): Logger => {
    return createLogger({
        format: combine(
            timestamp(),
            colorize({ all: true }),
            pretty,
        ),
        transports: [
            new transports.Console(),
        ],
    })
}
