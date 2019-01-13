import * as Keyv from "keyv"
import { TelegramClient } from "messaging-api-telegram"
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
    protected delay = 10000

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

    protected logError(message: string) {
        this.logger.error(`${this.name} - ${message}`)
    }
}
