import { SendMessageResponse } from "messaging-api-telegram"
import * as Twitter from "twitter"
import { Feeder, IFeederArgs } from "./Feeder"

interface ITweet {
    id_str: string,
    text: string,
}

interface ITwitterFeederArgs extends IFeederArgs {
    screenName: string,
    twitterClient: Twitter,
}

export class TwitterFeeder extends Feeder {
    protected name = "TwitterFeeder"

    private screenName: string
    private twitterClient: Twitter

    constructor(args: ITwitterFeederArgs) {
        super(args)
        this.screenName = args.screenName
        this.twitterClient = args.twitterClient
    }

    public start() {
        super.start()
        this.logger.info(`${this.name} - screenName: ${this.screenName}`)
    }

    public stop() {
        super.stop()
        this.logger.info(`${this.name} - screenName: ${this.screenName}`)
    }

    protected async tick() {
        let tweets: ITweet[]
        try {
            tweets = await this.twitterClient.get("statuses/user_timeline", {
                count: 10,
                exclude_replies: true,
                include_rts: false,
                screen_name: this.screenName,
            }) as ITweet[]
        } catch (ex) {
            this.logError(ex)
            return this.nextTick()
        }

        for (let i = tweets.length - 1; i >= 0; i--) {
            const item = tweets[i]
            const link = `https://twitter.com/${this.screenName}/status/${item.id_str}`
            let result: SendMessageResponse

            try {
                if (await this.storage.get(link)) {
                    continue
                }
                const message = `https://twitter.com/${this.screenName}/status/${item.id_str}`
                result = await this.send(message)
                await this.storage.set(link, Date.now())
            } catch (ex) {
                this.logError(ex)
                if (result && result.message_id) {
                    this.telegramClient.deleteMessage(this.channelId, result.message_id)
                }
                return this.nextTick()
            }
        }

        this.nextTick()
    }
}
