import * as dotenv from "dotenv-extended"
import * as Keyv from "keyv"
import { TelegramClient } from "messaging-api-telegram"
import * as Twitter from "twitter"
import { feederTask } from "./feeder"
import { getLogger } from "./logger"
import { getRssItems } from "./rss"
import { start } from "./scheduler"
import { Source, SourceDelays, SourceTypes } from "./sources"
import { markAsSent, hasBeenSent } from "./storage"
import { getTwitterItems } from "./twitter"
import { getJsonFromUrl } from "./utils"
import { getYoutubeItems } from "./youtube"

(async (): Promise<void> => {
    dotenv.load()

    let stoppers: Array<() => void> = []
    const logger = getLogger()

    const shutdown = (): void => {
        stoppers.forEach((stop) => stop())
        process.exit(0)
    }

    process.on("SIGINT", shutdown)
    process.on("SIGTERM", shutdown)
    process.on("uncaughtException", (ex) => {
        logger.error(`Application - ${ex}`)
    })

    let sources: Source[] = []
    try {
        sources = await getJsonFromUrl(process.env.SOURCES_URL) as Source[]
    } catch (ex) {
        logger.error(`Application - ${ex}`)
        process.exit()
    }

    const storage = new Keyv("sqlite://./data/storage.sqlite")
    storage.on("error", (err) => logger.error(err))

    const telegramClient = TelegramClient.connect(process.env.TELEGRAM_ACCESS_TOKEN)
    const twitterClient = new Twitter({
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY, // eslint-disable-line @typescript-eslint/camelcase
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET, // eslint-disable-line @typescript-eslint/camelcase
        consumer_key: process.env.TWITTER_CONSUMER_KEY, // eslint-disable-line @typescript-eslint/camelcase
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET, // eslint-disable-line @typescript-eslint/camelcase
    })

    stoppers = await Promise.all(sources.map(async ({ type, identifier, channelId }) => {
        const schedulerName = `${type} Feeder (${identifier})`
        const logInfo = (message: string): void => {
            logger.info(`${schedulerName} - ${message}`)
        }
        const logError = (message: string): void => {
            logger.error(`${schedulerName} - ${message}`)
        }
        const sendMessage = telegramClient.sendMessage.bind(telegramClient, channelId)
        const deleteMessage = telegramClient.deleteMessage.bind(telegramClient, channelId)
        let getItems
        if (type === SourceTypes.RSS) {
            getItems = getRssItems.bind(null, identifier)
        } else if (type === SourceTypes.Twitter) {
            getItems = getTwitterItems.bind(null, twitterClient, identifier)
        } else if (type === SourceTypes.Youtube) {
            getItems = getYoutubeItems.bind(null, process.env.YOUTUBE_API_KEY, identifier)
        }

        return start(logInfo, async () => {
            await feederTask({
                logError,
                getItems,
                markAsSent: markAsSent.bind(null, storage),
                hasBeenSent: hasBeenSent.bind(null, storage),
                sendMessage,
                deleteMessage,
            })
        }, SourceDelays[type])
    }))
})()
