"use strict"

const dotenv = require("dotenv")
dotenv.config()

const express = require("express")

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const cors = require("cors")
app.use(cors())

/*****************************************************/

app.use(express.static(__dirname + "/public"))

/*****************************************************/

// req.params - route
// req.query - get
// req.body - post

app.get("/test/:id", async (req, res) => {
  res.status(200).send(req.params)
})

/*****************************************************/

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
    return res.status(500).send(e.message)
  }
})

app.post("/logout", async (req, res) => {
  try {
    let user = await User.findBySQL("token = $1", [req.body.token])
    user.token = null
    await user.save()
    res.status(200).send("OK")
  } catch(e) {
    return res.status(500).send(e.message)
  }
})

app.get("/videos", async (req, res) => {
  try {
    let videos = await Video.all()
    let data = videos.map(video => ({
      id: video.id,
      name: video.name,
      poster_url: video.poster_url,
      rating: 2.5
    }))
    res.status(200).send(data)
  } catch(e) {
    return res.status(500).send(e.message)
  }
})

/*****************************************************/

app.listen(process.env.PORT).on("listening", () => {
  console.log(`Started on port ${process.env.PORT}`)
})