<template>
  <div>{{params.msg}}</div>
</template>
<script>
export default {
  name: "a-component",
  data() {
    return {
      params: {}
    };
  },
  mounted() {
    this.params = Object.assign({}, this.$attrs);
  }
};
</script>
<style lang="scss" scoped>
</style>
