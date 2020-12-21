"use strict"

const Redis = require("./redis")
const uuid = require("node-uuid")

const { NotFound, UnprocessableEntity } = require("./exceptions")

function process(channel, req) {
  return new Promise(async (resolve, reject) => {
    try {
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
    try {
      let res = {
        status: undefined,
        data: undefined
      }

      let redis = Redis()

      let data = await redis.rawCallAsync(["BRPOP", channel, 0])
      let key = data[1]

      try {
        setTimeout(_ => {
          process()
        }, 0)

        let req = await redis.rawCallAsync(["get", key])
        req = JSON.parse(req)

        res.data = await callback(req)
        if (res.data === undefined) res.data = null

        res.status = res.data ? 200 : 204
      } catch (e) {
        if (e instanceof NotFound) {
          res.status = 404
          res.data = e.message
        } else if (e instanceof UnprocessableEntity) {
          res.status = 422
          res.data = e.message
        } else {
          res.status = 500
          res.data = e.message
        }
      } finally {
        await redis.rawCallAsync(["set", key, JSON.stringify(res)])
        await redis.rawCallAsync(["PUBLISH", channel, key])
      }
    } catch {}
  }

  process()
}

module.exports = { process, subscribe }