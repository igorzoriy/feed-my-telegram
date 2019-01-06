import * as Keyv from "keyv"
import { TelegramClient } from "messaging-api-telegram"
import * as Parser from "rss-parser"

export class RssFeeder {
    private channelId: string
    private client: TelegramClient
    private parser
    private storage: Keyv
    private timerId: NodeJS.Timeout
    private uri: string

    constructor({
        uri,
        client,
        channelId,
        storage,
    }: {
        uri: string,
        client: TelegramClient,
        channelId: string,
        storage: Keyv,
    }) {
        this.uri = uri
        this.client = client
        this.channelId = channelId
        this.storage = storage

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
            items.reverse().forEach(async (item) => {
                if (await this.storage.get(item.guid)) {
                    return
                }

                await this.client.sendMessage(this.channelId, item.title)
                await this.storage.set(item.guid, Date.now())
            })
        })
    }
}
