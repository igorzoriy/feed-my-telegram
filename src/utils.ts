import * as got from "got"

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
