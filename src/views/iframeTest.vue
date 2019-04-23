<template>
    <div class="page">
        <div class="content">
            欢迎来到 {{packageInfo.description}}
            <button @click="isShow=!isShow">click</button>
            <iframe style="width: 100%;height: 600px;" :src="iframeSrc"></iframe>
            <iframe style="width: 100%;height: 600px;" src="http://dev-boss.testoa.com/data-index-service/#/secondIndicator"></iframe>
            <iframe :class="['iframe-style', isShow?'h600':'h0']" src="http://web.testoa.com:9100/#/exportApply?key=1&name=test" v-if="isShow"></iframe>
        </div>
    </div>
</template>

<style lang="stylus" rel="stylesheet/stylus" scoped type="text/stylus">
    .content
        margin 100px auto
        width 80%
        font-size 32px
        text-align center
    .iframe-style
        position fixed
        top 0
        left 0
        width 100%
        height 900px
        background-color transparent
    .h600
        height 900px!important
    .h6
        height 0!important
</style>

<script>
import BasePage from "src/extend/BasePage";
import { mapState } from "vuex";

export default {
  mixins: [BasePage],
  components: {},
  name: "home",
  data() {
    return {
      isShow: false,
      iframeSrc: "http://web.testoa.com:8800/#/firstIndicator"
    };
  },
  computed: mapState({
    packageInfo: state => state.app.packageInfo
  }),
  methods: {
    changeIframeSrc(src) {
      this.iframeSrc = src;
    }
  },
  mounted() {
    //    window.addEventListener(
    //      "message",
    //      event => {
    //        console.log(event.data);
    //        if (event.data.type === "close" || event.data.type === "submit") {
    //          this.isShow = false;
    //        }
    //      },
    //      false
    //    );
  },
  created() {
    //    window["changeIframeSrc"] = src => {
    //      this.changeIframeSrc(src);
    //    };
  }
};
</script>
