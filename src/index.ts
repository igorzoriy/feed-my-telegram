import * as dotenv from "dotenv-extended"
import * as Keyv from "keyv"
import { TelegramClient } from "messaging-api-telegram"
import { createLogger, format, transports } from "winston"
import { RssFeeder } from "./RssFeeder"
import { getJsonFromUrl } from "./utils"

(async () => {
    dotenv.load()

    const { combine, printf, timestamp, colorize } = format
    const pretty = printf((data) => `${data.timestamp} ${data.level}: ${data.message}`)
    const logger = createLogger({
        format: combine(
            timestamp(),
            colorize({ all: true }),
            pretty,
        ),
        transports: [
            new transports.Console(),
        ],
    })

    const storage = new Keyv("sqlite://./storage.sqlite")
    storage.on("error", (err) => logger.error(err))

    try {
        const client = TelegramClient.connect(process.env.TELEGRAM_ACCESS_TOKEN)
        const sources = await getJsonFromUrl(process.env.SOURCES_URL)
        sources.forEach((item) => {
            const feeder = new RssFeeder({
                channelId: item.channelId,
                client,
                logger,
                storage,
                uri: item.uri,
            })
            feeder.start()
        })
    } catch (ex) {
        logger.error(`Application - ${ex}`)
    }
})()

