import * as Twitter from "twitter"
import { FeedItem, ParseModes } from "./feeder"

interface Tweet {
    id_str: string,
    text: string,
}

export const getTwitterItems = async (client: Twitter, screenName: string): Promise<FeedItem[]> => {
    const items = await client.get("statuses/user_timeline", {
        count: 10,
        exclude_replies: true, // eslint-disable-line @typescript-eslint/camelcase
        include_rts: false, // eslint-disable-line @typescript-eslint/camelcase
        screen_name: screenName, // eslint-disable-line @typescript-eslint/camelcase
    }) as Tweet[]

    return items.map(({ id_str: id }) => ({
        id: `https://twitter.com/${screenName}/status/${id}`,
        message: `https://twitter.com/${screenName}/status/${id}`,
        mode: ParseModes.Markdown,
    }))
}
