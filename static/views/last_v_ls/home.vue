exec.js/*
  * @title  sql查询主页面
  * @author huangjian
  * @time   2018-11-08
*/
<template>
  <div class="home" :style="`height: ${offsetHeight}px`">
    <slide-bar
      ref="slideBar"
      :limit-file-name="limitFileName"
      :initShowAll="isShowSlide"
      :is-moving="isMoving"
      :add-sql-text="addSqlText"
      :pre-add-sql="preAddSql"
      :selected-tree-id="selectedTreeId"
      :update-node-change="updateNodeChange"
      :insert-content="insertContent"
      :handle-mouse-down="handleMouseDown"
      :show-slide-page="showSlidePage"
      :delete-tree="removeSqlText">
    </slide-bar>
    <div class="right-wrap" ref="rightWrap" :style="'margin-left:'+(isShowSlide? (leftSlideWidth+10):'60')+'px'">
      <ide-edit
        v-if="sqlData.length > 0"
        ref="aceEdit"
        :limit-file-name="limitFileName"
        @toggleWindow="showSlidePage"
        :init-new-max-id="initNewMaxId"
        :init-selected-result-id="initSelectedResultId"
        :init-new-count="initNewCount"
        :add-sql-text="addSqlText"
        :sql-data="sqlData"
        :select-tab-id="selectTabId"
        :init-editor-value="editorValue"
        :prop-offset-height="propOffsetHeight"
        :query-data="getQueryData"
        :is-show-slide="isShowSlide"
        :cluster-load="clusterLoad"
        :change-tab="changeTab"
        :set-editor-value="setEditorValue"
        :get-description="getDescription"
        :remove-sql-text="removeSqlText"
        :query-all-obj="queryAllObj"
        @removeResultItem="removeResultItem"
        :update-query-result="updateQueryResult"
        :set-query-data="setQueryData">
      </ide-edit>
      <div ref="noSqlData" class="no-sqlData" v-else><i class="fa fa-plus add-new cursor-pointer" @click="buildQuery"></i></div>
    </div>
    <sql-status @toggleShowStatus="toggleShowStatus" :isShow="isShowSqlStatus" :queryData="getQueryData"
                style="right: 20px;position: absolute; top: 90px;"></sql-status>
    <!--<div class="fr-area"><a :href="item.url" :title="item.label" :key="item.label"-->
    <!--target="_blank" v-for="item in rightList"><i :class="['fa', item.icon]"></i></a></div>-->
  </div>
</template>
<style lang="stylus" rel="stylesheet/stylus" type="text/stylus" scoped>
@import "../assets/style/home.styl"
</style>
<script>
import { mapState } from 'vuex'
import HomeService from 'src/services/home/index'
import SlideBar from 'src/components/home/SlideBar'
import IdeEdit from 'src/components/home/IdeEdit'
import SqlStatus from 'src/components/home/SqlStatus'
import Config from 'src/config'

export default {
  name: 'home',
  data () {
    return {
      offsetHeight: 0,
      oldOffsetHeight: 0,
      sqlData: [],
      selectTabId: 0,
      selectedTreeId: 0,
      editorValue: '',
      leftSlideWidth: 320,
      isShowSlide: true,
      propOffsetHeight: 0,
      clusterLoad: '-1',
      defaultQueryData: {
        databaseName: 'default',
        tabName: '',
        engine: 'IMPALA',
        execTime: 0,
        recordNum: 50,
        queryMainId: '',
        searchValue: '',
        idTimeStamp: '',
        canEdit: true,
        loading: false,
        isChanged: false
      },
      initNewMaxId: -99,
      initNewCount: 0,
      queryAllObj: {},
      initQueryCount: {},
      initSelectedResultId: '',
      rightList: [{label: '查询历史', url: '#/history/list', icon: 'fa-clock-o'},
          {label: '制作报表', url: Config.cmHost + '#/rubik?path=myReports/list', icon: 'fa-pie-chart'},
          {label: '指标口径', url: Config.mfHost + '#/index-service', icon: 'fa-legal'}],
      isMoving: false,
      isShowSqlStatus: false
    }
  },
  components: { SlideBar, IdeEdit, SqlStatus },
  watch: {
    currentGroupValue (value) {
      let data = JSON.parse(JSON.stringify(this.sqlData))
      data.map(item => {
        if (item.queryData.queryStatus === undefined || item.queryData.queryStatus === 'FAILED' || item.queryData.queryStatus === 'FINISHED') {
          item.queryData.currentGroupValue = value
        }
      })
      this.$nextTick(function () {
        this.sqlData = data
      })
    },
    isHideHeader (to) {
      let height = !to ? -60 : 60
      this.offsetHeight = this.offsetHeight + height
      this.$refs.aceEdit && this.$refs.aceEdit.updateEditorHeight(height, true)
      this.oldOffsetHeight = this.offsetHeight
    }
  },
  computed: {
    ...mapState({
      isHideHeader: state => state.isHideHeader,
      currentGroupValue: state => state.currentGroupValue, // 用户信息
      userInfo: state => state.userInfo
    }),
    getQueryData () {
      let curSqlItem = this.sqlData.filter(item => item.id == this.selectTabId)[0]
      let queryData =  this.sqlData.length > 0 && curSqlItem ? curSqlItem.queryData : ({...this.defaultQueryData, currentGroupValue: this.$store.state.currentGroupValue})
      queryData['queryMainId'] = this.selectTabId

      return queryData
    }
  },
  methods: {
    toggleShowStatus (isShow) {
      this.isShowSqlStatus = isShow
    },
    limitFileName (name, type) {
      this.limitTimer && clearTimeout(this.limitTimer)
      this.limitTimer = setTimeout(() => {
        let len = 0
        let content = ''
        for (let i = 0; i < name.length; i++) {
          if (len < 10) {
            content += name[i]
          }
          len += (/[\u4e00-\u9fa5]/.test(name[i]) ? 1 : 0.5)
        }
        type === 1 ? (this.$refs.slideBar.$refs.updateForm.model.fileName = content) : ''
        type === 2 ? (this.$refs.aceEdit.$refs.saveNewForm.model.fileName = content) : ''
      }, 300)
    },
    saveSqlId (data, isUpdate = false) {
      if (!data.isAdd) {
        let fileContentsStr = window.localStorage.getItem('fileContentsStr')
        let arr = fileContentsStr ? JSON.parse(fileContentsStr) : []
        arr = arr.filter(item => { return item !== null })
        if (!isUpdate) {
          arr = arr.filter(item => { return item.id !== data.id })
          arr.push({id: data.id, fileName: data.fileName})
        } else {
          arr = arr.map(item => {
            if (item.id === data.id) {
              item.fileName = data.fileName
             }
            return item
          })
        }
        arr = arr.slice(0, 10)
        window.localStorage.setItem('fileContentsStr', JSON.stringify(arr))
      }
    },
    preAddSql (data) {
      // 未超出限定情况下, tab中已存在, 则直接打开; 若不存在, 则访问接口获取信息
      !data.isAdd ? (this.selectedTreeId = data.id) : '' // 设置左侧树选中节点ID
      let arr = (this.sqlData.filter(item => {
         if (item.id === data.id) {
            this.$refs.aceEdit && this.$refs.aceEdit.selectTab(data.id) // 模拟右侧tab切换效果
            this.selectTabId = data.id
            this.editorValue = item.editorValue
            return true
         }
         return false
      })) || []

      if (this.sqlData.length > 9 && arr.length === 0) {
         this.$message.error('最多只能打开10个SQL窗口，你可以关闭一些窗口后再打开。')
         return false
      }
      return arr.length === 0
    },
    getDescription () {
      // 增加标注
      let now = new Date()
      let year = now.getFullYear()
      let month = now.getMonth() + 1
      let day = now.getDate()
      let hour = now.getHours()
      let minute = now.getMinutes()
      let second = now.getSeconds()
      function getFull (val, tail = '') {
         return (val < 10 ? ('0' + val) : val) + tail
      }
      // 添加代码注释
      let des = '-- ===============================================\n' +
             '-- Author: ' + this.userInfo.name + '（' + this.userInfo.jobNumber + ')\n' +
            '-- Create date: ' + year + '-' + getFull(month, '-') + getFull(day, ' ') + getFull(hour, ':') + getFull(minute, ':') + getFull(second) + '\n' +
            '-- Description: (请填写)\n' +
            '-- Modify [1]: --\n' +
            '-- ================================================\n\n'
      return des
    },
    buildQuery () {
      this.addSqlText({isAdd: true, id: (--this.initNewMaxId), fileName: '(新查询)-' + (++this.initNewCount), editorValue: ''})
    },
    addSqlText (data) {
      // 新增一条数据
      if (!this.preAddSql(data)) {
          return
      }

      this.saveSqlId(data)
      data.initNewCount ? this.initNewCount = data.initNewCount : '' // 同步新增序号初始值
      const hasThisData = this.sqlData.filter(item => item.id == data.id)
      this.$nextTick(() => {
        if (hasThisData.length === 0) {
          let sqlData = [...this.sqlData, {
            label: data.fileName,
            isAdd: !!data.isAdd,
            id: data.id,
            editorValue: !!data.isAdd && !data.isChanged ? 'select ' : data.editorValue,
            queryData: {...this.defaultQueryData, tabName: data.fileName, currentGroupValue: this.$store.state.currentGroupValue},
          }]
          this.sqlData = sqlData
          if (this.$refs.aceEdit) { // 新增-编辑区域打开时,保存前tab的结果选中项
            this.$refs.aceEdit.selectTab(data.id)
          } else {
            this.editorValue = !!data.isAdd && !data.isChanged ? 'select ' : data.editorValue
          }
        }

        this.selectTabId = data.id // 设置右侧tab选中节点ID
        this.selectedTreeId = data.id // 设置左侧树选中节点ID
        this.initSelectedResultId = '' // 强制初始化选中结果
        //  !!data.isAdd && this.$refs.aceEdit && (this.$refs.aceEdit.addDes()) // 1.11 需求变更, 不添加注释
        //  this.$refs.aceEdit && (this.$refs.aceEdit.resetSession())
      })
    },
    updateNodeChange (options = {type: 'add', data: {}}) {
      let data =  options.data || {}
      let fileType = data.type !== undefined ? data.type : -1

      switch (options.type + fileType) {
        case 'add0':
          // 新增成功后,设置选中tree id
          this.selectedTreeId = data.id
          break
        case 'add1':
        case 'delete-1':
        case 'update1':
        case 'dragNode-1':
          // 左侧树新增或删除目录时,刷新文件目录列表
          this.$refs.aceEdit && this.$refs.aceEdit.getAllDir()
          break
        case 'update0':
          this.sqlData = this.sqlData.map(item => {
            if (item.id == data.id) {
              item.label = data.fileName
            }
          return item
        })
        this.saveSqlId(data, true)
        break
      default:
        break
    }
    },
    changeTab (id) {
      let queryData = {}
        // 切换tab
      this.selectedTreeId = id
      this.selectTabId = id
      let data = JSON.parse(JSON.stringify(this.sqlData))
      let arr = data.filter(item => { return item.id === id }) || []
      this.editorValue = '' // 重置为空,强制initEditorValue的watch
      this.$nextTick(() => {
        if (arr.length > 0) {
          this.editorValue = arr[0].editorValue
          this.initSelectedResultId = arr[0].queryData.idTimeStamp
          queryData = arr[0].queryData
          this.showSqlStatus(queryData)
        }
      })
    },
    showSqlStatus (queryData) {
      this.showStatusTimer && clearTimeout(this.showStatusTimer)
      this.$nextTick(() => { // 切换tab时显示SQL状态
        this.isShowSqlStatus = !!queryData.queryStatus
        this.showStatusTimer = setTimeout(() => {
          this.isShowSqlStatus = false
        }, 3000)
      })
    },
    setEditorValue (value) {
      // 设置编辑器value
      this.sqlData.map(item => {
        if (item.id == this.selectTabId) {
          item.editorValue = value
        }
      })
    },
    removeSqlText (removeId) {
      // 移除一条tab
      let isNeedDelete = false
      this.sqlData.map(item => { if (item.id === removeId) { isNeedDelete = true } })
      if (!isNeedDelete) {
          return
      }

      // 移除 localStorage 中的项
      let fileContentsStr = window.localStorage.getItem('fileContentsStr')
      let arr = fileContentsStr ? JSON.parse(fileContentsStr) : []
      arr = arr.filter(item => { return item.id !== removeId })
      window.localStorage.setItem('fileContentsStr', JSON.stringify(arr))

      // 判断是否只有一条数据
      if (this.sqlData.length === 1) {
        this.sqlData = []
        this.editorValue = ''
        this.selectTabId = 0
        this.selectedTreeId = -1
        this.$refs.aceEdit && (this.$refs.aceEdit.resetSession())
        return
      }
      this.sqlData = JSON.parse(JSON.stringify(this.sqlData)).filter(item => item.id !== removeId)
      // 如果删除的是当前选中的tab, 则初始化默认值
      if (removeId === this.selectTabId) {
        this.editorValue = this.sqlData[0] && this.sqlData[0].editorValue
        this.selectTabId = this.sqlData[0] && this.sqlData[0].id
        this.selectedTreeId = this.selectTabId
        setTimeout(() => {
            this.getQueryData.queryMainId === this.selectTabId ? (this.initSelectedResultId = this.getQueryData.idTimeStamp) : ''
        }, 0)
        this.showSqlStatus(this.getQueryData)
      }
      this.queryAllObj[removeId] && (delete this.queryAllObj[removeId])
      this.initQueryCount[removeId] && (delete this.initQueryCount[removeId]) // 恢复结果统计
      this.queryAllObj[removeId] && this.$refs.aceEdit && this.$refs.aceEdit.resetResTable() // 重置结果表
      window.$undoManager && delete window.$undoManager[removeId] // 移除$undoManager
    },
    setQueryData (data, type = '') {
      // 存储查询数据
      let sqlData = JSON.parse(JSON.stringify(this.sqlData))
      this.sqlData = sqlData.map(item => {
        const selectTabId = data.selectTabId || this.selectTabId
        if (item.id == selectTabId) {
          switch (type) {
            case 'logSuccess':
              let loading = false
              if (data.queryStatus == 'RUNNING' || data.queryStatus == 'READY') {
                loading = true
              }
              item['queryData'].loading = loading
              item['queryData'].queryStatus = data.queryStatus
              item['queryData'].execTime =  data.execTime
              item['queryData'].queryLog = data.queryLog
              item['queryData'].queryId = data.queryId
              item['queryData'].serviceTips = ''
              item['queryData'].searchValue = ''

              if (data.queryStatus == 'FINISHED') {
                item['queryData'].queryMainId =  item.id
                item['queryData'].editorValue =  ''
                item['queryData']['idTimeStamp'] = item['queryData'].queryId + '_' + (new Date()).valueOf() + '_'  + item.id
                if (this.initQueryCount[item.id]) {
                  ++this.initQueryCount[item.id].init
                } else {
                  this.initQueryCount[item.id] = {init: 1}
                }
                item['queryData']['idxOfExe'] = this.initQueryCount[item.id].init
                let allResultData = data.allResultData || []
                let addItem = {
                  idxOfExe: item['queryData'].idxOfExe,
                  idTimeStamp: item['queryData'].idTimeStamp,
                  queryMainId: item['queryData'].queryMainId,
                  engine: item['queryData'].engine,
                  sqlStatement: data.sqlStatement,
                  searchValue: '',
                  recordNum: this.defaultQueryData.recordNum,
                  queryId: data.queryId,
                  columnNames: data.columnNames,
                  allResultData: allResultData,
                  tableData: allResultData.slice(0, this.defaultQueryData.recordNum),
                  total: allResultData.length,
                  currentPage: 1,
                  order: '',
                  prop: '',
                  isLock: false
                }
                if (this.queryAllObj[item.id]) {
                  if (this.queryAllObj[item.id].length > 5) {
                    let arr = JSON.parse(JSON.stringify(this.queryAllObj[item.id]))
                    let unLockPos = 0
                    arr.some((item, pos) => {
                      if (!item.isLock) {
                        unLockPos = pos
                        return true
                      }
                    })
                    this.queryAllObj[item.id].splice(unLockPos, 1)
                  }
                } else {
                  this.queryAllObj[item.id] = []
                }
                this.queryAllObj[item.id].push(addItem)

                this.$nextTick(() => {
                  item.id === this.selectTabId ? (this.initSelectedResultId = item['queryData']['idTimeStamp']) : ''
                })
              }
              break
            case 'logError':
              item['queryData'].serviceTips = data.serviceTips
              item['queryData'].queryStatus = data.queryStatus
              item['queryData'].queryLog = data.queryLog
              item['queryData'].canEdit = true
              item['queryData'].loading = false
              break
            case 'selectEngine':
              item['queryData'].engine = data.engine
              break
            case 'selectRecord':
              item['queryData'].recordNum = data.recordNum
              break
            case 'search':
              item['queryData'].searchValue = data.searchValue
              break
            case 'loading':
              item['queryData'].loading = data.loading
              break
            case 'change':
              data.idTimeStamp !== undefined ? (item['queryData'].idTimeStamp = data.idTimeStamp) : '' // 保存结果选中项
              data.isChanged !== undefined ? (item['queryData'].isChanged = data.isChanged) : ''
              break
            case 'canEdit':
              item['queryData'].canEdit = data.canEdit
              break
            case 'stopSql':
              item['queryData'].loading = false
              item['queryData'].canEdit = true
              item['queryData'].queryStatus = 'STOPPED'
              break
            case 'addSuccess':
              let oldQueryMainId = item['queryData'].queryMainId
              this.selectTabId = data.id
              this.editorValue = data.fileContent
              item.editorValue = this.editorValue
              item.id = data.id
              item.label = data.fileName
              item['queryData'].tabName = data.fileName
              item.isAdd = false
              item['queryData'].isChanged = false
              item['queryData'].queryMainId =  item.id // 新增成功,更新queryMainId以及相关参数
              item['queryData'].idTimeStamp =  item['queryData'].idTimeStamp.replace(oldQueryMainId + '', item.id)
              if (this.queryAllObj[oldQueryMainId]) { // 若存在结果集, 更新相关参数
                let arr = JSON.parse(JSON.stringify(this.queryAllObj[oldQueryMainId]))
                this.queryAllObj[data.id] = arr.map(lItem => {
                  if (lItem.queryMainId === oldQueryMainId) {
                    lItem['queryMainId'] = item.id
                    lItem['idTimeStamp'] = lItem['idTimeStamp'].replace(oldQueryMainId + '', item.id)
                    if (this.$refs.aceEdit.selectedResultId.indexOf(oldQueryMainId) !== -1) {
                      oldQueryMainId < 0 ? (this.initSelectedResultId = lItem['idTimeStamp']) : ''
                    }
                  }
                  return lItem
                })

                delete this.queryAllObj[oldQueryMainId]
              }
              if (window.$undoManager && window.$undoManager[oldQueryMainId]) {
                window.$undoManager[data.id] = JSON.parse(JSON.stringify(window.$undoManager[oldQueryMainId]))
                delete window.$undoManager[oldQueryMainId]
              }

              this.initQueryCount[data.id] = this.initQueryCount[oldQueryMainId]

              // 新增成功,保存信息至Location,用于再次打开
              this.saveSqlId({...item, fileName: data.fileName})
              // 新增成功,在父节点下插入新增节点并选中该节点
              this.$refs.slideBar && this.$refs.slideBar.appendTreeNode({...data, optType: '+'})
              break
            default:
              break
          }
        }
        return item
      })
    },
    updateQueryResult (data, type = '') {
      let id = data.idTimeStamp
      this.queryAllObj[this.selectTabId].map(item => {
        if (item.idTimeStamp === id) {
          switch (type) {
            case 'selectRecord':
              item.recordNum = data.recordNum
              item.currentPage = 1
              break
            case 'search':
              item.searchValue = data.searchValue
              item.currentPage = 1
              break
            default:
              break
          }
        }
      })
    },
    removeResultItem (idTimeStamp) {
      this.queryAllObj[this.selectTabId] =
        JSON.parse(JSON.stringify(this.queryAllObj[this.selectTabId])).filter(item => { return item.idTimeStamp !== idTimeStamp })
    },
    showSlidePage (isShow) {
      this.isShowSlide = isShow
    },
    insertContent (data) {
      // 双击表名或字段名, 将内容插入到当前代码编辑器中
      if (!this.$refs.aceEdit) {
        this.buildQuery()
      }
      setTimeout(() => {
        this.$refs.aceEdit.insertComment(data.tableName || data.columnName || data.label || data.parentDBName)
      }, 300)
    },
    loadLocationSql () {
      //  撸数打开，还原上次窗口
      let fileContentsStr =  window.localStorage.getItem('fileContentsStr')
      let arr = fileContentsStr ? JSON.parse(fileContentsStr) : []
      let names = {}
      let fileIds = arr.filter(item => { return item !== null }).map(item => {
        names[item.id] = item.fileName
        return item.id
      })
      HomeService.getFiles(fileIds).then(res => {
        if (res.data.results && res.data.results.length > 0) {
          res.data.results.map(item => {
            item['rawId'] = item.id
            item['id'] = item.fileId
            item['editorValue'] = item.fileContent
            item['fileName'] = names[item.fileId]
            this.addSqlText(item)
          })
        }
      })
    },
    setHeightParams () {
      // 消除水印功能对高度计算的影响
      document.getElementById('wm_div_id') && document.getElementById('wm_div_id').style.setProperty('display', 'none')
      const availHeight = parseInt(window.screen.availHeight)
      const clientHeight = parseInt(document.body.clientHeight)
      this.propOffsetHeight = window.document.body.offsetHeight
      let wholeHeight = this.propOffsetHeight
      if (availHeight - clientHeight > 150) {
        wholeHeight = availHeight - 150
      }
      // home 高度, 已除去头部高度
      this.offsetHeight = wholeHeight - (this.isHideHeader ? 0 : 60)
    },
    handleMouseDown (evt) {
      // 左右拉动左侧导航区域
      evt = evt || event
      let mouseDownX = evt.clientX

      if (this.$refs.slideBar.$refs.resizeSDiv.setCapture) {
        this.$refs.slideBar.$refs.resizeSDiv.setCapture()
      }

      let slideWidth = this.$refs.slideBar.$refs.slidePage.style.width
      window.document.onmousemove = (ev) => {
        this.isMoving = true
        let sev = ev || event
        let mouseMoveX = sev.clientX
        let rSlideWidth = +((slideWidth).replace('px', '')) + (mouseMoveX - mouseDownX)
        if (rSlideWidth > (this.leftSlideWidth - 0.1) && rSlideWidth < 1000) {
          this.$refs.slideBar.$refs.slidePage.style.width = rSlideWidth + 'px'
          this.$refs.rightWrap.style.marginLeft = (rSlideWidth + 10) + 'px'
        } else if (rSlideWidth < this.leftSlideWidth) {
          this.$refs.slideBar.$refs.slidePage.style.width = this.leftSlideWidth + 'px'
          this.$refs.rightWrap.style.marginLeft = this.leftSlideWidth + 10 + 'px'
        }
      }
    },
    resetWaterMark () {
      let wholeWidth = document.body.offsetWidth
      wholeWidth = wholeWidth  < 1200 ? 1200 : wholeWidth
      let waterWidth = Math.floor((wholeWidth - 120) / 10)
      let offsetWHeight = Math.ceil(Math.sin(2 * Math.PI / 360 * 15) * waterWidth)
      let waterHeight = Math.floor((window.document.body.offsetHeight - 90  - offsetWHeight) / 10)
      // 添加水印
      this.waterMarkTimer && clearTimeout(this.waterMarkTimer)
      this.waterMarkTimer = setTimeout(() => {
        let date = new Date()
        this.userInfo && watermark.load({
          watermark_txt: this.userInfo.name + ' ' + this.userInfo.jobNumber + ' ' + date.getFullYear() + ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + date.getDate(),
          watermark_alpha: 0.005,
          watermark_rows: 10,
          watermark_cols: 10,
          watermark_angle: 15,
          watermark_x_space: 10,
          watermark_y_space: 10,
          watermark_height: waterHeight - 0.5,
          watermark_width: waterWidth,
          watermark_color: 'red'
        })
      }, 1000)
    },
    registerBeforeUnload () {
      window.onbeforeunload = e => {
        e = e || window.event
        // 兼容IE8和Firefox 4之前的版本
        if (e) {
          e.returnValue = '关闭提示'
        }
        // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
        return '关闭提示'
      }
    }
  },
  created () {
    this.setHeightParams()
    this.loadLocationSql()
    this.oldOffsetHeight = this.offsetHeight
  },
  mounted () {
    window.onresize = () => {
      this.setHeightParams()
      if (this.offsetHeight !== this.oldOffsetHeight) {
        let height = this.offsetHeight - this.oldOffsetHeight
        this.$refs.aceEdit && (height !== 0) && this.$refs.aceEdit.updateEditorHeight(height)
        this.oldOffsetHeight = this.offsetHeight
      }
      this.resetWaterMark()
    }

    // 左侧拉伸, 代码编辑区结果区上下拉伸
    window.document.onmouseup = () => {
      window.document.onmousemove = null
      this.isMoving = false
      // 释放全局捕获
      if (this.$refs.slideBar.$refs.resizeSDiv && this.$refs.slideBar.$refs.resizeSDiv.releaseCapture) {
        this.$refs.slideBar.$refs.resizeSDiv.releaseCapture()
      }
      if (this.$refs.aceEdit && this.$refs.aceEdit.$refs && this.$refs.aceEdit.$refs.resizeDiv.releaseCapture) {
        this.$refs.aceEdit.$refs.resizeDiv.releaseCapture()
      }
    }

    this.resetWaterMark()
    this.registerBeforeUnload()
  }
}
</script>
