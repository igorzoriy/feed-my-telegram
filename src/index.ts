import * as dotenv from "dotenv-extended"
import { TelegramClient } from "messaging-api-telegram"
import * as sources from "../sources.json"
import { RssFeeder } from "./RssFeeder"

dotenv.load()
const client = TelegramClient.connect(process.env.TELEGRAM_ACCESS_TOKEN)
sources.forEach((item) => {
    const feeder = new RssFeeder({
        channelId: item.channelId,
        client,
        uri: item.uri,
    })
    feeder.start()
})
