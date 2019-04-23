import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  state: {
    appName: "myeditor"
  },
  mutations: {
    changename(state, data) {
      state["appName"] = data;
    }
  },
  actions: {
    changename: ({ commit }, data) => {
      commit("changename", data);
    }
  }
});
