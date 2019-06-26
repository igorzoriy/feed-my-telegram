import { createLogger, format, transports } from "winston"

const { combine, printf, timestamp, colorize } = format
const pretty = printf((data) => `${data.timestamp} ${data.level}: ${data.message}`)

export const getLogger = () => {
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
