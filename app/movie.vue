<template>
  <div class="movie">
    <div class="d-flex mb-1">
      <img :src="poster" class="mx-auto" />
    </div>
    <div class="text-center">{{ title }}</div>
    <div class="d-flex">
      <ul class="rate pa-0 mx-auto">
        <li v-for="rate in 5" :key="rate" class="star" :class="{ mark: rating >= rate }" @click="updateRating(rate)" />
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      id: Number,
      title: String,
      poster: String,
      rating: Number
    },

    methods: {
      updateRating(rating) {
        this.$emit("update-rating", rating)
      }
    }
  }
</script>

<style scoped lang="scss">
  img {
    max-width: 30em;
    height: 10em;
  }

  .rate:hover .star, .rate:not(:hover) .star.mark {
    color: #06c;
  }

  .rate .star {
    margin: 0;
    padding: 0;
    display: inline-block;
    font-size: 16px;
    cursor: pointer;
    color: #fff;
    text-shadow:
      0 1px #06c,
      0 -1px #06c,
      1px 0 #06c,
      -1px 0 #06c;
  }

  .rate .star:before {
    content: '\2605';
  }

  .rate .star:hover ~ .star {
    color: #fff;
  }
</style>