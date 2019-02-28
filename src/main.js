import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ace from "ace-builds";
import ElementUI from "element-ui";

import "element-ui/lib/theme-chalk/index.css";
import Raven from "raven-js";
import RavenVue from "raven-js/plugins/vue";
import "./assets/watermark.js";

Raven.config("https://29da5dc46107400f87459425ee5bd717@sentry.io/1381884")
  .addPlugin(RavenVue, Vue)
  .install();
Vue.config.productionTip = false;
Vue.use(ace);
Vue.use(ElementUI);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
