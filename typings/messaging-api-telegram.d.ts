declare module "messaging-api-telegram" {
    type ClientConfig = {
        accessToken: string,
        origin?: string,
        onRequest?: Function,
    }

    export class TelegramClient {
        static connect(accessTokenOrConfig: string | ClientConfig): TelegramClient
        sendMessage(chatId: string, text: string, options?: Object)
    }
}
