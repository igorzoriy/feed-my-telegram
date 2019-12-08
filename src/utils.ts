import * as got from "got"
import * as Keyv from "keyv"

export enum TelegramParseModes {
    HTML = "HTML",
    Markdown = "Markdown",
}

export const getShortLink = async (link: string) => {
    const { body } = await got(`https://clck.ru/--?url=${link}`)
    return body.length <= 30 ? body : link
}

export const getJsonFromUrl = async (url: string) => {
    const { body } = await got(url, {
        json: true,
    })
    return body
}

export const hasBeenSent = async (storage: Keyv, id: string): Promise<boolean> => {
    return storage.get(id)
}
