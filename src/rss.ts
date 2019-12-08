import * as Keyv from "keyv"
import { SendMessageResponse } from "messaging-api-telegram"
import { getShortLink, hasBeenSent } from "./utils"

interface IRssItem {
    title: string
    content: string
    contentSnippet: string
    guid: string
    link: string
}

interface IRssTaskArgs {
    uri: string
    parser: any
    logError: (message: string) => void
    storage: Keyv
    sendMessage: (message: string, params: { parse_mode: string }) => Promise<SendMessageResponse>
    deleteMessage: (messageId: number | string) => Promise<void>
}

export const rssTask = async ({ logError, uri, parser, storage, sendMessage, deleteMessage }: IRssTaskArgs) => {
    let items: IRssItem[] = []
    try {
        const feed = await parser.parseURL(uri)
        items = feed.items as IRssItem[]
    } catch (ex) {
        logError(ex.message)
        return
    }

    for (let i = items.length - 1; i >= 0; i--) {
        let id: string
        const { guid = null, title, link } = items[i]
        id = guid !== null ? guid : link
        if (await hasBeenSent(storage, id)) {
            continue
        }
        const shortLink = await getShortLink(link)

        let result: SendMessageResponse
        try {
            result = await sendMessage(`<b>${title}</b>\n${shortLink}`, {
                parse_mode: "HTML",
            })
            await storage.set(id, Date.now())
        } catch (ex) {
            logError(`${ex.message} - ${shortLink}`)
            if (result && result.message_id) {
                deleteMessage(result.message_id)
            }
        }
    }

}
