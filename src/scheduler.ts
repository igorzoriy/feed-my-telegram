type startFn = (
    logInfo: (message: string) => void,
    task: () => Promise<void>,
    interval: number,
) => Promise<() => void>

export const start: startFn = async (logInfo, task, interval) => {
    let timerId: NodeJS.Timeout
    const next = async () => {
        await task()
        timerId = setTimeout(next, interval)
    }

    logInfo("start")
    await next()

    return () => {
        clearInterval(timerId)
        logInfo("stop")
    }
}
