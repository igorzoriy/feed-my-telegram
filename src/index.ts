import * as dotenv from "dotenv-extended"
import * as Keyv from "keyv"
import { TelegramClient } from "messaging-api-telegram"
import * as sources from "../sources.json"
import { RssFeeder } from "./RssFeeder"

dotenv.load()

const client = TelegramClient.connect(process.env.TELEGRAM_ACCESS_TOKEN)
const storage = new Keyv("sqlite://./storage.sqlite")
storage.on("error", (err) => console.error(err))

sources.forEach((item) => {
    const feeder = new RssFeeder({
        channelId: item.channelId,
        client,
        storage,
        uri: item.uri,
    })
    feeder.start()
})
