import * as Keyv from "keyv"
import { SendMessageResponse } from "messaging-api-telegram"
import { hasBeenSent } from "./utils"
import { IVideo, YoutubeClient } from "./YoutubeClient"

interface IYoutubeTaskArgs {
    youtubeChannelId: string
    youtubeClient: YoutubeClient
    logError: (message: string) => void
    storage: Keyv
    sendMessage: (message: string, params: { parse_mode: string }) => Promise<SendMessageResponse>
    deleteMessage: (messageId: number | string) => Promise<void>
}

export const youtubeTask = async ({
    logError,
    youtubeChannelId,
    youtubeClient,
    storage,
    sendMessage,
    deleteMessage,
}: IYoutubeTaskArgs) => {
    let items: IVideo[] = []
    try {
        const channel = await youtubeClient.getChannel(youtubeChannelId)
        items = await youtubeClient.getPlaylistVideos(channel.uploads) as IVideo[]
    } catch (ex) {
        logError(ex.message)
        return
    }

    for (let i = items.length - 1; i >= 0; i--) {
        const { url: id, title } = items[i]
        const message = `<b>${title}</b>\n${id}`

        if (await hasBeenSent(storage, id)) {
            continue
        }

        let result: SendMessageResponse
        try {
            result = await sendMessage(message, {
                parse_mode: "HTML",
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
