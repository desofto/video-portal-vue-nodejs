<template>
  <v-app>
    <v-row justify="end" class="ma-0 pa-1 align-center flex-grow-0">
      <v-text-field label="Search" single-line v-model="search" class="flex-grow-1 mr-4" hide-details="auto" />

      <template v-if="currentUser && currentUser.email">
        <span class="mr-2">
          Signed in as {{ currentUser.email }}
        </span>
        <v-btn
          color="blue lighten-2"
          dark
          v-bind="attrs"
          @click="logout()"
        >
          Logout
        </v-btn>
      </template>

      <template v-else>
        <Login class="mr-2" /> <Signup />
      </template>
    </v-row>

    <Movies :search="search" />
  </v-app>
</template>

<script>
  import Vue from 'vue'

  import Login from '@/auth/login'
  import Signup from '@/auth/signup'
  import Movies from '@/movies'

  export default {
    data: () => ({
      search: "",
      currentUser: Vue.prototype.$globals.currentUser
    }),

    methods: {
      async logout() {
        try {
          await this.$globals.currentUser.logout()
        } catch (error) {
          alert("Backend error: " + error)
        }
      }
    },

    components: {
      Movies,
      Login,
      Signup,
    }
  }
</script>

<style lang="scss">
  * {
    margin: 0;
    padding: 0;
  }
</style>
