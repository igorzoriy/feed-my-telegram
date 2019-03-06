import * as dotenv from "dotenv-extended"
import * as Keyv from "keyv"
import { TelegramClient } from "messaging-api-telegram"
import * as Twitter from "twitter"
import { createLogger, format, transports } from "winston"
import { Feeder } from "./Feeder"
import { RssFeeder } from "./RssFeeder"
import { TwitterFeeder } from "./TwitterFeeder"
import { getJsonFromUrl } from "./utils"
import { YoutubeClient } from "./YoutubeClient"
import { YoutubeFeeder } from "./YoutubeFeeder"

(async () => {
    dotenv.load()

    let feeders: Feeder[] = []

    const shutdown = () => {
        feeders.forEach((feeder) => feeder.stop())
        process.exit(0)
    }

    process.on("SIGINT", shutdown)
    process.on("SIGTERM", shutdown)
    process.on("uncaughtException", (ex) => {
        logger.error(`Application - ${ex}`)
    })

    const sources = await getJsonFromUrl(process.env.SOURCES_URL)

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

    const storage = new Keyv("sqlite://./data/storage.sqlite")
    storage.on("error", (err) => logger.error(err))

    const telegramClient = TelegramClient.connect(process.env.TELEGRAM_ACCESS_TOKEN)
    const twitterClient = new Twitter({
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    })
    const youtubeClient = new YoutubeClient(process.env.YOUTUBE_API_KEY)

    feeders = sources.map((item) => {
        let feeder: Feeder
        if (item.type === "rss") {
            feeder = new RssFeeder({
                channelId: item.channelId,
                logger,
                storage,
                telegramClient,
                uri: item.uri,
            })
        } else if (item.type === "twitter") {
            feeder = new TwitterFeeder({
                channelId: item.channelId,
                logger,
                screenName: item.screenName,
                storage,
                telegramClient,
                twitterClient,
            })
        } else if (item.type === "youtube") {
            feeder = new YoutubeFeeder({
                channelId: item.channelId,
                logger,
                storage,
                telegramClient,
                youtubeChannelId: item.youtubeChannelId,
                youtubeClient,
            })
        }
        feeder.start()
        return feeder
    })
})()
