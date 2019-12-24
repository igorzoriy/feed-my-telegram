import * as RssParser from "rss-parser"
import { FeedItem, ParseModes } from "./feeder"
import { getShortLink } from "./utils"

interface RssItem {
    title: string,
    content: string,
    contentSnippet: string,
    guid: string,
    link: string,
}

export const getRssItems = async (uri: string): Promise<FeedItem[]> => {
    const parser = new RssParser()
    const feed = await parser.parseURL(uri)
    const items = feed.items as RssItem[]

    return Promise.all(items.map(async ({ title, guid = null, link }) => {
        const id = guid !== null ? guid : link
        const shortLink = await getShortLink(link)
        return {
            id,
            message: `<b>${title}</b>\n${shortLink}`,
            mode: ParseModes.HTML,
        }
    }))
}
