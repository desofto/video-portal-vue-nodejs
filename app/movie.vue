<template>
  <div class="movie">
    <div>
      <img :src="poster" />
    </div>
    <div class="text-center">{{ title }}</div>
    <div class="d-flex">
      <ul class="rate pa-0 mx-auto">
        <li class="star"></li>
        <li class="star"></li>
        <li class="star"></li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      title: String,
      poster: String
    }
  }
</script>

<style scoped lang="scss">
  img {
    max-width: 10em;
    max-height: 20em;
  }

  .rate:hover .star {
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