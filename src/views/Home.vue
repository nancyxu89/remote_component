<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" @touch="handleTouch" @click="handleTouch">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "home",
  components: {
    HelloWorld
  },
  methods: {
    handleTouch() {
      console.log("touch or click");
      alert(window.navigator.webkitVibrate);
      window.navigator.vibrate && window.navigator.vibrate(1000);
      window.navigator.webkitVibrate && window.navigator.webkitVibrate(1000);
    }
  }
};
</script>
