const uuid = require('uuid')

class WS {
  constructor(url) {
    this.socket = null
    this.url = url
    this.queue = []
    this.callbacks = {}
    this.connect()
  }

  send(command, params, callback) {
    let id = uuid.v4()
    let message = JSON.stringify({ id, command, params })
    this.callbacks[id] = callback
    if (this.socket.readyState == WebSocket.OPEN) {
      this.socket.send(message)
    } else {
      this.queue.push(message)
    }
  }

  connect() {
    this.socket = new WebSocket(this.url)

    this.socket.onopen = e => {
      let message
      while(message = this.queue.pop()) {
        this.socket.send(message)
      }
    }

    this.socket.onmessage = event => {
      let message = JSON.parse(event.data)
      let { id, status, data } = message
      let callback = this.callbacks[id]
      delete this.callbacks[id]
      if(callback) {
        if(status >= 200 && status < 300) {
          callback(data)
        } else {
          alert(data)
        }
      }
    }

    this.socket.onclose = event => {
      if (!event.wasClean) {
        setTimeout(() => {
          this.connect()
        }, 1000)
      }
    }
  }
}

let url = new URL(window.location.href)
const socket = new WS(`ws://${url.hostname}:${url.port}/ws`)

export default socket