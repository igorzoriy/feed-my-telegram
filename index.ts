import * as Parser from "rss-parser"
import { TelegramClient } from "messaging-api-telegram"

const rssUri = "https://habr.com/rss/feed/posts/all/5cdefeee2ea0b5687dcfae0cbf44f7e3/?hl=ru&fl=ru"
const telegramAccessToken = "739015655:AAFGxGYxrkYl8F69B1ItTaWyZFZJU5o9WqA"
const channelId = "-1001166301659"

const parser = new Parser()
const client = TelegramClient.connect(telegramAccessToken)

parser.parseURL(rssUri).then(feed => {
    feed.items.forEach(item => {
        client.sendMessage(channelId, item.title)
    })
})


