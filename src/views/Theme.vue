<template>
  <div class="theme-wrap" :class="themeClass">
    <div class="wrap-container">
      <p>{{ msg }}</p>
      <select v-model="theme">
        <option value="red">Red</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
      </select>
    </div>
  </div>
</template>
<script>
export default {
  name: "app",
  data() {
    return {
      msg: "Dynamic Themes",
      theme: "red"
    };
  },
  computed: {
    themeClass() {
      return `theme-${this.theme}`;
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../assets/styles/theme.scss";
.wrap-container {
  @include themify($themes) {
    color: themed("font-color");
  }
}
</style>
