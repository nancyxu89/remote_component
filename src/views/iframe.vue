<template>
    <div class="iframe-wrap">
      <async-example></async-example>
        <p></p>
        <input type="text" v-model="val">
        <!--<button @click="sendMessage">send</button>-->
        <!--<button @click="clearTimer">clear timer</button>-->
        <!--<iframe id="iframe1" src="http://192.168.206.150:18080/about" frameborder="0"></iframe>-->
        <!--<iframe id="iframe2" src="http://192.168.206.150:18080/about" frameborder="0"></iframe>-->
        <!--<div id="message"></div>-->
        <!--<el-tree-->
                <!--ref="tree"-->
                <!--:data="data6"-->
                <!--node-key="id"-->
                <!--default-expand-all-->
                <!--@node-drag-start="handleDragStart"-->
                <!--@node-drag-enter="handleDragEnter"-->
                <!--@node-drag-leave="handleDragLeave"-->
                <!--@node-drag-over="handleDragOver"-->
                <!--@node-drag-end="handleDragEnd"-->
                <!--@node-drop="handleDrop"-->
                <!--draggable-->
                <!--:allow-drop="allowDrop"-->
                <!--:allow-drag="allowDrag">-->
             <!--<div class="custom-tree-node" slot-scope="{ node }">-->
                 <!--<el-popover-->
                         <!--placement="top-start"-->
                         <!--title="标题"-->
                         <!--width="200"-->
                         <!--trigger="hover"-->
                         <!--content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。">-->
                <!--<span slot="reference">{{ node.label }}</span>-->
                <!--</el-popover>-->
            <!--</div>-->

        <!--</el-tree>-->
       <div style="width: 640px;">
           <el-tree
                   style="float: left;width: 49%"
                   ref="tree"
                   :data="data6"
                   node-key="id"
                   default-expand-all
                   @node-drag-end="handleDragEnd"
                   @node-drop="handleDrop"
                   draggable
                   :allow-drop="allowDrop"
                   :allow-drag="allowDrag">
               <div class="custom-tree-node" slot-scope="{ node }">{{ node.label }}</div>
           </el-tree>
       </div>
        <el-table
                id="tableTest"
                :data="tableData"
                style="width: 100%"
                :default-sort = "{prop: 'date', order: 'descending'}">
            <el-table-column
                    prop="date"
                    label="日期"
                    sortable
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="name"
                    label="姓名"
                    sortable
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="address"
                    label="地址"
                    :formatter="formatter">
            </el-table-column>
        </el-table>
        <el-input id="input"></el-input>
        <button class="btn" data-clipboard-target="#input" @click="copy('#input')">
            Copy input to clipboard
        </button>
        <button class="btn" data-clipboard-target="#tableTest" @click="copy('#tableTest')">
            Copy to clipboard
        </button>
    </div>
</template>
<script>
import Clipboard from "clipboard";
export default {
  data() {
    return {
      val: "",
      fromParenPort: null,
      data6: [
        {
          id: 1,
          label: "一级 1",
          children: [
            {
              id: 4,
              label: "二级 1-1",
              children: [
                {
                  id: 9,
                  label: "三级 1-1-1"
                },
                {
                  id: 10,
                  label: "三级 1-1-2"
                }
              ]
            }
          ]
        },
        {
          id: 2,
          label: "一级 2",
          children: [
            {
              id: 5,
              label: "二级 2-1"
            },
            {
              id: 6,
              label: "二级 2-2"
            }
          ]
        },
        {
          id: 3,
          label: "一级 3",
          children: [
            {
              id: 7,
              label: "二级 3-1"
            },
            {
              id: 8,
              label: "二级 3-2",
              children: [
                {
                  id: 11,
                  label: "三级 3-2-1"
                },
                {
                  id: 12,
                  label: "三级 3-2-2"
                },
                {
                  id: 13,
                  label: "三级 3-2-3"
                }
              ]
            }
          ]
        }
      ],
      defaultProps: {
        children: "children",
        label: "label"
      },
      tableData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄"
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄"
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄"
        }
      ]
    };
  },
  methods: {
    handleDragStart(node) {
      console.log("drag start", node);
    },
    handleDragEnter(draggingNode, dropNode) {
      console.log("tree drag enter: ", dropNode.label);
    },
    handleDragLeave(draggingNode, dropNode) {
      console.log("tree drag leave: ", dropNode.label);
    },
    handleDragOver(draggingNode, dropNode) {
      console.log("tree drag over: ", dropNode.label);
    },
    handleDragEnd(draggingNode, dropNode) {
      //      console.log("tree drag end: ", dropNode && dropNode.label, dropType);
      //        console.log(dropNode)
      //      let curIndex = 0
      //      draggingNode && draggingNode.parent.children && draggingNode.parent.children.map((item,index) => {
      //          if (item.id === draggingNode.id) {
      //            curIndex = index
      //        }
      //      })
      //      console.log("tree drag end: ", draggingNode.id, draggingNode.parent.id, curIndex);
      console.log("tree drag end: ", draggingNode, dropNode);
    },
    handleDrop(draggingNode, dropNode, dropType) {
      console.log("tree drop: ", dropNode.label, dropType);
    },
    allowDrop(draggingNode, dropNode, type) {
      console.log("allowDrop", type, dropNode);
      if (dropNode.data.label === "二级 3-1") {
        return type !== "inner";
      } else {
        return !(dropNode.level === 1);
      }
    },
    allowDrag(draggingNode) {
      return (
        draggingNode.data.label.indexOf("三级 3-2-2") === -1 &&
        draggingNode.level !== 1
      );
    },
    sendMessage() {
      this.fromParenPort.postMessage(this.val);
    },
    messageChannelTest() {
      function random(min, max) {
        return min + Math.floor((max - min + 1) * Math.random());
      }

      var CalculatorChannel = new MessageChannel();
      var calculator = CalculatorChannel.port1;
      var numGenerator = CalculatorChannel.port2;
      console.log(numGenerator.postMessage);
      calculator.onmessage = function(event) {
        //console.log("port1收到来自port2的数据：" + event.data);
        var d = event.data;
        console.log("num1: " + d.num1, "num2: " + d.num2);
        var sum = d.num1 + d.num2;
        calculator.postMessage(sum);
      };

      numGenerator.onmessage = function(event) {
        //console.log("port2收到来自port1的数据：" + event.data);
        console.log("结果为：" + event.data);
      };

      // 生成数字
      this.timer = setInterval(() => {
        numGenerator.postMessage({
          num1: random(1, 10),
          num2: random(1, 10)
        });
      }, 1000);
    },
    clearTimer() {
      this.timer && clearInterval(this.timer);
    },
    formatter(row) {
      return row.address;
    },
    copy() {
      var clipboard = new Clipboard(".btn");
      clipboard.on("success", e => {
        this.$message.success("复制成功!");
        // 释放内存
        clipboard.destroy();
        e.clearSelection();
      });
      clipboard.on("error", () => {
        this.$message.info("该浏览器不支持自动复制!");
        // 释放内存
        clipboard.destroy();
      });
    }
  },
  mounted() {
    //    var channel = new MessageChannel();
    //
    //    var ifr1 = document.querySelector("#iframe1");
    //    var otherWindow = ifr1.contentWindow;
    //
    //    ifr1.addEventListener("load", iframeLoaded, false);
    //
    //    function iframeLoaded() {
    //      otherWindow.postMessage("Hello from iframeLoaded!", "*", [channel.port2]);
    //    }
    //
    //    channel.port1.onmessage = handleMessage;
    //
    //    window.addEventListener("message", e => {
    //      console.log(e.data);
    //      if (e.ports) {
    //        this.fromParenPort = e.ports[0];
    //      }
    //    });
    //    function handleMessage(e) {
    //      console.log(e.data);
    //      if (e.ports) {
    //        this.fromParenPort = e.ports[0];
    //      }
    //    }
    //    channel.port1.start();
    // this.messageChannelTest();
    //    function deepClone(obj) {
    //      return new Promise(function(resolve) {
    //        var { port1, port2 } = new MessageChannel();
    //        port1.onmessage = function(e) {
    //          console.log(e.data);
    //          resolve(e.data);
    //        };
    //        port2.postMessage(obj);
    //      });
    //    }
    //    var a = { a: 1, test: undefined };
    //
    //    deepClone(a).then(e => console.log(a == e));
    //    var eleBox = document.querySelector("#message");
    //    var channel2 = new MessageChannel();
    //    //向父窗口发送消息，
    //    window.parent.postMessage("发送页加载完毕", "*", [channel2.port2]);
    //    /*   channel.port1.addEventListener('message', function(e){
    //       eleBox.innerHTML='通道获取的消息为：'+e.data;
    //       }, false); */
    //    channel2.port1.onmessage = function(e) {
    //      eleBox.innerHTML = "通道获取的消息为：" + e.data;
    //    };
    //    channel2.port1.start();
  }
};
</script>
<style lang="scss" scoped>
.iframe-wrap {
  iframe {
    float: left;
    width: 30%;
    height: 500px;
    margin-right: 10%;
  }
}
</style>
