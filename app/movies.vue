<template>
  <div class="d-flex flex-wrap pa-3">
    <movie v-for="movie in movies" :title="movie.name" :poster="movie.poster_url" :key="movie.id" />
  </div>
</template>

<script>
  import Movie from "./movie"
  
  export default {
    data: () => ({
      movies: []
    }),

    mounted() {
      this.$http.get("http://192.168.2.26:5253/videos").then(response => {
        this.movies = response.body
      }, response => {
        alert("Backend error")
      })
    },

    components: {
      "movie": Movie
    }
  }
</script>

<style scoped lang="scss">
  .movie {
    margin-right: 2em;
    margin-bottom: 2em;
  }
</style>