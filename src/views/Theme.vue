<template>
  <div class="theme-wrap" :class="themeClass">
    <parent :message="msg">
      <template slot="header" slot-scope="{text}">
        {{text}}
      </template>
      <div>test 1 in theme.vue</div>
      <div>test 2 in theme.vue</div>
    </parent>
    <div>{{num.toLocaleString()}}</div>
    <div class="test-css-module">{{num.toLocaleString()}}</div>
    <button @click="changeColor">change color</button>
    <el-row>
      <el-button>默认按钮</el-button>
      <el-button type="primary">主要按钮</el-button>
      <el-button type="success">成功按钮</el-button>
      <el-button type="info">信息按钮</el-button>
      <el-button type="warning">警告按钮</el-button>
      <el-button type="danger">危险按钮</el-button>
    </el-row>
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
import Parent from "./slot/parent";

export default {
  name: "app",
  components: { Parent },
  data() {
    return {
      msg: "Dynamic Themes",
      theme: "red",
      num: 8462948.24
    };
  },
  computed: {
    themeClass() {
      return `theme-${this.theme}`;
    }
  },
  methods: {
    changeColor() {
      // css 自定义变量
      document.body.style.setProperty("--mytheme-color", "#7F583F");
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
