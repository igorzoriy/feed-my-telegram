import { Feeder, IFeederArgs } from "./Feeder"
import { IVideo, YoutubeClient } from "./YoutubeClient"

interface IYoutubeFeederArgs extends IFeederArgs {
    youtubeClient: YoutubeClient
    youtubeChannelId: string
}

export class YoutubeFeeder extends Feeder {
    private youtubeClient: YoutubeClient
    private youtubeChannelId: string

    constructor(args: IYoutubeFeederArgs) {
        super(args)
        this.name = "YoutubeFeeder"
        this.delay  = 1000 *  60 * 5 // 5 mins
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
            const { url: id, title } = videos[i]
            if (await this.hasBeenSent(id)) {
                continue
            }
            await this.send(id, `<b>${title}</b>\n${id}`, "HTML")
        }

        this.nextTick()
    }
}
