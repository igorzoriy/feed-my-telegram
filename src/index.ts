import { TelegramClient } from "messaging-api-telegram"

import { RssFeeder } from "./RssFeeder"

const rssUri = "https://habr.com/rss/feed/posts/all/5cdefeee2ea0b5687dcfae0cbf44f7e3/?hl=ru&fl=ru"
const telegramAccessToken = "739015655:AAFGxGYxrkYl8F69B1ItTaWyZFZJU5o9WqA"
const channelId = "-1001166301659"

const client = TelegramClient.connect(telegramAccessToken)

const feeder = new RssFeeder({
    channelId,
    client,
    uri: rssUri,
})
feeder.start()
