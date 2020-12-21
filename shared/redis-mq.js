"use strict"

const Redis = require("./redis")
const uuid = require("node-uuid")

function process(channel, req) {
  return new Promise(async (resolve, reject) => {
    try {
      setTimeout(_ => {
        reject(new Error("Timeout"))
      }, 60*1000)

      const redis = Redis()

      let key = channel + '-' + uuid.v4()

      await redis.rawCallAsync(["set", key, JSON.stringify(req)])

      const redis2 = Redis()
      redis2.rawCall(["subscribe", channel], async (err, data) => {
        let [call, _channel, msg] = data

        if (call === "subscribe") {
          await redis.rawCallAsync(["LPUSH", channel, key])
        }

        if (call !== "message") return
        if (msg !== key) return

        data = await redis.rawCallAsync(["get", key])
        data = JSON.parse(data)

        resolve(data)

        await redis2.rawCallAsync(["unsubscribe"])
      })
    } catch (e) {
      reject(e)
    }
  })
}

function subscribe(channel, callback) {
  let process = async _ => {
    let redis, key

    try {
      redis = Redis()

      let data = await redis.rawCallAsync(["BRPOP", channel, 0])
      key = data[1]

      setTimeout(_ => {
        process()
      }, 0)

      let req = await redis.rawCallAsync(["get", key])
      req = JSON.parse(req)

      data = await callback(req)

      await redis.rawCallAsync(["set", key, JSON.stringify(data)])
      await redis.rawCallAsync(["PUBLISH", channel, key])
    } catch (e) {
      if(redis && key) {
        await redis.rawCallAsync(["LPUSH", channel, key])
      } else throw e
    }
  }

  process()
}

module.exports = { process, subscribe }