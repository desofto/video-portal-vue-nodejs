import Vue from 'vue'

import VueResource from "vue-resource"
Vue.use(VueResource)

class User {
  constructor() {
    this.load()
  }

  store(user) {
    this.email = user.email

    let data = {
      email: this.email
    }
    localStorage.setItem('current-user', JSON.stringify(data))
  }

  load() {
    let user = JSON.parse(localStorage.getItem('current-user')) || {}
    this.email = user.email
  }

  async signup(form) {
    try {
      let response = await Vue.http.post('/api/signup', form)
      this.store(response.body)
    } catch(response) {
      throw new Error(response.body)
    }
  }

  async login(form) {
    try {
      let response = await Vue.http.post('/api/login', form)
      this.store(response.body)
    } catch (response) {
      throw new Error(response.body)
    }
  }

  async logout() {
    try {
      let response = await Vue.http.post('/api/logout')
      this.store(response.body)
    } catch (response) {
      throw new Error(response.body)
    }
  }
}

Vue.prototype.$globals.currentUser = new User({})
