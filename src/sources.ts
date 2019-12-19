export enum SourceTypes {
    RSS = "RSS",
    Twitter = "Twitter",
    Youtube = "Youtube",
}

export interface Source {
    type: SourceTypes
    identifier: string
    channelId: string
}

export const SourceDelays = {
    [SourceTypes.RSS]: 60 * 1000,
    [SourceTypes.Twitter]: 60 * 1000,
    [SourceTypes.Youtube]: 5 * 60 * 1000,
}
