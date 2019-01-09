import * as got from "got"

export const getShortLink = async (link: string) => {
    const { body } = await got(`https://clck.ru/--?url=${link}`)
    return body
}

export const getJsonFromUrl = async (url: string) => {
    const { body } = await got(url, {
        json: true,
    })
    return body
}
