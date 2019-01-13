import { SendMessageResponse } from "messaging-api-telegram"
import * as Parser from "rss-parser"
import { Feeder, IFeederArgs } from "./Feeder"
import { getShortLink } from "./utils"

interface IRssItem {
    title: string
    content: string
    contentSnippet: string
    guid: string
    link: string
}

interface IRssFeederArgs extends IFeederArgs {
    uri: string,
}

export class RssFeeder extends Feeder {
    protected name = "RssFeeder"
    private parser
    private uri: string

    constructor(args: IRssFeederArgs) {
        super(args)
        this.uri = args.uri
        this.parser = new Parser()
    }

    public start() {
        super.start()
        this.logger.info(`${this.name} - uri: ${this.uri}`)
    }

    public stop() {
        super.stop()
        this.logger.info(`${this.name} - uri: ${this.uri}`)
    }

    protected async tick() {
        let items: IRssItem[]
        try {
            const feed = await this.parser.parseURL(this.uri)
            items = feed.items
        } catch (ex) {
            this.logError(ex)
            return this.nextTick()
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
                    this.telegramClient.deleteMessage(this.channelId, result.message_id)
                }
                return this.nextTick()
            }
        }

        this.nextTick()
    }

    private async send(item: IRssItem): Promise<SendMessageResponse> {
        const link = await getShortLink(item.link)
        const message = `*${item.title}*\n${link}`
        return this.telegramClient.sendMessage(this.channelId, message, {
            parse_mode: "Markdown",
        })
    }
}
