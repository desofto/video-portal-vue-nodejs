"use strict"

const dotenv = require("dotenv")
dotenv.config()

const RedisMQ = require("./shared/redis-mq")

const Session = require("./shared/session")

const Video = require("./models/video")

RedisMQ.subscribe("videos", async req => {
  let session = new Session(req.sessionId)
  await session.load()
  session.token = session.token || 0
  session.token++
  session.save()

  let videos = await Video.where("name ilike $1 order by rating desc", ["%" + req.search + "%"])

  let data = videos.map(video => ({
    id: video.id,
    name: video.name,
    poster_url: video.poster_url,
    rating: video.rating
  }))

  return data
})

RedisMQ.subscribe("video-post", async req => {
  let video = await Video.find(req.id)
  video.rating = req.rating
  await video.save()

  return
})

RedisMQ.subscribe("movies", async req => {
  let videos = await Video.where("name ilike $1 order by rating desc", ["%" + req.search + "%"])

  let data = videos.map(video => ({
    id: video.id,
    name: video.name,
    poster_url: video.poster_url,
    rating: video.rating
  }))

  return data
})
