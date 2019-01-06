import * as Keyv from "keyv"
import { SendMessageResponse, TelegramClient } from "messaging-api-telegram"
import * as Parser from "rss-parser"
import { Logger } from "winston"
import { sleep } from "./utils"

interface IRssItem {
    title: string
    guid: string
}

export class RssFeeder {
    private channelId: string
    private client: TelegramClient
    private logger: Logger
    private parser
    private storage: Keyv
    private timerId: NodeJS.Timeout
    private uri: string

    constructor({
        uri,
        client,
        channelId,
        logger,
        storage,
    }: {
        uri: string,
        client: TelegramClient,
        channelId: string,
        logger: Logger,
        storage: Keyv,
    }) {
        this.uri = uri
        this.client = client
        this.channelId = channelId
        this.logger = logger
        this.storage = storage
        this.parser = new Parser()
    }

    public async start() {
        this.timerId = setInterval(this.tick.bind(this), 1000)
    }

    public stop() {
        clearInterval(this.timerId)
    }

    private logError(message: string) {
        this.logger.error(`RssFeeder - ${message}`)
    }

    private async tick() {
        let items: IRssItem[]
        try {
            const feed = await this.parser.parseURL(this.uri)
            items = feed.items
        } catch (ex) {
            this.logError(`${ex} - ${this.uri}`)
            this.stop()
            await sleep(60000)
            this.start()
            return
        }

        items.reverse().forEach(async (item) => {
            try {
                if (await this.storage.get(item.guid)) {
                    return
                }
            } catch (ex) {
                this.logError(ex)
                return
            }

            let result: SendMessageResponse
            try {
                result = await this.client.sendMessage(this.channelId, item.title)
            } catch (ex) {
                this.logError(ex)
                return
            }

            try {
                await this.storage.set(item.guid, Date.now())
            } catch (ex) {
                this.client.deleteMessage(this.channelId, result.message_id)
                this.logError(ex)
            }
        })
    }
}
