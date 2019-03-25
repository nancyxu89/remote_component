/***
 * IdeEdit.vue中部分功能迁移至此
 *
 *******************
 * extend, 包括:
 * 1 window事件, addWindowEventListener;
 * 2 自定义编辑器提示信息, addEditorCompleter
 *
 *******************
 *  main, 包括:
 * 1 props设置, initProps
 * 2 data设置, initData
 * 3 editor初始化, init;
 * 4 主题切换, toggleTheme
 */
let editExec = {
  extend: {
    addWindowEventListener: function () { // 监听键盘
      window.addEventListener(
        'keydown',
        e => {
          if (e.ctrlKey && e.keyCode === 13) { // ctrl + enter
            this.ctrlKeyTimer && clearTimeout(this.ctrlKeyTimer)
            this.ctrlKeyTimer = setTimeout(() => {
              this.queryData.loading ? this.runTips() : this.runSql()
            }, 100)
          } else if (this.dialogSaveVisible && e.keyCode === 13) { // enter, 保存新增
            this.addTimer && clearTimeout(this.addTimer)
            this.addTimer = setTimeout(() => {
              this.saveMakeSure()
            }, 100)
          } else if (this.dialogThemeVisible && e.keyCode === 13) { // enter, 主题切换
            this.$refs.themeSelect.blur()
            this.toggleThemeOK()
          }
          //                  else if (e.altKey && e.keyCode == 83) { // alt + s
          //                      this.saveSql()
          //                  }
        },
        false
      )
    },
    addEditorCompleter: function (data = []) { // 编辑器, 注入自定义提示信息
      if (!data || data.length === 0 || Object.prototype.toString.call(data) !== '[object Array]') {
        return
      }
      // 为editor新增complete
      let addComleter = function (arr) {
        return {
          getCompletions: function (editor, session, pos, prefix, callback) {
            if (prefix.length === 0) {
              return callback(null, [])
            } else {
              return callback(null, arr)
            }
          }
        }
      }
      let completer = addComleter(data)
      this.editor.completers[3] ? (this.editor.completers[3] = completer) : this.editor.completers.push(completer)
    }
  },
  main: {
    initProps: function () {
      return {
        sqlData: {
          type: Array,
          default: () => []
        },
        queryAllObj: {
          type: Object,
          default: () => {
          }
        },
        queryData: {
          type: Object,
          default: {}
        },
        selectTabId: {
          type: Number,
          default: 0
        },
        initSelectedResultId: {
          type: String,
          default: ''
        },
        initEditorValue: {
          type: String,
          default: ''
        },
        propOffsetHeight: {
          type: Number,
          default: 0
        },
        changeTab: {
          type: Function,
          default: null
        },
        setEditorValue: {
          type: Function,
          default: null
        },
        removeSqlText: {
          type: Function,
          default: null
        },
        setQueryData: {
          type: Function,
          default: null
        },
        updateQueryResult: {
          type: Function,
          default: null
        },
        addSqlText: {
          type: Function,
          default: null
        },
        getDescription: {
          type: Function,
          default: null
        },
        limitFileName: {
          type: Function,
          default: null
        },
        initNewMaxId: {
          type: Number,
          default: -99
        },
        initNewCount: {
          type: Number,
          default: 0
        }
      }
    },
    initData: function () {
      return {
        offsetHeight: this.propOffsetHeight,
        logInfoHeight: 0,
        resultLogHeight: 0,
        editor: null,
        recordNum: this.queryData.recordNum,
        recordNums: [25, 50, 100, 200],
        searchValue: this.queryData.searchValue,
        engine: this.queryData.engine,
        engines: [{name: 'impala', value: 'IMPALA'}, {name: 'hive', value: 'HIVE'}, {name: 'spark', value: 'SPARK'}],
        statusType: 'log',
        isStop: false,
        newCount: this.initNewCount,
        newMaxId: this.initNewMaxId,
        defaultIndex: 2,
        fontSizes: ['12px', '14px', '16px'],
        dialogSaveVisible: false,
        dialogResHelpVisible: false,
        dialogResRowVisible: false,
        dialogDownloadVisible: false,
        fileDirs: [],
        saveNewForm: {
          id: '',
          fileName: ''
        },
        isEnLarge: false,
        isEnLargeRes: false,
        reOffsetHeight: 0,
        curRow: {},
        selectedResultId: this.initSelectedResultId,
        curQueryResult: {},
        tableMaxHeight: 100,
        resTableData: [],
        isNeedLoading: false,
        isChangeTab: false,
        dialogThemeVisible: false,
        aceThemeArr: {
          merbivore: require('src/assets/js/ace/theme-merbivore.js'),
          chrome: require('src/assets/js/ace/theme-chrome.js'),
          dreamweaver: require('src/assets/js/ace/theme-dreamweaver.js'),
          eclipse: require('src/assets/js/ace/theme-eclipse.js'),
          github: require('src/assets/js/ace/theme-github.js'),
          xcode: require('src/assets/js/ace/theme-xcode.js'),
          sqlserver: require('src/assets/js/ace/theme-sqlserver.js'),
          tomorrow_night_blue: require('src/assets/js/ace/theme-tomorrow_night_blue.js')
        },
        aceTheme: 'merbivore',
        aceThemes: [{label: '默认（黑）', value: 'merbivore'}, {
          label: 'Chrome（明亮）',
          value: 'chrome'
        }, {label: 'Dreamweaver（明亮）', value: 'dreamweaver'},
          {label: 'Eclipse（明亮）', value: 'eclipse'}, {label: 'GitHub（明亮）', value: 'github'}, {
            label: 'XCode（明亮）',
            value: 'xcode'
          },
          {label: 'Sql Server（明亮）', value: 'sqlserver'}, {
            label: 'Tomorrow Night Blue（黑）',
            value: 'tomorrow_night_blue'
          }]
      }
    },
    init: function (ACE) { //初始化editor
      const aceEdit = this.$refs.aceEdit
      aceEdit.style.fontSize = this.fontSizes[this.defaultIndex]
      aceEdit.style.height = `${(this.reOffsetHeight * 0.7) - 1}px`
      this.$refs.resultLog.style.bottom = 0
      this.logInfoHeight = (this.reOffsetHeight * 0.3) - 76 // 获取日志信息高度
      this.resultLogHeight = this.reOffsetHeight * 0.3 // 日志+结果tab高度
      let aceTheme = window.localStorage.getItem('aceTheme') || 'merbivore'
      let editor = ACE.edit(aceEdit)
      this.aceTheme = aceTheme
      editor.setTheme(this.aceThemeArr[aceTheme]) // 设置主题
      editor.session.setMode('ace/mode/sql') // 设置语法
      editor.setShowPrintMargin(false) // 是否分屏
      editor.setHighlightActiveLine(false)
      editor.setOptions({
        enableLiveAutocompletion: true, // 设置提示
        enableSnippets: true // 设置snippets提示
      })
      editor.resize(true) // 触发尺寸缩放
      editor.setShowInvisibles(false) // 设置空格符、换行符
      this.editor = editor
      this.editor.setValue(this.initEditorValue, 1)
      this.editor.on('change', () => {
        this.setQueryData({
          isChanged: true
        }, 'change')
      })

      // 根据主题, 设置body-class
      let bodyClassName = document.body.className || ''
      let themeClass = 'theme-' + aceTheme
      bodyClassName = bodyClassName.replace(' ' + themeClass, '').replace(themeClass + ' ', '').replace(themeClass, '')
      document.body.className = bodyClassName + (bodyClassName != '' ? ' ' : '') + 'theme-' + this.aceTheme

      this.resetSession()
    },
    toggleTheme: function () { // 编辑器主题切换
      let oldTheme = window.localStorage.getItem('aceTheme') || ''
      oldTheme = 'theme-' + oldTheme
      let bodyClassName = document.body.className || ''
      bodyClassName = bodyClassName.replace(' ' + oldTheme, '').replace(oldTheme + ' ', '').replace(oldTheme, '')
      window.localStorage.setItem('aceTheme', this.aceTheme)
      this.editor.setTheme(this.aceThemeArr[this.aceTheme])
      this.dialogThemeVisible = false
      document.body.className = bodyClassName + ' ' + ('theme-' + this.aceTheme)
    }
  }
}
export default editExec
