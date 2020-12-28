<template>
  <div>
    <div class="d-flex flex-wrap pa-3">
      <Movie v-for="movie in movies" :id="movie.id" :title="movie.name" :poster="movie.poster_url" :rating="movie.rating" :key="movie.id" @update-rating="updateRating(movie, $event)" />
    </div>
  </div>
</template>

<script>
  import Movie from "@/movie"
  
  export default {
    props: {
      search: String,
    },

    data: () => ({
      movies: []
    }),

    watch: {
      search() {
        this.loadMovies()
      }
    },

    mounted() {
      this.loadMovies()
    },

    methods: {
      loadMovies() {
        this.$http.get("/api/videos?search=" + this.search).then(response => {
          this.movies = response.body
        }, response => {
          alert("Backend error: " + response.body)
        })
      },

      updateRating(movie, rating) {
        this.$http.put(`/api/video/${movie.id}`, { rating: rating }).then(response => {
          movie.rating = rating
        }, response => {
          alert("Backend error: " + response.body)
        })
      }
    },

    components: {
      Movie
    }
  }
</script>

<style scoped lang="scss">
  .movie {
    margin-right: 2em;
    margin-bottom: 2em;
  }
</style>