import { start } from "./scheduler"

test("start should run task, log actions and return stop", async () => {
    const logInfo = jest.fn()
    const task = jest.fn()
    const stop = await start(logInfo, task, 10)
    expect(logInfo).toHaveBeenLastCalledWith("start")
    expect(task).toHaveBeenCalled()
    stop()
    expect(logInfo).toHaveBeenLastCalledWith("stop")
})

test("start should run task by schedule", async (done) => {
    let counter = 0
    const logInfo = jest.fn()
    const task = jest.fn(async () => { counter++ })
    const stop = await start(logInfo, task, 7)
    setTimeout(() => {
        stop()
        expect(task).toHaveBeenCalledTimes(counter)
        done()
    }, 42)
})
