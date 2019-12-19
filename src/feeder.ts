import * as Keyv from "keyv"
import { SendMessageResponse } from "messaging-api-telegram"

export enum ParseModes {
    HTML = "HTML",
    Markdown = "Markdown",
}

export interface FeedItem {
    id: string
    message: string
    mode: ParseModes
}

interface TaskArgs {
    logError: (message: string) => void
    getItems: () => Promise <FeedItem[]>
    storage: Keyv
    sendMessage: (message: string, params: { parse_mode: string }) => Promise<SendMessageResponse>
    deleteMessage: (messageId: number | string) => Promise<void>
}

type feederTaskFn = (args: TaskArgs) => Promise<void>

export const feederTask: feederTaskFn = async ({ getItems, logError, storage, sendMessage, deleteMessage }) => {
    let items: FeedItem[] = []
    try {
        items = await getItems()
    } catch (ex) {
        logError(ex.message)
        return
    }

    for (const item of items) {
        const { id, message, mode } = item

        if (await storage.get(id)) {
            continue
        }

        let result: SendMessageResponse
        try {
            result = await sendMessage(message, {
                parse_mode: mode, // eslint-disable-line @typescript-eslint/camelcase
            })
            await storage.set(id, Date.now())
        } catch (ex) {
            logError(`${ex.message} - ${id}`)
            if (result && result.message_id) {
                deleteMessage(result.message_id)
            }
        }
    }
}
