(function(watermark) {
  window.watermarkdivs = [];
  let shadowRoot;
  let loadMark = function(settings) {
    let defaultSettings = Object.assign(
      {
        watermark_id: "wm_div_id",
        watermark_txt: "测试水印",
        watermark_x: 20,
        watermark_y: 20,
        watermark_rows: 0,
        watermark_cols: 0,
        watermark_x_space: 100,
        watermark_y_space: 50,
        watermark_font: "微软雅黑",
        watermark_color: "black",
        watermark_fontsize: "18px",
        watermark_alpha: 0.005,
        watermark_width: 150,
        watermark_height: 100,
        watermark_angle: 15
      },
      settings
    );
    if (arguments.length === 1 && typeof arguments[0] === "object") {
      let src = arguments[0] || {};
      for (let key in src) {
        if (
          src[key] &&
          defaultSettings[key] &&
          src[key] === defaultSettings[key]
        ) {
          continue;
        } else {
          if (src[key]) {
            defaultSettings[key] = src[key];
          }
        }
      }
    }
    let watermark_element = document.getElementById(
      defaultSettings.watermark_id
    );
    if (watermark_element) {
      let _parentElement = watermark_element.parentNode;
      if (_parentElement) {
        _parentElement.removeChild(watermark_element);
      }
    }
    let page_width = Math.max(
      document.body.scrollWidth,
      document.body.clientWidth
    );
    let page_height = Math.max(
      document.body.scrollHeight,
      document.body.clientHeight
    );
    let otdiv = document.getElementById(defaultSettings.watermark_id);
    if (!otdiv) {
      otdiv = document.createElement("div");
      otdiv.id = defaultSettings.watermark_id;
      otdiv.style.pointerEvents = "none";
      if (typeof otdiv.createShadowRoot === "function") {
        shadowRoot = otdiv.createShadowRoot();
      } else {
        shadowRoot = otdiv;
      }
      let nodeList = document.body.children;
      let index = Math.floor(Math.random() * (nodeList.length - 1));
      if (nodeList[index]) {
        document.body.insertBefore(otdiv, nodeList[index]);
      } else {
        document.body.appendChild(otdiv);
      }
    } else {
      if ((otdiv, shadowRoot)) {
        shadowRoot = otdiv.shadowRoot;
      }
    }
    if (
      defaultSettings.watermark_cols == 0 ||
      parseInt(
        defaultSettings.watermark_x +
          defaultSettings.watermark_width * defaultSettings.watermark_cols +
          defaultSettings.watermark_x_space *
            (defaultSettings.watermark_cols - 1)
      ) > page_width
    ) {
      defaultSettings.watermark_cols = parseInt(
        (page_width -
          defaultSettings.watermark_x +
          defaultSettings.watermark_x_space) /
          (defaultSettings.watermark_width + defaultSettings.watermark_x_space)
      );
      defaultSettings.watermark_x_space = parseInt(
        (page_width -
          defaultSettings.watermark_x -
          defaultSettings.watermark_width * defaultSettings.watermark_cols) /
          (defaultSettings.watermark_cols - 1)
      );
    }
    if (
      defaultSettings.watermark_rows == 0 ||
      parseInt(
        defaultSettings.watermark_y +
          defaultSettings.watermark_height * defaultSettings.watermark_rows +
          defaultSettings.watermark_y_space *
            (defaultSettings.watermark_rows - 1)
      ) > page_height
    ) {
      defaultSettings.watermark_rows = parseInt(
        (defaultSettings.watermark_y_space +
          page_height -
          defaultSettings.watermark_y) /
          (defaultSettings.watermark_height + defaultSettings.watermark_y_space)
      );
      defaultSettings.watermark_y_space = parseInt(
        (page_height -
          defaultSettings.watermark_y -
          defaultSettings.watermark_height * defaultSettings.watermark_rows) /
          (defaultSettings.watermark_rows - 1)
      );
    }
    let x;
    let y;
    for (let i = 0; i < defaultSettings.watermark_rows; i++) {
      y =
        defaultSettings.watermark_y +
        (defaultSettings.watermark_y_space + defaultSettings.watermark_height) *
          i;
      for (let j = 0; j < defaultSettings.watermark_cols; j++) {
        x =
          defaultSettings.watermark_x +
          (defaultSettings.watermark_width +
            defaultSettings.watermark_x_space) *
            j;
        let mask_div = document.createElement("div");
        let oText = document.createTextNode(defaultSettings.watermark_txt);
        mask_div.appendChild(oText);
        mask_div.id = defaultSettings.watermark_id + i + j;
        mask_div.style.webkitTransform =
          "rotate(-" + defaultSettings.watermark_angle + "deg)";
        mask_div.style.MozTransform =
          "rotate(-" + defaultSettings.watermark_angle + "deg)";
        mask_div.style.msTransform =
          "rotate(-" + defaultSettings.watermark_angle + "deg)";
        mask_div.style.OTransform =
          "rotate(-" + defaultSettings.watermark_angle + "deg)";
        mask_div.style.transform =
          "rotate(-" + defaultSettings.watermark_angle + "deg)";
        mask_div.style.visibility = "";
        mask_div.style.position = "absolute";
        mask_div.style.left = x + "px";
        mask_div.style.top = y + "px";
        mask_div.style.overflow = "hidden";
        mask_div.style.zIndex = "9999";
        mask_div.style.opacity = defaultSettings.watermark_alpha;
        mask_div.style.fontSize = defaultSettings.watermark_fontsize;
        mask_div.style.fontFamily = defaultSettings.watermark_font;
        mask_div.style.color = defaultSettings.watermark_color;
        mask_div.style.textAlign = "center";
        mask_div.style.width = defaultSettings.watermark_width + "px";
        mask_div.style.height = defaultSettings.watermark_height + "px";
        mask_div.style.display = "block";
        shadowRoot.appendChild(mask_div);
      }
    }
  };
  watermark.init = function(settings) {
    window.addEventListener("load", function() {
      loadMark(settings);
    });
    window.addEventListener("resize", function() {
      loadMark(settings);
    });
    window.addEventListener("DOMContentLoaded", function() {
      loadMark(settings);
    });
  };
  watermark.load = function(settings) {
    loadMark(settings);
  };
  watermark.getCookie = function(name) {
    let arr,
      reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if ((arr = document.cookie.match(reg))) {
      return arr[2];
    }
    return null;
  };
  watermark.IsPC = function() {
    let userAgentInfo = navigator.userAgent;
    let Agents = [
      "Android",
      "iPhone",
      "SymbianOS",
      "Windows Phone",
      "iPad",
      "iPod"
    ];
    let flag = true;
    for (let v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    return flag;
  };
})((window.watermark = {}));
let timer = 0;
if (window.watermark.IsPC()) {
  timer = 300;
} else {
  timer = 1000;
}
setTimeout(function() {
  // let userInfo = window.watermark.IsPC()
  //   ? JSON.parse(decodeURIComponent(window.watermark.getCookie("ymmoa_user")))
  //   : window.app.userInfo;
  let date = new Date();
  // userInfo &&
  window.watermark.load({
    watermark_txt:
      // (userInfo.name || userInfo.userName) +
      // " " +
      // userInfo.jobNumber +
      "徐媛媛 Y0010132" +
      " " +
      date.getFullYear() +
      (date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1) +
      date.getDate(),
    watermark_alpha: 0.005,
    watermark_x_space: 10,
    watermark_y_space: 10,
    watermark_height: 60,
    watermark_width: 120,
    watermark_color: "red"
  });
}, timer);
