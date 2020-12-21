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
const Video = require("./models/video")

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

app.get("/videos", async (req, res) => {
  try {
    let params = (({ params, query, body }) => ({ params, query, body }))(req)
    let { status, data } = await RedisMQ.process("videos", params)
    res.status(status).send(data)
  } catch(e) {
    if (e instanceof RedisMQ.Timeout) {
      res.status(504).send(e.message)
    } else {
      res.status(500).send(e.message)
    }
  }
})

app.put("/video/:id", async (req, res) => {
  try {
    let params = (({ params, query, body }) => ({ params, query, body }))(req)
    let { status, data } = await RedisMQ.process("video-post", params)
    res.status(status).send(data)
  } catch (e) {
    if (e instanceof RedisMQ.Timeout) {
      res.status(504).send(e.message)
    } else {
      res.status(500).send(e.message)
    }
  }
})

/*****************************************************/

app.listen(process.env.PORT).on("listening", () => {
  console.log(`Started on port ${process.env.PORT}`)
})

/*****************************************************/

require("./worker")
