"use strict"

const dotenv = require("dotenv")
dotenv.config()

const Redis = require("./shared/redis")

const redis = Redis()

const Video = require("./models/video")

async function process() {
  try {
    let data = await redis.rawCallAsync(["BRPOP", "videos", 0])
    let key = data[1]

    let req = await redis.rawCallAsync(["get", key])
    req = JSON.parse(req)

    let videos = await Video.where("name ilike $1 order by rating desc", ["%" + req.search + "%"])

    data = videos.map(video => ({
      id: video.id,
      name: video.name,
      poster_url: video.poster_url,
      rating: video.rating
    }))

    await redis.rawCallAsync(["set", key, JSON.stringify(data)])
    await redis.rawCallAsync(["PUBLISH", "videos-answer", key])
  } catch(_) {
    await redis.rawCallAsync(["LPUSH", "videos", key])
  }

  setTimeout(_ => {
    process()
  }, 0)
}

process()