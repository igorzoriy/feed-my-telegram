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
    private screenName: string
    private twitterClient: Twitter

    constructor(args: ITwitterFeederArgs) {
        super(args)
        this.name = "TwitterFeeder"
        this.delay = 1000 * 60 // 1 min
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
            const { id_str: id } = tweets[i]
            const link = `https://twitter.com/${this.screenName}/status/${id}`
            if (await this.hasBeenSent(link)) {
                continue
            }
            await this.send(link, link)
        }

        this.nextTick()
    }
}
