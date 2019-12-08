import * as Keyv from "keyv"
import { SendMessageResponse } from "messaging-api-telegram"
import * as Twitter from "twitter"
import { hasBeenSent } from "./utils"

interface ITweet {
    id_str: string
    text: string
}

interface ITwitterTaskArgs {
    screenName: string
    twitterClient: Twitter
    logError: (message: string) => void
    storage: Keyv
    sendMessage: (message: string, params: { parse_mode: string }) => Promise<SendMessageResponse>
    deleteMessage: (messageId: number | string) => Promise<void>
}

export const twitterTask = async ({
    logError,
    screenName,
    twitterClient,
    storage,
    sendMessage,
    deleteMessage,
}: ITwitterTaskArgs) => {
    let items: ITweet[] = []
    try {
        items = await twitterClient.get("statuses/user_timeline", {
            count: 10,
            exclude_replies: true,
            include_rts: false,
            screen_name: screenName,
        }) as ITweet[]
    } catch (ex) {
        logError(ex.message)
        return
    }

    for (let i = items.length - 1; i >= 0; i--) {
        const { id_str: id } = items[i]
        const link = `https://twitter.com/${screenName}/status/${id}`
        if (await hasBeenSent(storage, link)) {
            continue
        }

        let result: SendMessageResponse
        try {
            result = await sendMessage(link, {
                parse_mode: "",
            })
            await storage.set(link, Date.now())
        } catch (ex) {
            logError(`${ex.message} - ${link}`)
            if (result && result.message_id) {
                deleteMessage(result.message_id)
            }
        }
    }
}
