import * as got from "got"
import * as Keyv from "keyv"
import { SendMessageResponse, TelegramClient } from "messaging-api-telegram"
import * as Parser from "rss-parser"
import { Logger } from "winston"

interface IRssItem {
    title: string
    content: string
    contentSnippet: string
    guid: string
    link: string
}

export class RssFeeder {
    private ERROR_DELAY = 60000

    private channelId: string
    private client: TelegramClient
    private logger: Logger
    private parser
    private storage: Keyv
    private timerId: NodeJS.Timer
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
        this.logger.info(`RssFeeder - start with uri: ${this.uri}`)
        this.tick()
    }

    public stop() {
        clearInterval(this.timerId)
        this.logger.info(`RssFeeder - stop`)
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
            return this.nextTick(this.ERROR_DELAY)
        }

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i]
            let result: SendMessageResponse

            try {
                if (await this.storage.get(item.guid)) {
                    continue
                }
                result = await this.send(item)
                await this.storage.set(item.guid, Date.now())
            } catch (ex) {
                this.logError(ex)
                if (result && result.message_id) {
                    this.client.deleteMessage(this.channelId, result.message_id)
                }
                return this.nextTick()
            }
        }

        this.nextTick()
    }

    private nextTick(delay: number = 1000) {
        this.timerId = setTimeout(this.tick.bind(this), delay)
    }

    private async send(item: IRssItem): Promise<SendMessageResponse> {
        const { body: link } = await got(`https://clck.ru/--?url=${item.link}`)
        const content = item.contentSnippet.replace("Читать дальше →", "").replace("Читать дальше &rarr;", "")
        const message = `*${item.title}*\n\n${content}\n${link}`
        return this.client.sendMessage(this.channelId, message, {
            parse_mode: "Markdown",
        })
    }
}
