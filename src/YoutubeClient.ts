import axios from "axios"

interface IChannel {
    id: string
    uploads: string
    title: string
    description: string
}

export interface IVideo {
    id: string
    title: string
    description: string
    url: string
    shortUrl: string
}

export class YoutubeClient {
    private API_KEY: string

    constructor(key: string) {
        this.API_KEY = key
    }

    public async getChannel(channelId: string): Promise<IChannel> {
        const url = "https://www.googleapis.com/youtube/v3/channels?" +
            `part=contentDetails,snippet&id=${channelId}&key=${this.API_KEY}`
        const { data: { items } } = await axios.get(url)
        if (items.length !== 1) {
            throw new Error("Channel not found.")
        }

        const item = items[0]

        return {
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            uploads: item.contentDetails.relatedPlaylists.uploads,
        }
    }

    public async getPlaylistVideos(playlistId: string): Promise<IVideo[]> {
        const url = "https://www.googleapis.com/youtube/v3/playlistItems?" +
            `part=snippet&maxResults=10&playlistId=${playlistId}&key=${this.API_KEY}`
        const { data: { items } } = await axios.get(url)
        const videos: IVideo[] = []
        for (const item of items) {
            const { videoId } = item.snippet.resourceId
            videos.push({
                id: videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                shortUrl: `https://youtu.be/${videoId}`,
            })
        }

        return videos
    }
}
