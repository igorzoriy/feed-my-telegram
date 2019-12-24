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

export const feederTask = async ({
    getItems,
    logError,
    markAsSent,
    hasBeenSent,
    sendMessage,
    deleteMessage,
}: {
    getItems: () => Promise<FeedItem[]>
    logError: (message: string) => void
    markAsSent: (id: string) => Promise<void>
    hasBeenSent: (id: string) => Promise<boolean>
    sendMessage: (message: string, params: { parse_mode: string }) => Promise<SendMessageResponse>
    deleteMessage: (messageId: number | string) => Promise<void>
}): Promise<void> => {
    let items: FeedItem[] = []
    try {
        items = await getItems()
    } catch (ex) {
        logError(ex.message)
        return
    }

    for (const item of items) {
        const { id, message, mode } = item

        if (await hasBeenSent(id)) {
            continue
        }

        let result: SendMessageResponse
        try {
            result = await sendMessage(message, {
                parse_mode: mode, // eslint-disable-line @typescript-eslint/camelcase
            })
            await markAsSent(id)
        } catch (ex) {
            logError(`${ex.message} - ${id}`)
            if (result && result.message_id) {
                deleteMessage(result.message_id)
            }
        }
    }
}
