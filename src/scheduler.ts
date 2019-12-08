import { Logger } from "winston"

export const start = async (logger: Logger, name: string, task: () => Promise<void>, interval: number) => {
    let timerId: NodeJS.Timeout
    const next = async () => {
        await task()
        timerId = setTimeout(next, interval)
    }

    logger.info(`${name} - start`)
    await next()

    return () => {
        clearInterval(timerId)
        logger.info(`${name} - stop`)
    }
}
