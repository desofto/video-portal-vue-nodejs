"use strict"

const dotenv = require("dotenv")
dotenv.config()

const RedisMQ = require("./shared/redis-mq")

const Session = require("./shared/session")

const currentUser = require('./shared/current-user')

const Video = require("./models/video")

RedisMQ.subscribe("videos", async req => {
  let session = new Session(req.sessionId)
  await session.load()
  currentUser.id = session.currentUserId

  session.token = session.token || 0
  session.token++
  session.save()

  let videos = await Video.where("name ilike $1", ["%" + req.search + "%"])

  let data = []
  for(let video of videos) {
    data.push({
      id: video.id,
      name: video.name,
      poster_url: video.poster_url,
      rating: await video.rating()
    })
  }

  return data
})

RedisMQ.subscribe("video-post", async req => {
  let session = new Session(req.sessionId)
  await session.load()
  currentUser.id = session.currentUserId

  let video = await Video.find(req.id)
  await video.rating(req.rating)
  await video.save()

  return
})
