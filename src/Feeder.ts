import * as Keyv from "keyv"
import { SendMessageResponse, TelegramClient } from "messaging-api-telegram"
import { Logger } from "winston"

export interface IFeederArgs {
    logger: Logger,
    storage: Keyv,
    channelId: string,
    telegramClient: TelegramClient,
}

export abstract class Feeder {
    protected name: string
    protected logger: Logger
    protected storage: Keyv
    protected channelId: string
    protected telegramClient: TelegramClient
    protected timerId: NodeJS.Timer
    protected delay: number

    constructor({
        logger,
        storage,
        channelId,
        telegramClient,
    }: IFeederArgs) {
        this.logger = logger
        this.storage = storage
        this.channelId = channelId
        this.telegramClient = telegramClient
    }

    public start() {
        this.tick()
        this.logger.info(`${this.name} - start`)
    }

    public stop() {
        clearInterval(this.timerId)
        this.logger.info(`${this.name} - stop`)
    }

    protected abstract async tick(): Promise<void>

    protected nextTick() {
        this.timerId = setTimeout(this.tick.bind(this), this.delay)
    }

    protected async hasBeenSent(id: string): Promise<boolean> {
        return this.storage.get(id)
    }

    protected async send(id: string, message: string, mode: string = "") {
        let result: SendMessageResponse
        try {
            result = await this.telegramClient.sendMessage(this.channelId, message, {
                parse_mode: mode,
            })
        } catch (ex) {
            this.logError(`${ex.message} - ${message}`)
            return
        }

        try {
            await this.storage.set(id, Date.now())
        } catch (ex) {
            this.logError(ex)
            this.telegramClient.deleteMessage(this.channelId, result.message_id)
        }
    }

    protected logError(message: string) {
        this.logger.error(`${this.name} - ${message}`)
    }
}
