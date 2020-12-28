import Vue from "vue"

Vue.prototype.$globals = new Vue({
  data: {
    currentUser: null
  }
})
