import axios from "axios"

export const getShortLink = async (link: string): Promise<string> => {
    const { data } = await axios.get(`https://clck.ru/--?url=${link}`)
    return data.length <= 30 ? data : link
}

export const getJsonFromUrl = async (url: string): Promise<{}|[]> => {
    const { data } = await axios.get(url)
    return data
}
