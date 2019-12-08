import * as dotenv from "dotenv-extended"
import * as Keyv from "keyv"
import { TelegramClient } from "messaging-api-telegram"
import * as RssParser from "rss-parser"
import * as Twitter from "twitter"
import { getLogger } from "./logger"
import { rssTask } from "./rss"
import { start } from "./scheduler"
import { ISource, SourceDelays, SourceTypes } from "./sources"
import { twitterTask } from "./twitter"
import { getJsonFromUrl } from "./utils"
import { youtubeTask } from "./youtube"
import { YoutubeClient } from "./YoutubeClient"

(async () => {
    dotenv.load()

    const stoppers: Array<() => void> = []
    const logger = getLogger()

    const shutdown = () => {
        stoppers.forEach((stop) => stop())
        process.exit(0)
    }

    process.on("SIGINT", shutdown)
    process.on("SIGTERM", shutdown)
    process.on("uncaughtException", (ex) => {
        logger.error(`Application - ${ex}`)
    })

    let sources: ISource[] = []
    try {
        sources = await getJsonFromUrl(process.env.SOURCES_URL)
    } catch (ex) {
        logger.error(`Application - ${ex}`)
        process.exit()
    }

    const storage = new Keyv("sqlite://./data/storage.sqlite")
    storage.on("error", (err) => logger.error(err))

    const rssParser = new RssParser()
    const telegramClient = TelegramClient.connect(process.env.TELEGRAM_ACCESS_TOKEN)
    const twitterClient = new Twitter({
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    })
    const youtubeClient = new YoutubeClient(process.env.YOUTUBE_API_KEY)

    sources.forEach(({ type, identifier, channelId }) => {
        const schedulerName = `${type} Feeder (${identifier})`
        const logError = (message) => logger.error(`${schedulerName} - ${message}`)
        const sendMessage = telegramClient.sendMessage.bind(telegramClient, channelId)
        const deleteMessage = telegramClient.deleteMessage.bind(telegramClient, channelId)

        start(logger, schedulerName, async () => {
            if (type === SourceTypes.RSS) {
                await rssTask({
                    logError,
                    uri: identifier,
                    parser: rssParser,
                    storage,
                    sendMessage,
                    deleteMessage,
                })
            } else if (type === SourceTypes.Twitter) {
                await twitterTask({
                    logError,
                    screenName: identifier,
                    twitterClient,
                    storage,
                    sendMessage,
                    deleteMessage,
                })
            } else if (type === SourceTypes.Youtube) {
                await youtubeTask({
                    logError,
                    youtubeChannelId: identifier,
                    youtubeClient,
                    storage,
                    sendMessage,
                    deleteMessage,
                })
            }
        }, SourceDelays[type]).then((stop) => stoppers.push(stop))
    })
})()
