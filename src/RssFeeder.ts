import { TelegramClient } from "messaging-api-telegram"
import * as Parser from "rss-parser"

export class RssFeeder {
    private uri: string
    private client: TelegramClient
    private channelId: string
    private timerId: NodeJS.Timeout
    private parser
    private lastGuid: string = ""

    constructor({ uri, client, channelId }: { uri: string, client: TelegramClient, channelId: string }) {
        this.uri = uri
        this.client = client
        this.channelId = channelId

        this.parser = new Parser()
    }

    public start() {
        this.timerId = setInterval(this.tick.bind(this), 500)
    }

    public stop() {
        clearInterval(this.timerId)
    }

    private tick() {
        this.parser.parseURL(this.uri).then(({ items }) => {
            let i = items.findIndex((item) => this.lastGuid === item.guid)
            if (i < 0) {
                i = 0
            } else {
                i++
            }

            for (; i < items.length; i++) {
                this.client.sendMessage(this.channelId, items[i].title)
                this.lastGuid = items[i].guid
            }
        })
    }
}
