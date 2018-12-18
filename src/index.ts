import { load } from "dotenv-extended"
import { TelegramClient } from "messaging-api-telegram"
import { RssFeeder } from "./RssFeeder"

load()

const rssUri = "https://habr.com/rss/feed/posts/all/5cdefeee2ea0b5687dcfae0cbf44f7e3/?hl=ru&fl=ru"
const channelId = "-1001166301659"

const client = TelegramClient.connect(process.env.TELEGRAM_ACCESS_TOKEN)

const feeder = new RssFeeder({
    channelId,
    client,
    uri: rssUri,
})
feeder.start()
