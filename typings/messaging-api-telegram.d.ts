declare module "messaging-api-telegram" {
    type ClientConfig = {
        accessToken: string,
        origin?: string,
        onRequest?: Function,
    }

    type SendMessageResponse = {
        message_id: number,
        text: string,
        date: number,
        chat: {
            id: number,
            title: string,
            type: string,
        },
    }

    export class TelegramClient {
        static connect(accessTokenOrConfig: string | ClientConfig): TelegramClient
        sendMessage(chatId: string, text: string, options?: Object): Promise<SendMessageResponse>
    }
}
