import * as got from "got"

export const getShortLink = async (link: string) => {
    const { body } = await got(`https://clck.ru/--?url=${link}`)
    return body
}
