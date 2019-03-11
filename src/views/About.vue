<template>
  <div class="about">
    <h1>This is an about page</h1>
      <button @click="sendMessage">post message</button>
      <button @click="formatStrFn">formate str</button>
      <div v-html="formatJSON"></div>
      <pre>{{formatJSON}}</pre>
      <p>开始时间: <input type="text" v-model="startTime"></p>
      <p>结束时间: <input type="text" v-model="endTime"></p>
      <button @click="toggle=!toggle">toggle</button>
      <button @click="computeTime">compute</button>
      <span>{{timeDiff/60}}</span>
      <component
              :is="mode"
              v-bind="$attrs"
              v-on="$listeners">
      </component>
      <component
        :is="modeOther"
        v-bind="{from:'test'}"
        v-on="$listeners">
      </component>
      async component <a href="https://github.com/luciy/vue-async-component.git" target="_blank">git address</a>:
    <!--<span> {{rawStr | json}}</span>-->
  </div>
</template>
<script>
import * as axios from "axios";
import Fetch from "../assets/fetch";
export default {
  data() {
    return {
      test: undefined,
      rawStr:
        '[{"姓名": "测试1", "年纪": 31, "座机": "+861063935811", "籍贯": "北京市", "职业": "程序员1", "邮箱": "10000000@qq.com", ' +
        '"手机号": "15010067551", "身份证": "110102199704308511", "兴趣爱好": "兴趣爱好1", "家庭住址": "北京市海淀区莲花池西路1号1", ' +
        '"工作单位": "七一小学"}, {"姓名": "测试2", "年纪": 32, "座机": "+861063935812", "籍贯": "北京市", "职业": "程序员2", ' +
        '"邮箱": "20000000@qq.com", "手机号": "15010067552", "身份证": "110102199704308512", "兴趣爱好": "兴趣爱好2", "家庭住址": "北京市海淀区莲花池西路1号2", ' +
        '"工作单位": "七一小学"}, {"姓名": "测试3", "年纪": 33, "座机": "+861063935813", "籍贯": "北京市", "职业": "程序员3", "邮箱": "30000000@qq.com", ' +
        '"手机号": "15010067553", "身份证": "110102199704308513", "兴趣爱好": "兴趣爱好3", "家庭住址": "北京市海淀区莲花池西路1号3", "工作单位": "七一小学"}]',
      formatJSON: "",
      startTime: new window.moment().format("YYYY-MM-DD") + " 08:50:00",
      endTime: new window.moment().format("YYYY-MM-DD") + " 18:50:00",
      timeDiff: "",
      toggle: false,
      mode: "",
      modeOther: ""
    };
  },
  methods: {
    computeTime() {
      let startTime = window.moment(this.startTime);
      let endTime = new window.moment();
      this.toggle ? (this.endTime = endTime.format("YYYY-MM-DD HH:mm:ss")) : "";
      this.timeDiff = (this.toggle
        ? endTime
        : window.moment(this.endTime)
      ).diff(startTime, "minute");
      //      console.log(this.timeDiff);
      //      console.log(endTime - startTime);
    },
    sendMessage() {
      var channel = new MessageChannel();
      window.parent.postMessage("Hello from the about page!", "*", [
        channel.port2
      ]);
      channel.port1.onmessage = handleMessage;
      function handleMessage(e) {
        console.log(e.data);
      }
    },
    formatStrFn() {
      this.formatJSON = JSON.stringify(JSON.parse(this.rawStr), null, 4);
      //      console.re.log(this.formatJSON);
      //      console.re.log(JSON.parse(this.test));
      //      console.re.log("console.re.log");
    },
    getTagsMap() {
      return [...document.querySelectorAll("*")].reduce((a, c) => {
        let tagName = c.tagName.toLowerCase();
        if (a[tagName]) {
          a[tagName] += 1;
        } else {
          a[tagName] = 1;
        }
        return a;
      }, {});
    }
  },
  mounted() {
    axios.get("http://localhost:13001/static/components/a.js").then(res => {
      let Fn = Function;
      this.mode = new Fn(`return ${res.data}`)();
      //      console.log(this.mode);
    });
    //    axios.get("http://localhost:13001/template/hello.js").then(res => {
    //      let Fn = Function;
    //      this.modeOther = new Fn(`return ${res.data}`)();
    //      //      console.log(this.modeOther);
    //    });
    setTimeout(() => {
      console.log(this.getTagsMap());
    }, 3000);

    //    let responseCopy;
    //    fetch("http://localhost:13001/template/test.json", {
    fetch("http://localhost:13001/template/hello.js", {
      method: "get",
      mode: "cors",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain"
      }
    })
      .then(res => {
        return res.text();
      })
      .then(txt => {
        let Fn = Function;
        this.modeOther = new Fn(`return ${txt}`)();
        return txt;
      })
      .catch(err => {
        console.log("请求错误", err);
      });
    Fetch("/guest", {
      method: "post"
    }).then(res => {
      console.log("Fetch", res);
      console.log(Fetch.systemError);
    });
  }
};
</script>
