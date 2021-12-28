import pino from "pino";
import prettifier from "pino-pretty"

export default pino({
    prettyPrint: {
        levelFirst: true,
    },
    prettifier,
})
