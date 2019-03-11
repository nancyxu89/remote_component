import Vue from "vue";
// import * as axios from "axios";
import LoadingComp from "./loading.vue";
import ErrorComp from "./error.vue";
console.log(LoadingComp);
const AsyncComp = () => ({
  // 需要加载的组件。应当是一个 Promise
  component: new Promise(resolve => {
    setTimeout(() => {
      // axios.get("http://localhost:13001/template/hello.js").then(res => {
      //   let Fn = Function;
      //   let mode = new Fn(`return ${res.data}`)();
      //   resolve(
      //     new Promise(rv => {
      //       rv(mode);
      //     })
      //   );
      // });

      resolve(import("./test.vue"));
    }, 2000);
  }),
  // 加载中应当渲染的组件
  loading: LoadingComp,
  // 出错时渲染的组件
  error: ErrorComp,
  // 渲染加载中组件前的等待时间。默认：200ms。
  delay: 100,
  // 最长等待时间。超出此时间则渲染错误组件。默认：Infinity
  timeout: 3000
});
Vue.component("async-example", AsyncComp);
