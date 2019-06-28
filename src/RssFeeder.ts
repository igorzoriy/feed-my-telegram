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
    uri: string
}

export class RssFeeder extends Feeder {
    private parser
    private uri: string

    constructor(args: IRssFeederArgs) {
        super(args)
        this.name = "RssFeeder"
        this.delay = 1000 * 60 // 1 min
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
            this.logError(`${ex.message} - ${this.uri}`)
            return this.nextTick()
        }

        for (let i = items.length - 1; i >= 0; i--) {
            const { guid: id, title, link } = items[i]
            if (await this.hasBeenSent(id)) {
                continue
            }
            const shortLink = await getShortLink(link)
            await this.send(id, `*${title}*\n${shortLink}`, "Markdown")
        }

        this.nextTick()
    }
}
