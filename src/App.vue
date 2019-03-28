<template>
  <div id="app" @keyup.ctrl.enter.native="doCtrlEnter">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>|
      <router-link to="/ace">ACE</router-link>|
      <router-link to="/iframe">iframe</router-link>
      <!--<router-link to="/nextTick">test nexttick</router-link>-->
        <!--|<a href=" http://localhost:8080/" target="_blank">click</a>-->
    </div>
      {{gamma}}{{beta}}{{Alpha}}
    <router-view/>
  </div>
</template>
<script>
export default {
  provide: {
    from: "provide  inject type: app.vue"
  },
  data() {
    return {
      gamma: 0,
      beta: 0,
      Alpha: 0
    };
  },
  methods: {
    doCtrlEnter() {
      console.log("doCtrlEnter");
    }
  },
  mounted() {
    //    window.addEventListener("deviceorientation", e => {
    //      console.log("Gamma:", e.gamma);
    //      console.log("Beta:", e.beta);
    //      console.log("Alpha:", e.Alpha);
    //      this.gamma = e.gamma;
    //      this.beta = e.beta;
    //      this.Alpha = e.Alpha;
    //    });
    //    window.onbeforeunload = e => {
    //      e = e || window.event;
    //
    //      // 兼容IE8和Firefox 4之前的版本
    //      if (e) {
    //        e.returnValue = "关闭提示";
    //      }
    //
    //      // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
    //      return "关闭提示";
    //    };
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
