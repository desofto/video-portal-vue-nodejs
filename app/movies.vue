<template>
  <div>
    <v-text-field label="Search" single-line v-model="search" @input="loadMovies()" />
    <div class="d-flex flex-wrap pa-3">
      <movie v-for="movie in movies" :id="movie.id" :title="movie.name" :poster="movie.poster_url" :rating="movie.rating" :key="movie.id" @update-rating="updateRating(movie, $event)" />
    </div>
  </div>
</template>

<script>
  import Movie from "./movie"
  
  export default {
    data: () => ({
      movies: [],
      search: ""
    }),

    mounted() {
      this.loadMovies()
    },

    methods: {
      loadMovies() {
        this.$http.get("/videos?search=" + this.search).then(response => {
          this.movies = response.body
        }, response => {
          alert("Backend error: " + response.body)
        })
      },

      updateRating(movie, rating) {
        this.$http.put(`/video/${movie.id}`, { rating: rating }).then(response => {
          movie.rating = rating
        }, response => {
          alert("Backend error: " + response.body)
        })
      }
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