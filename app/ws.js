const uuid = require('uuid')
const pako = require('pako')

class WS {
  constructor(url) {
    this.socket = null
    this.url = url
    this.queue = []
    this.promises = {}
    this.connect()
  }

  send(command, params) {
    return new Promise((resolve, reject) => {
      let id = uuid.v4()
      let message = pako.deflate(JSON.stringify({ id, command, params }))
      this.promises[id] = { resolve, reject }
      if (this.socket.readyState == WebSocket.OPEN) {
        this.socket.send(message)
      } else {
        this.queue.push(message)
      }
    })
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
      let fileReader = new FileReader()
      fileReader.onload = () => {
        let message = JSON.parse(pako.inflate(fileReader.result, { to: 'string' }))
        let { id, status, data } = message
        let { resolve, reject } = this.promises[id]
        delete this.promises[id]
        if (resolve) {
          if (status >= 200 && status < 300) {
            resolve(data)
          } else {
            reject(data)
          }
        }
      }
      fileReader.readAsArrayBuffer(event.data)
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