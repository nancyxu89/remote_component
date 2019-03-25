###ace.js
```
场景: 库名称外链数据源
功能点: 特定字符添加链接
实现方法:
   源码中添加代码
   ace.define("ace/layer/text") ----> this.$renderToken,添加
   if (classes === 'ace_identifier' && window.extLangAssLibUrls && window.extLangAssLibUrls[value]) {
       console.log('start-extLangAssLibUrls-')
       var a = this.dom.createElement("a")
       a.href = window.extLangAssLibUrls[value];
       a.target = '__blank' + window.extLangAssLibUrls[value];
       // a.innerText = value;
       a.style = 'pointer-events:all;text-decoration: none;'
       a.className = classes + '-url';
       a.appendChild(valueFragment);
       console.log('end-extLangAssLibUrls-')
       span.appendChild(a);
   } else {
       span.appendChild(valueFragment);
   }
```

###ext-language_tools.js
```
场景: 根据库名联想表名
功能点: 有规则的字符出现后, 提示信息根据对应关系出现在提示弹窗中
实现方法:
   源码中添加代码
   (1) ace.define("ace/autocomplete") ----> FilteredList, this.setFilter,添加
   if (window.extLangAssLib) {
      matches = matches.filter(function(item){
      if (item.isLib === undefined) return true
          var isMatch = (item.isLib === window.extLangAssLib.isLib)
          return window.extLangAssLib.isLib ? isMatch : (isMatch && item.libName === window.extLangAssLib.name)
      });
   }
   (2) Autocomplete.prototype ---->  this.detach中,修改
   if (this.popup && this.popup.isOpen){
      this.popup.hide();
      window.extLangAssLib = null; //添加
   }
   (3) ace.define("ace/ext/language_tools")中添加enableAssociateAutocompletion自定义配置

```

###expand-language_tools.js
```
由ext-language_tools.js, 改造的。
借用ace.js中功能,另开提示弹窗,
与ext-language_tools.js不是合用一个实例
```

###IdeEdit.vue
```
score: Infinity,才能保持始终出现在第一位
```
```
场景: 库表名称联想 + 添加库外链
功能点: editor.completers添加自定义completer, editor 监听 change , 动态更新completer
实现方法:
   增加业务逻辑
   this.editor.on("change", () => {
        this.setQueryData({
          isChanged: true
        }, 'change')

//        if (!this.isChangeTab) { // 防止tab切换操作表字段联想功能
//          let pos = editor.getCursorPosition()
//          let line = editor.session.getLine(pos.row)
//          console.log('line---------' + line)
////        let regx = /(?:[\s;])(\w+)(?:\.)$|^(\w+)(?:\.)$|^(\w+(?:_\w+))(?:\.)$|(?:[\s;])(\w+(?:_\w+))(?:\.)$|(?:\w+\.)(\w+)(?:\.)$|(?:\w+\.)(\w+(?:_\w+))(?:\.)$/g
//          let regx = /(?:[\s;])(\w+)(?:\.)$|^(\w+)(?:\.)$|^(\w+(?:_\w+))(?:\.)$|(?:[\s;])(\w+(?:_\w+))(?:\.)$/g
//          let matchStr = line.match(regx) ? line.match(regx)[0].replace(';','').replace('.','') : null
//            console.log(matchStr)
//          if (matchStr && this.editor.session.$mode.$highlightRules.$keywordList.indexOf(matchStr) === -1) {
//            if (line.match(regx)) {
//              let arr = [{caption: "depart_id", value: "depart_id", score: 1, meta: "network"},
//                  {caption: "depart_name", value: "depart_name", score: 2, meta: "network"}]
//               this.editor.execCommand("startAssociate", {refs: arr, keyword: matchStr})
//            }
//          }
//        } else {
//            this.$nextTick(() => { this.isChangeTab = false })
//        }
         if (editor.$enableAssociateAutocompletion) {
             var pos = editor.getCursorPosition();
             var line = editor.session.getLine(pos.row).replace(/\s+/g,';');
             var arr = line.split(';') || line
             var matchStr = arr[arr.length - 1]
             var regx = /^(\s*|;)(\w+)\.([a-zA-Z0-9]+)$/g
            var libName = RegExp.$2
             if (regx.test(matchStr)) {
               window.extLangAssLib = {
                 isLib: false,
                 name: RegExp.$2
               }
               editor.completers[3] && (editor.completers[3] = {getCompletions: function (editor, session, pos, prefix, callback) {
                 return callback(null, [])
               }})
               setTimeout(() => {
                 editor.completers.length > 4 ? editor.completers.pop() : ''
                 editor.completers.push({
                   getCompletions: function(editor, session, pos, prefix, callback) {
                     if (prefix.length === 0) {
                       return callback(null, [])
                     } else {
                       return callback(null, [
                         //                              {meta: "表名称", isLib: false, value: "svn_1220", score:9},
                         {meta: "表名称", isLib: false, value: "dbid_ol_crm_test2", score:9, libName: 'dwt'}
                         //                              {meta: "表名称", isLib: false, value: "dbid_test2", score:9, libName: 'sonic'}
                       ])
                     }
                   }
                 })
                 editor.completer.updateCompletions(false)
               }, 1000)
             } else {
               window.extLangAssLib = {
                 isLib: true
               }
               window.extLangAssLib.currentLib = libName
               window.extLangAssLibUrls = {
                 sonic: 'http://dev-cosmos.ymmoa.com/#/metadata/table-details/3',
                 dwt: 'http://dev-cosmos.ymmoa.com/#/metadata/table-details/4',
                 'tmp.dwt_test': 'http://dev-cosmos.ymmoa.com/#/metadata/table-details/5'
               }
               let editorCom3 = {
                 getCompletions: function(editor, session, pos, prefix, callback) {
                   if (prefix.length === 0) {
                     return callback(null, [])
                   } else {
                     return callback(null, [
                       {meta: "库", isLib: true, value: "sonic", score:10},
                       {meta: "部门业绩按天统计", isLib: true, value: "tmp.dwt_test", score:10},
                       {meta: "库", isLib: true, value: "dwt", score:10, id: 90, url: 'http://dev-cosmos.ymmoa.com/#/metadata/table-details/5'},
                       //              {meta: "表名称", isLib: false, value: "svn_1220", score:9},
                       //              {meta: "表名称", isLib: false, value: "dbid_ol_crm_test2", score:9, libName: 'dwt'},
                       //              {meta: "表名称", isLib: false, value: "dbid_test2", score:9, libName: 'sonic'}
                     ])
                   }
                 }
               }
               editor.completers[3] ? (editor.completers[3] = editorCom3) : editor.completers.push(editorCom3)
             }
         }

      })
```