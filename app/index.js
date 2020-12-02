// Polyfills
import "core-js/stable"
import "regenerator-runtime/runtime"

import Vue from "vue"

import VueResource from "vue-resource"
Vue.use(VueResource)

import Vuetify from "vuetify"
import "vuetify/dist/vuetify.min.css"
Vue.use(Vuetify)

const vuetify = new Vuetify({})

import App from "./app"

document.addEventListener("DOMContentLoaded", () => {
  new Vue({
    vuetify,
    el: "#app",
    render: h => h(App)
  })
})
