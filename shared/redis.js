const dotenv = require("dotenv")
dotenv.config()

const Redis = require("redis-fast-driver")

module.exports = function() {
  let opts = process.env.REDIS_URL.match("redis://(?<auth>.*)@(?<host>.*):(?<port>.*)/(?<db>.*)").groups

  return new Redis({
    host: opts.host,
    port: opts.port,
    maxRetries: 10,
    auth: opts.auth,
    db: opts.db,
    autoConnect: true,
    doNotSetClientName: false,
    doNotRunQuitOnEnd: false
  })
}
