<template>
  <v-app>
    <movies />
  </v-app>
</template>

<script>
  import Movies from "./movies"

  export default {
    components: {
      "movies": Movies
    }
  }
</script>

<style lang="scss">
  * {
    margin: 0;
    padding: 0;
  }
</style>
