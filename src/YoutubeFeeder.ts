import { SendMessageResponse } from "messaging-api-telegram"
import { Feeder, IFeederArgs } from "./Feeder"
import { IVideo, YoutubeClient } from "./YoutubeClient"

interface IYoutubeFeederArgs extends IFeederArgs {
    youtubeClient: YoutubeClient,
    youtubeChannelId: string,
}

export class YoutubeFeeder extends Feeder {
    protected name = "YoutubeFeeder"
    protected delay = 1000 * 60 * 5 // 5 mins

    private youtubeClient: YoutubeClient
    private youtubeChannelId: string

    constructor(args: IYoutubeFeederArgs) {
        super(args)
        this.youtubeClient = args.youtubeClient
        this.youtubeChannelId = args.youtubeChannelId
    }

    public start() {
        super.start()
        this.logger.info(`${this.name} - youtubeChannelId: ${this.youtubeChannelId}`)
    }

    public stop() {
        super.stop()
        this.logger.info(`${this.name} - youtubeChannelId: ${this.youtubeChannelId}`)
    }

    protected async tick() {
        let videos: IVideo[]
        try {
            const channel = await this.youtubeClient.getChannel(this.youtubeChannelId)
            videos = await this.youtubeClient.getPlaylistVideos(channel.uploads)
        } catch (ex) {
            this.logError(ex)
            return this.nextTick()
        }

        for (let i = videos.length - 1; i >= 0; i--) {
            const item = videos[i]
            let result: SendMessageResponse

            try {
                if (await this.storage.get(item.url)) {
                    continue
                }
                const message = item.url
                result = await this.send(message)
                await this.storage.set(item.url, Date.now())
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
