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
```

###expand-language_tools.js
```
由ext-language_tools.js, 改造的。
借用ace.js中功能,另开提示弹窗,
与ext-language_tools.js不是合用一个实例
```