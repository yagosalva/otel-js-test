const { newProvider } = require("./provider.js")
const opentelemetry = require('@opentelemetry/api')

const provider = newProvider()
const tracer = opentelemetry.trace.getTracer("myTracer", "0.1.0")

const express = require("express")
const app = express()

app.get("/ping", (req, res) => {
    let ctx = opentelemetry.context.active()
    let span = tracer.startSpan("mySpan", ctx)
    span.setAttribute("key", "value")
    span.end()
    res.status(200).send("pong")
})
app.use(express.json());

const server = app.listen(8080, "localhost", () => {
    console.log("listening on port 8080")
})

server.on("close", () => {
    provider.shutdown().then().catch((err) => {
        console.log(err)
    })
})
