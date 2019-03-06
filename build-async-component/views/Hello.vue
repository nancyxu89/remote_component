<template>
  <div>{{msg}}</div>
</template>
<script>
  export default{
    props: {
      from: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        msg: this.from
      }
    }
  }
</script>
<style lang="scss" scoped></style>