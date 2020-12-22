const Redis = require("./redis")
const redis = Redis()

module.exports = class Session {
  constructor(id) {
    this.id = id
    this._data = {}

    return new Proxy(this, {
      get(target, key, _receiver) {
        if (key in target) {
          return target[key]
        } else {
          return target._data[key]
        }
      },

      set(target, key, value, _receiver) {
        if (key in target) {
          target[key] = value
        } else {
          target._data[key] = value
        }

        return true
      }
    })
  }

  async load() {
    let session = await redis.rawCallAsync(["get", 'session-' + this.id])
    this._data = JSON.parse(session) || { id: this.id }
  }

  async save() {
    await redis.rawCallAsync(["set", 'session-' + this.id, JSON.stringify(this._data)])
  }
}
