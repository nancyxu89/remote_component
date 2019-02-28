import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import ACE from "./views/ace.vue";
import Iframe from "./views/iframe.vue";
import Table from "./views/table.vue";

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
