const Redis = require("redis-fast-driver")

module.exports = function() {
  return new Redis({
    host: 'localhost',
    port: 6379,
    maxRetries: 10,
    //auth: '123', 
    db: 5,
    autoConnect: true,
    doNotSetClientName: false,
    doNotRunQuitOnEnd: false
  })
}
