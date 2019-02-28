ace.define(
  "ace/associatecomplete",
  [
    "require",
    "exports",
    "module",
    "ace/autocomplete/popup",
    "ace/lib/event",
    "ace/lib/lang",
    "ace/lib/dom"
  ],
  function(require, exports, module) {
    "use strict";

    var HashHandler = require("./keyboard/hash_handler").HashHandler;
    var AcePopup = require("./autocomplete/popup").AcePopup;
    var util = require("./autocomplete/util");
    var event = require("./lib/event");
    var lang = require("./lib/lang");
    var dom = require("./lib/dom");

    var Associatecomplete = function() {
      this.autoInsert = false;
      this.autoSelect = true;
      this.exactMatch = false;
      this.gatherCompletionsId = 9;
      this.keyboardHandler = new HashHandler();
      this.keyboardHandler.bindKeys(this.commands);

      this.blurListener = this.blurListener.bind(this);
      this.changeListener = this.changeListener.bind(this);
      this.mousedownListener = this.mousedownListener.bind(this);
      this.mousewheelListener = this.mousewheelListener.bind(this);

      this.changeTimer = lang.delayedCall(
        function() {
          this.updateCompletions(true);
        }.bind(this)
      );

      // this.tooltipTimer = lang.delayedCall(this.updateDocTooltip.bind(this), 50);
    };

    (function() {
      this.$init = function() {
        this.popup = new AcePopup(document.body || document.documentElement);
        this.popup.on(
          "click",
          function(e) {
            this.insertMatch();
            e.stop();
          }.bind(this)
        );
        this.popup.focus = this.editor.focus.bind(this.editor);
        // this.popup.on("show", this.tooltipTimer.bind(null, null));
        // this.popup.on("select", this.tooltipTimer.bind(null, null));
        // this.popup.on("changeHoverMarker", this.tooltipTimer.bind(null, null));

        return this.popup;
      };

      this.getPopup = function() {
        return this.popup || this.$init();
      };

      this.openPopup = function(editor, prefix, keepPopupPosition) {
        if (!this.popup) this.$init();

        this.popup.autoSelect = this.autoSelect;

        this.popup.setData(editor.scompleter.refs, prefix);

        editor.keyBinding.addKeyboardHandler(this.keyboardHandler);

        var renderer = editor.renderer;
        this.popup.setRow(this.autoSelect ? 0 : -1);
        if (!keepPopupPosition) {
          this.popup.setTheme(editor.getTheme());
          this.popup.setFontSize(editor.getFontSize());

          var lineHeight = renderer.layerConfig.lineHeight;

          var pos = renderer.$cursorLayer.getPixelPosition(this.base, true);
          pos.left -= this.popup.getTextLeftOffset();

          var rect = editor.container.getBoundingClientRect();
          pos.top += rect.top - renderer.layerConfig.offset;
          pos.left += rect.left - editor.renderer.scrollLeft;
          pos.left += renderer.gutterWidth;

          this.popup.show(pos, lineHeight);
        } else if (keepPopupPosition && !prefix) {
          this.detach();
        }
      };

      this.detach = function() {
        this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
        this.editor.off("changeSelection", this.changeListener);
        this.editor.off("blur", this.blurListener);
        this.editor.off("mousedown", this.mousedownListener);
        this.editor.off("mousewheel", this.mousewheelListener);
        this.changeTimer.cancel();
        // this.hideDocTooltip();

        this.gatherCompletionsId += 1;
        if (this.popup && this.popup.isOpen) this.popup.hide();

        if (this.base) this.base.detach();
        this.activated = false;
        this.base = null;
        // this.scompletions = this.base = null;
      };

      this.changeListener = function(e) {
        var cursor = this.editor.selection.lead;
        debugger;
        if (cursor.row != this.base.row || cursor.column < this.base.column) {
          this.detach();
        }
        if (this.activated) this.changeTimer.schedule();
        else this.detach();
      };

      this.blurListener = function(e) {
        debugger;
        var el = document.activeElement;
        var text = this.editor.textInput.getElement();
        var fromTooltip =
          e.relatedTarget &&
          this.tooltipNode &&
          this.tooltipNode.contains(e.relatedTarget);
        var container = this.popup && this.popup.container;
        if (
          el != text &&
          el.parentNode != container &&
          !fromTooltip &&
          el != this.tooltipNode &&
          e.relatedTarget != text
        ) {
          this.detach();
        }
      };

      this.mousedownListener = function(e) {
        this.detach();
      };

      this.mousewheelListener = function(e) {
        this.detach();
      };

      this.goTo = function(where) {
        var row = this.popup.getRow();
        var max = this.popup.session.getLength() - 1;

        switch (where) {
          case "up":
            row = row <= 0 ? max : row - 1;
            break;
          case "down":
            row = row >= max ? -1 : row + 1;
            break;
          case "start":
            row = 0;
            break;
          case "end":
            row = max;
            break;
        }

        this.popup.setRow(row);
      };

      this.insertMatch = function(data, options) {
        if (!data) data = this.popup.getData(this.popup.getRow());
        if (!data) return false;
        if (data.scompleter && data.scompleter.insertMatch) {
          data.scompleter.insertMatch(this.editor, data);
        } else {
          // if (this.completions.filterText) {
          //   var ranges = this.editor.selection.getAllRanges();
          //   for (var i = 0, range; range = ranges[i]; i++) {
          //     range.start.column -= this.completions.filterText.length;
          //     this.editor.session.remove(range);
          //   }
          // }
          // if (data.snippet)
          //   snippetManager.insertSnippet(this.editor, data.snippet);
          // else
          //   this.editor.execCommand("insertstring", data.value || data);
          this.editor.execCommand("insertstring", data.value || data);
        }
        this.detach();
      };

      this.commands = {
        Up: function(editor) {
          editor.scompleter.goTo("up");
        },
        Down: function(editor) {
          editor.scompleter.goTo("down");
        },
        "Ctrl-Up|Ctrl-Home": function(editor) {
          editor.scompleter.goTo("start");
        },
        "Ctrl-Down|Ctrl-End": function(editor) {
          editor.scompleter.goTo("end");
        },

        Esc: function(editor) {
          editor.scompleter.detach();
        },
        Return: function(editor) {
          return editor.scompleter.insertMatch();
        },
        "Shift-Return": function(editor) {
          editor.scompleter.insertMatch(null, { deleteSuffix: true });
        },
        Tab: function(editor) {
          var result = editor.scompleter.insertMatch();
          if (!result && !editor.tabstopManager) editor.scompleter.goTo("down");
          else return result;
        },

        PageUp: function(editor) {
          editor.scompleter.popup.gotoPageUp();
        },
        PageDown: function(editor) {
          editor.scompleter.popup.gotoPageDown();
        }
      };

      this.showPopup = function(editor) {
        if (this.editor) this.detach();

        this.activated = true;

        this.editor = editor;
        if (editor.scompleter != this) {
          if (editor.scompleter) editor.scompleter.detach();
          editor.scompleter = this;
        }

        editor.on("changeSelection", this.changeListener);
        editor.on("blur", this.blurListener);
        editor.on("mousedown", this.mousedownListener);
        editor.on("mousewheel", this.mousewheelListener);

        this.updateCompletions();
      };

      this.updateCompletions = function(keepPopupPosition) {
        var session = this.editor.getSession();
        var pos = this.editor.getCursorPosition();

        var prefix = util.getCompletionPrefix(this.editor);

        this.base = session.doc.createAnchor(
          pos.row,
          pos.column - prefix.length
        );
        this.base.$insertRight = true;

        this.openPopup(
          this.editor,
          this.editor.scompleter.keyword,
          keepPopupPosition
        );
      };

      this.cancelContextMenu = function() {
        this.editor.$mouseHandler.cancelContextMenu();
      };

      // this.updateDocTooltip = function() {
      //   var popup = this.popup;
      //   var all = popup.data;
      //   // var selected = all && (all[popup.getHoveredRow()] || all[popup.getRow()]);
      //   var selected = '';
      //   var doc = null;
      //   if (!selected || !this.editor || !this.popup.isOpen)
      //     return this.hideDocTooltip();
      //   this.editor.scompleters.some(function(completer) {
      //     if (completer.getDocTooltip)
      //       doc = completer.getDocTooltip(selected);
      //     return doc;
      //   });
      //   if (!doc)
      //     doc = selected;
      //
      //   if (typeof doc == "string")
      //     doc = {docText: doc};
      //   if (!doc || !(doc.docHTML || doc.docText))
      //     return this.hideDocTooltip();
      //   this.showDocTooltip(doc);
      // };

      // this.showDocTooltip = function(item) {
      //   if (!this.tooltipNode) {
      //     this.tooltipNode = dom.createElement("div");
      //     this.tooltipNode.className = "ace_tooltip ace_doc-tooltip";
      //     this.tooltipNode.style.margin = 0;
      //     this.tooltipNode.style.pointerEvents = "auto";
      //     this.tooltipNode.tabIndex = -1;
      //     this.tooltipNode.onblur = this.blurListener.bind(this);
      //     this.tooltipNode.onclick = this.onTooltipClick.bind(this);
      //   }
      //
      //   var tooltipNode = this.tooltipNode;
      //   if (item.docHTML) {
      //     tooltipNode.innerHTML = item.docHTML;
      //   } else if (item.docText) {
      //     tooltipNode.textContent = item.docText;
      //   }
      //
      //   if (!tooltipNode.parentNode)
      //     document.body.appendChild(tooltipNode);
      //   var popup = this.popup;
      //   var rect = popup.container.getBoundingClientRect();
      //   tooltipNode.style.top = popup.container.style.top;
      //   tooltipNode.style.bottom = popup.container.style.bottom;
      //
      //   tooltipNode.style.display = "block";
      //   if (window.innerWidth - rect.right < 320) {
      //     if (rect.left < 320) {
      //       if(popup.isTopdown) {
      //         tooltipNode.style.top = rect.bottom + "px";
      //         tooltipNode.style.left = rect.left + "px";
      //         tooltipNode.style.right = "";
      //         tooltipNode.style.bottom = "";
      //       } else {
      //         tooltipNode.style.top = popup.container.offsetTop - tooltipNode.offsetHeight + "px";
      //         tooltipNode.style.left = rect.left + "px";
      //         tooltipNode.style.right = "";
      //         tooltipNode.style.bottom = "";
      //       }
      //     } else {
      //       tooltipNode.style.right = window.innerWidth - rect.left + "px";
      //       tooltipNode.style.left = "";
      //     }
      //   } else {
      //     tooltipNode.style.left = (rect.right + 1) + "px";
      //     tooltipNode.style.right = "";
      //   }
      // };

      // this.hideDocTooltip = function() {
      //   // this.tooltipTimer.cancel();
      //   // if (!this.tooltipNode) return;
      //   var el = this.tooltipNode;
      //   if (!this.editor.isFocused() && document.activeElement == el)
      //     this.editor.focus();
      //   this.tooltipNode = null;
      //   if (el.parentNode)
      //     el.parentNode.removeChild(el);
      // };

      // this.onTooltipClick = function(e) {
      //   var a = e.target;
      //   while (a && a != this.tooltipNode) {
      //     if (a.nodeName == "A" && a.href) {
      //       a.rel = "noreferrer";
      //       a.target = "_blank";
      //       break;
      //     }
      //     a = a.parentNode;
      //   }
      // };
    }.call(Associatecomplete.prototype));

    Associatecomplete.startCommand = {
      name: "startAssociate",
      exec: function(editor, params) {
        debugger;
        if (!editor.scompleter) editor.scompleter = new Associatecomplete();
        editor.scompleter.autoInsert = false;
        editor.scompleter.autoSelect = true;
        editor.scompleter.refs = params.refs || [];
        editor.scompleter.keyword = params.keyword || "";
        editor.scompleter.showPopup(editor);
        editor.scompleter.cancelContextMenu();
      },
      bindKey: "Command-Q"
    };

    exports.Associatecomplete = Associatecomplete;
  }
);

ace.define(
  "ace/expand/language_tools",
  [
    "require",
    "exports",
    "module",
    "ace/associatecomplete",
    "ace/config",
    "ace/editor"
  ],
  function(require, exports, module) {
    "use strict";

    var Associatecomplete = require("../associatecomplete").Associatecomplete;

    var Editor = require("../editor").Editor;
    require("../config").defineOptions(Editor.prototype, "editor", {
      enableAssociateAutocompletion: {
        set: function(val) {
          if (val) {
            if (!this.scompleters)
              this.scompleters = Array.isArray(val) ? val : [];
            this.commands.addCommand(Associatecomplete.startCommand);
          } else {
            this.commands.removeCommand(Associatecomplete.startCommand);
          }
        },
        value: false
      }
    });
  }
);

(function() {
  ace.require(["ace/expand/language_tools"], function(m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();
