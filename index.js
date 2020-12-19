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

const Redis = require("./shared/redis")

const uuid = require("node-uuid")

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
    const redis = Redis()

    let key = 'videos-' + uuid.v4()

    await redis.rawCallAsync(["set", key, JSON.stringify({ search: req.query.search })])

    const redis2 = Redis()
    redis2.rawCall(["subscribe", "videos-answer"], async (err, data) => {
      let [call, channel, msg] = data

      if(call === "subscribe") {
        await redis.rawCallAsync(["LPUSH", "videos", key])
      }

      if(call !== "message") return
      if(msg !== key) return

      data = await redis.rawCallAsync(["get", key])
      data = JSON.parse(data)

      res.status(200).send(data)

      await redis2.rawCallAsync(["unsubscribe"])
    })
  } catch(e) {
    res.status(500).send(e.message)
  }
})

app.post("/video/:id", async (req, res) => {
  try {
    let video = await Video.find(req.params.id)
    video.rating = req.body.rating
    await video.save()
    res.status(200).send("ok")
  } catch (e) {
    res.status(500).send(e.message)
  }
})

/*****************************************************/

app.listen(process.env.PORT).on("listening", () => {
  console.log(`Started on port ${process.env.PORT}`)
})

/*****************************************************/

require("./worker")