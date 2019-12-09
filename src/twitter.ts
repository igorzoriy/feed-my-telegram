import * as Twitter from "twitter"
import { IFeedItem, ParseModes } from "./feeder"

interface ITweet {
    id_str: string
    text: string
}

export const getTwitterItems = async (client: Twitter, screenName: string): Promise<IFeedItem[]> => {
    const items = await client.get("statuses/user_timeline", {
        count: 10,
        exclude_replies: true,
        include_rts: false,
        screen_name: screenName,
    }) as ITweet[]

    return items.map(({ id_str: id }) => ({
        id: `https://twitter.com/${screenName}/status/${id}`,
        message: `https://twitter.com/${screenName}/status/${id}`,
        mode: ParseModes.Markdown,
    }))
}
