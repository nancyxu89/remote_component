(function (e) {
  var t = {};

  function r(n) {
    if (t[n]) {
      return t[n].exports
    }
    var a = t[n] = {i: n, l: false, exports: {}};
    e[n].call(a.exports, a, a.exports, r);
    a.l = true;
    return a.exports
  }

  r.m = e;
  r.c = t;
  r.d = function (e, t, n) {
    if (!r.o(e, t)) {
      Object.defineProperty(e, t, {configurable: false, enumerable: true, get: n})
    }
  };
  r.n = function (e) {
    var t = e && e.__esModule ? function t() {
      return e["default"]
    } : function t() {
      return e
    };
    r.d(t, "a", t);
    return t
  };
  r.o = function (e, t) {
    return Object.prototype.hasOwnProperty.call(e, t)
  };
  r.p = "";
  return r(r.s = 4)
})([function (e, t) {
  e.exports = function (e) {
    var t = [];
    t.toString = function t() {
      return this.map(function (t) {
        var n = r(t, e);
        if (t[2]) {
          return "@media " + t[2] + "{" + n + "}"
        } else {
          return n
        }
      }).join("")
    };
    t.i = function (e, r) {
      if (typeof e === "string")e = [[null, e, ""]];
      var n = {};
      for (var a = 0; a < this.length; a++) {
        var o = this[a][0];
        if (typeof o === "number")n[o] = true
      }
      for (a = 0; a < e.length; a++) {
        var i = e[a];
        if (typeof i[0] !== "number" || !n[i[0]]) {
          if (r && !i[2]) {
            i[2] = r
          } else if (r) {
            i[2] = "(" + i[2] + ") and (" + r + ")"
          }
          t.push(i)
        }
      }
    };
    return t
  };
  function r(e, t) {
    var r = e[1] || "";
    var a = e[3];
    if (!a) {
      return r
    }
    if (t && typeof btoa === "function") {
      var o = n(a);
      var i = a.sources.map(function (e) {
        return "/*# sourceURL=" + a.sourceRoot + e + " */"
      });
      return [r].concat(i).concat([o]).join("\n")
    }
    return [r].join("\n")
  }

  function n(e) {
    var t = btoa(unescape(encodeURIComponent(JSON.stringify(e))));
    var r = "sourceMappingURL=data:application/json;charset=utf-8;base64," + t;
    return "/*# " + r + " */"
  }
}, function (e, t, r) {
  var n = typeof document !== "undefined";
  if (typeof DEBUG !== "undefined" && DEBUG) {
    if (!n) {
      throw new Error("vue-style-loader cannot be used in a non-browser environment. " + "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.")
    }
  }
  var a = r(2);
  var o = {};
  var i = n && (document.head || document.getElementsByTagName("head")[0]);
  var s = null;
  var u = 0;
  var f = false;
  var c = function () {
  };
  var l = typeof navigator !== "undefined" && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase());
  e.exports = function (e, t, r) {
    f = r;
    var n = a(e, t);
    p(n);
    return function t(r) {
      var i = [];
      for (var s = 0; s < n.length; s++) {
        var u = n[s];
        var f = o[u.id];
        f.refs--;
        i.push(f)
      }
      if (r) {
        n = a(e, r);
        p(n)
      } else {
        n = []
      }
      for (var s = 0; s < i.length; s++) {
        var f = i[s];
        if (f.refs === 0) {
          for (var c = 0; c < f.parts.length; c++) {
            f.parts[c]()
          }
          delete o[f.id]
        }
      }
    }
  };
  function p(e) {
    for (var t = 0; t < e.length; t++) {
      var r = e[t];
      var n = o[r.id];
      if (n) {
        n.refs++;
        for (var a = 0; a < n.parts.length; a++) {
          n.parts[a](r.parts[a])
        }
        for (; a < r.parts.length; a++) {
          n.parts.push(d(r.parts[a]))
        }
        if (n.parts.length > r.parts.length) {
          n.parts.length = r.parts.length
        }
      } else {
        var i = [];
        for (var a = 0; a < r.parts.length; a++) {
          i.push(d(r.parts[a]))
        }
        o[r.id] = {id: r.id, refs: 1, parts: i}
      }
    }
  }

  function v() {
    var e = document.createElement("style");
    e.type = "text/css";
    i.appendChild(e);
    return e
  }

  function d(e) {
    var t, r;
    var n = document.querySelector('style[data-vue-ssr-id~="' + e.id + '"]');
    if (n) {
      if (f) {
        return c
      } else {
        n.parentNode.removeChild(n)
      }
    }
    if (l) {
      var a = u++;
      n = s || (s = v());
      t = m.bind(null, n, a, false);
      r = m.bind(null, n, a, true)
    } else {
      n = v();
      t = g.bind(null, n);
      r = function () {
        n.parentNode.removeChild(n)
      }
    }
    t(e);
    return function n(a) {
      if (a) {
        if (a.css === e.css && a.media === e.media && a.sourceMap === e.sourceMap) {
          return
        }
        t(e = a)
      } else {
        r()
      }
    }
  }

  var h = function () {
    var e = [];
    return function (t, r) {
      e[t] = r;
      return e.filter(Boolean).join("\n")
    }
  }();

  function m(e, t, r, n) {
    var a = r ? "" : n.css;
    if (e.styleSheet) {
      e.styleSheet.cssText = h(t, a)
    } else {
      var o = document.createTextNode(a);
      var i = e.childNodes;
      if (i[t])e.removeChild(i[t]);
      if (i.length) {
        e.insertBefore(o, i[t])
      } else {
        e.appendChild(o)
      }
    }
  }

  function g(e, t) {
    var r = t.css;
    var n = t.media;
    var a = t.sourceMap;
    if (n) {
      e.setAttribute("media", n)
    }
    if (a) {
      r += "\n/*# sourceURL=" + a.sources[0] + " */";
      r += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(a)))) + " */"
    }
    if (e.styleSheet) {
      e.styleSheet.cssText = r
    } else {
      while (e.firstChild) {
        e.removeChild(e.firstChild)
      }
      e.appendChild(document.createTextNode(r))
    }
  }
}, function (e, t) {
  e.exports = function e(t, r) {
    var n = [];
    var a = {};
    for (var o = 0; o < r.length; o++) {
      var i = r[o];
      var s = i[0];
      var u = i[1];
      var f = i[2];
      var c = i[3];
      var l = {id: t + ":" + o, css: u, media: f, sourceMap: c};
      if (!a[s]) {
        n.push(a[s] = {id: s, parts: [l]})
      } else {
        a[s].parts.push(l)
      }
    }
    return n
  }
}, function (e, t) {
  e.exports = function e(t, r, n, a, o, i) {
    var s;
    var u = t = t || {};
    var f = typeof t.default;
    if (f === "object" || f === "function") {
      s = t;
      u = t.default
    }
    var c = typeof u === "function" ? u.options : u;
    if (r) {
      c.render = r.render;
      c.staticRenderFns = r.staticRenderFns;
      c._compiled = true
    }
    if (n) {
      c.functional = true
    }
    if (o) {
      c._scopeId = o
    }
    var l;
    if (i) {
      l = function (e) {
        e = e || this.$vnode && this.$vnode.ssrContext || this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext;
        if (!e && typeof __VUE_SSR_CONTEXT__ !== "undefined") {
          e = __VUE_SSR_CONTEXT__
        }
        if (a) {
          a.call(this, e)
        }
        if (e && e._registeredComponents) {
          e._registeredComponents.add(i)
        }
      };
      c._ssrRegister = l
    } else if (a) {
      l = a
    }
    if (l) {
      var p = c.functional;
      var v = p ? c.render : c.beforeCreate;
      if (!p) {
        c.beforeCreate = v ? [].concat(v, l) : [l]
      } else {
        c.render = function e(t, r) {
          l.call(r);
          return v(t, r)
        }
      }
    }
    return {esModule: s, exports: u, options: c}
  }
}, function (e, t, r) {
  function n(e) {
    r(5)
  }

  var a = r(3);
  var o = r(7);
  var i = r(8);
  var s = false;
  var u = n;
  var f = "data-v-31de3e06";
  var c = null;
  var l = a(o, i, s, u, f, c);
  e.exports = l.exports
}, function (e, t, r) {
  var n = r(6);
  if (typeof n === "string")n = [[e.i, n, ""]];
  if (n.locals)e.exports = n.locals;
  var a = r(1)("be6b4f66", n, true)
}, function (e, t, r) {
  t = e.exports = r(0)(true);
  t.push([e.i, ".component .title[data-v-31de3e06]{line-height:2}", "", {
    version: 3,
    sources: ["/Users/luciy/Desktop/dev/vue-async-component/src/views/component-a.vue"],
    names: [],
    mappings: "AACA,mCACE,aAAe,CAChB",
    file: "component-a.vue",
    sourcesContent: ["\n.component .title[data-v-31de3e06] {\n  line-height: 2;\n}\n"],
    sourceRoot: ""
  }])
}, function (e, t, r) {
  "use strict";
  Object.defineProperty(t, "__esModule", {value: true});
  t["default"] = {
    name: "ComponentA",
    props: {url: String, textarea: {type: String, default: ""}},
    computed: {
      textareaValue: {
        get: function e() {
          return this.textarea
        }, set: function e(t) {
          this.$emit("update:textarea", t)
        }
      }
    }
  }
}, function (e, t) {
  var r = function () {
    var e = this;
    var t = e.$createElement;
    var r = e._self._c || t;
    return r("div", {staticClass: "component"}, [r("h2", {staticClass: "title"}, [e._v("组件A")]), e._v(" "), r("el-input", {
      attrs: {
        type: "textarea",
        rows: 2,
        placeholder: "请输入内容"
      }, model: {
        value: e.textareaValue, callback: function (t) {
          e.textareaValue = t
        }, expression: "textareaValue"
      }
    })], 1)
  };
  var n = [];
  e.exports = {render: r, staticRenderFns: n}
}]);