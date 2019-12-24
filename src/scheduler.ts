export const start = async (
    logInfo: (message: string) => void,
    task: () => Promise<void>,
    interval: number,
): Promise<() => void> => {
    let timerId: NodeJS.Timeout
    const next = async (): Promise<void> => {
        await task()
        timerId = setTimeout(next, interval)
    }

    logInfo("start")
    await next()

    return (): void => {
        clearInterval(timerId)
        logInfo("stop")
    }
}
