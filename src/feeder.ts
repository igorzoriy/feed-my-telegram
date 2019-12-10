import * as Keyv from "keyv"
import { SendMessageResponse } from "messaging-api-telegram"

export enum ParseModes {
    HTML = "HTML",
    Markdown = "Markdown",
}

export interface IFeedItem {
    id: string
    message: string
    mode: ParseModes
}

export type getItemsCallback = () => Promise<IFeedItem[]>

interface ITaskArgs {
    logError: (message: string) => void
    getItems: getItemsCallback
    storage: Keyv
    sendMessage: (message: string, params: { parse_mode: string }) => Promise<SendMessageResponse>
    deleteMessage: (messageId: number | string) => Promise<void>
}

export const feederTask = async ({ getItems, logError, storage, sendMessage, deleteMessage }: ITaskArgs) => {
    let items: IFeedItem[] = []
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
                parse_mode: mode,
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
