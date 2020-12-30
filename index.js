"use strict"

const dotenv = require("dotenv")
dotenv.config()

const express = require("express")

const app = express()

const http = require('http')
const server = http.createServer(app)

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

const WebSocket = require('ws')
const wss = new WebSocket.Server({ server })
var cookie = require('cookie')

wss.on('connection', (ws, req) => {
  let sessionId = cookie.parse(req.headers.cookie)['session-id']
  ws.isAlive = true

  ws.on('pong', () => {
    ws.isAlive = true
  })

  ws.on('message', async message => {
    message = JSON.parse(message)
    let { id, command, params } = message
    params.sessionId = sessionId
    let { status, data } = await RedisMQ.process(command, params)
    ws.send(JSON.stringify({ id, status, data }))
  })
})

setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate()

    ws.isAlive = false
    ws.ping(null, false, true)
  })
}, 10000)

/*****************************************************/

const uuid = require("uuid")

app.use(async (req, res, next) => {
  req.sessionId = (req.cookies && req.cookies['session-id']) || uuid.v4()
  res.cookie('session-id', req.sessionId, { maxAge: 900 * 1000, httpOnly: true, SameSite: 'Strict' })

  next()
})

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

const Session = require("./shared/session")

const User = require("./models/user")

app.post("/api/signup", async (req, res) => {
  try {
    if (req.body.password !== req.body.password_confirm) throw new Error('Passwords do not match')

    let user
    try {
      user = await User.findBySQL("email = $1", [req.body.email])
    } catch {}
    if (user) throw new Error('Already registered')

    user = new User()
    user.email = req.body.email
    user.password = req.body.password
    await user.save()
    res.status(200).send({ email: user.email })
  } catch (e) {
    res.status(500).send(e.message)
  }
})

app.post("/api/login", async (req, res) => {
  try {
    let user
    try {
      user = await User.findBySQL("email = $1 AND password = $2", [req.body.email, req.body.password])
    } catch {
      throw new Error('Email and/or password do not match')
    }

    let session = new Session(req.sessionId)
    await session.load()
    session.currentUserId = user.id
    session.save()

    res.status(200).send({ email: user.email })
  } catch(e) {
    res.status(500).send(e.message)
  }
})

app.post("/api/logout", async (req, res) => {
  try {
    let session = new Session(req.sessionId)
    await session.load()
    session.currentUserId = null
    session.save()

    res.status(200).send({})
  } catch(e) {
    res.status(500).send(e.message)
  }
})

/*****************************************************/

function processor(channel) {
  return async function(req, res) {
    try {
      let timer = setTimeout(_ => {
        res.status(504).send("Timeout")
      }, 60 * 1000)

      let params = Object.assign(req.query, req.body, req.params)
      params.sessionId = req.sessionId
      let { status, data } = await RedisMQ.process(channel, params)

      res.status(status).send(data)

      clearTimeout(timer)
    } catch (e) {
      res.status(500).send(e.message)
    }
  }
}

app.get("/api/videos", processor("videos"))
app.put("/api/video/:id", processor("video-post"))

/*****************************************************/

server.listen(process.env.PORT).on("listening", () => {
  console.log(`Started on port ${process.env.PORT}`)
  const fs = require('fs')
  fs.writeFile('video-portal.pid', String(process.pid), () => {})
})

/*****************************************************/

require("./worker")
