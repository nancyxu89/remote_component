import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import ACE from "./views/ace.vue";
import Iframe from "./views/iframe.vue";
import Table from "./views/table.vue";
import TestNextTick from "./views/TestNextTick.vue";
// import Theme from "./views/Theme.vue";webpackPrefetch: true;

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/ace",
      name: "ACE",
      component: ACE
    },
    {
      path: "/iframe",
      name: "iframe",
      component: Iframe
    },
    {
      path: "/table",
      name: "table",
      component: Table
    },
    {
      path: "/nextTick",
      name: "TestNextTick",
      component: TestNextTick
    },
    {
      path: "/theme",
      name: "theme",
      component: () =>
        import(/* webpackChunkName: "theme" */ "./views/Theme.vue")
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    }
  ]
});
