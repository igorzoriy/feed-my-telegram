import * as dotenv from "dotenv-extended"
import * as Keyv from "keyv"
import { TelegramClient } from "messaging-api-telegram"
import { createLogger, format, transports } from "winston"
import * as sources from "../sources.json"
import { RssFeeder } from "./RssFeeder"

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

const client = TelegramClient.connect(process.env.TELEGRAM_ACCESS_TOKEN)
const storage = new Keyv("sqlite://./storage.sqlite")
storage.on("error", (err) => logger.error(err))

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
