"use strict"

const dotenv = require("dotenv")
dotenv.config()

const RedisMQ = require("./shared/redis-mq")

const Video = require("./models/video")

RedisMQ.subscribe("videos", async req => {
  let videos = await Video.where("name ilike $1 order by rating desc", ["%" + req.query.search + "%"])

  let data = videos.map(video => ({
    id: video.id,
    name: video.name,
    poster_url: video.poster_url,
    rating: video.rating
  }))

  return data
})

RedisMQ.subscribe("video-post", async req => {
  let video = await Video.find(req.params.id)
  video.rating = req.body.rating
  await video.save()

  return "ok"
})
