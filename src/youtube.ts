import axios from "axios"
import { FeedItem, ParseModes } from "./feeder"

interface Channel {
    id: string,
    uploads: string,
    title: string,
    description: string,
}

interface Video {
    id: string,
    title: string,
    description: string,
    url: string,
    shortUrl: string,
}

const getChannel = async (apiKey: string, channelId: string): Promise<Channel> => {
    const url = "https://www.googleapis.com/youtube/v3/channels?" +
        `part=contentDetails,snippet&id=${channelId}&key=${apiKey}`
    const { data: { items = [] } } = await axios.get(url)
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

const getPlaylistVideos = async (apiKey: string, playlistId: string): Promise<Video[]> => {
    const url = "https://www.googleapis.com/youtube/v3/playlistItems?" +
        `part=snippet&maxResults=10&playlistId=${playlistId}&key=${apiKey}`
    const { data: { items } } = await axios.get(url)
    const videos: Video[] = []
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

export const getYoutubeItems = async (apiKey: string, channelId: string): Promise<FeedItem[]> => {
    const channel = await getChannel(apiKey, channelId)
    const items = await getPlaylistVideos(apiKey, channel.uploads)
    return items.map(({ id, title, shortUrl }) => ({
        id,
        message: `<b>${title}</b>\n${shortUrl}`,
        mode: ParseModes.HTML,
    }))
}
