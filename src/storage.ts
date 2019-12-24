import * as Keyv from "keyv"

export const markAsSent = async (storage: Keyv, id: string): Promise<void> => {
    await storage.set(id, Date.now())
}

export const hasBeenSent = async (storage: Keyv, id: string): Promise<boolean> => {
    return await storage.get(id) !== undefined
}
