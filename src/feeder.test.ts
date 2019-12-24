import { feederTask, ParseModes } from "./feeder"

let logError, getItems, markAsSent, hasBeenSent, sendMessage, deleteMessage
beforeEach(() => {
    logError = jest.fn()
    getItems = jest.fn()
    markAsSent = jest.fn()
    hasBeenSent = jest.fn()
    sendMessage = jest.fn()
    deleteMessage = jest.fn()
})

test("feederTask should log an error when getItems throws an exception", async () => {
    getItems = jest.fn(() => { throw new Error("bad result") })

    feederTask({
        logError,
        getItems,
        markAsSent,
        hasBeenSent,
        sendMessage,
        deleteMessage,
    })
    expect(logError).toHaveBeenLastCalledWith("bad result")
})

test("feederTask should send message with new items only", async () => {
    getItems = jest.fn(() => Promise.resolve([
        {
            id: "id1",
            message: "message 1",
            mode: ParseModes.HTML,
        },
        {
            id: "id2",
            message: "message 2",
            mode: ParseModes.HTML,
        },
        {
            id: "id3",
            message: "message 3",
            mode: ParseModes.HTML,
        },
    ]))
    hasBeenSent = jest.fn(id => Promise.resolve(id !== "id2"))
    sendMessage = jest.fn()

    await feederTask({
        logError,
        getItems,
        markAsSent,
        hasBeenSent,
        sendMessage,
        deleteMessage,
    })
    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect(sendMessage).toHaveBeenCalledWith("message 2", {
        parse_mode: ParseModes.HTML, // eslint-disable-line @typescript-eslint/camelcase
    })
})
