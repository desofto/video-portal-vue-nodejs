"use strict"

const dotenv = require("dotenv")
dotenv.config()

const express = require("express")

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const cors = require("cors")
app.use(cors({
  origin: true,
  optionsSuccessStatus: 204
}))

const compression = require("compression")
app.use(compression())

const cookieParser = require("cookie-parser")
app.use(cookieParser())

const RedisMQ = require("./shared/redis-mq")

/*****************************************************/

app.use(express.static(__dirname + "/public"))

/*****************************************************/

app.get("/", async (req, res) => {
  res.status(200).sendFile("index.html", { root: __dirname })
})

app.get("/dist/main.bundle.js", async (req, res) => {
  res.status(200).sendFile("main.bundle.js", { root: __dirname + "/dist" })
})

app.get("/dist/main.bundle.js.map", async (req, res) => {
  res.status(200).sendFile("main.bundle.js.map", { root: __dirname + "/dist" })
})

/*****************************************************/

app.get("/apiql", async (req, res) => {
  res.status(200).sendFile("apiql.html", { root: __dirname + "/public" })
})

app.post("/apiql", async (req, res) => {
  const { token } = req.headers
  if (!token) {
    return res.status(404).send("Not Found")
  }
  res.status(200).send("OK")
})

/*****************************************************/

const User = require("./models/user")

app.post("/login", async (req, res) => {
  try {
    let user = await User.findBySQL("email = $1 AND password", [req.body.email, req.body.password])
    user.token = String(+new Date())
    await user.save()
    res.status(200).send("OK")
  } catch(e) {
    res.status(500).send(e.message)
  }
})

app.post("/logout", async (req, res) => {
  try {
    let user = await User.findBySQL("token = $1", [req.body.token])
    user.token = null
    await user.save()
    res.status(200).send("OK")
  } catch(e) {
    res.status(500).send(e.message)
  }
})

/*****************************************************/

const uuid = require("node-uuid")

app.use(async (req, res, next) => {
  req.sessionId = (req.cookies && req.cookies['session-id']) || uuid.v4()
  res.cookie('session-id', req.sessionId, { maxAge: 600*1000, httpOnly: true })

  next()
})

/*****************************************************/

function processor(channel) {
  return async function(req, res) {
    try {
      let timer = setTimeout(_ => {
        res.status(504).send("Timeout")
      }, 60 * 1000)

      let params = (({ params, query, body, sessionId }) => ({ params, query, body, sessionId }))(req)
      let { status, data } = await RedisMQ.process(channel, params)

      res.status(status).send(data)

      clearTimeout(timer)
    } catch (e) {
      res.status(500).send(e.message)
    }
  }
}

app.get("/videos", processor("videos"))
app.put("/video/:id", processor("video-post"))

/*****************************************************/

app.listen(process.env.PORT).on("listening", () => {
  console.log(`Started on port ${process.env.PORT}`)
})

/*****************************************************/

require("./worker")
