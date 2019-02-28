/*
  * @title  sql查询主页面
  * @author huangjian
  * @time   2018-11-08
*/
<template>
  <div class="home" :style="`height: ${offsetHeight}px`">
    <slide-bar
      ref="slideBar"
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
    <div class="right-wrap" ref="rightWrap" :style="'margin-left:'+(isShowSlide? '360px': '60px')">
        <ide-edit
                v-if="sqlData.length > 0"
                ref="aceEdit"
                @toggleWindow="showSlidePage"
                :init-new-max-id="initNewMaxId"
                :init-selected-result-id="initSelectedResultId"
                :init-new-count="initNewCount"
                :add-sql-text="addSqlText"
                :sql-data="sqlData"
                :select-tab-id="selectTabId"
                :editor-value="editorValue"
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
    <div class="fr-area"><a :href="item.url" :title="item.label" :key="item.label"
                               target="_blank" v-for="item in rightList"><i :class="['fa', item.icon]"></i></a></div>
  </div>
</template>
<style lang="stylus" rel="stylesheet/stylus" type="text/stylus" scoped>
  $mainBlueColor = #409eff
  $whiteColor = #fff
  .home
    position relative
    background-color #304156

    .right-wrap
     height 100%

    .no-sqlData
      /*margin-left 360px*/
      background rgba(30, 30, 30, 1)
      color #FFF
      height 100%

    .add-new
      display inline-block
      font-size 20px
      color $whiteColor
      vertical-align top
      margin 12px 6px 11px 18px
      cursor pointer
      &:hover
       color $mainBlueColor

    .fr-area
      position absolute
      display inline-block
      width 34px
      top 36%
      right 0
      padding 6px 2px 6px 0
      text-align right
      transform translate(0, -50%)
      background-color #383838
      border solid 1px #797979
      border-right-color transparent
      z-index 99
      a,.fa
        color #fff
        font-size 28px
        &:hover
          color $mainBlueColor
      a
       line-height 36px
      .fa
        display inline-block
      .fa-pie-chart,.fa-legal
        width 20px
        margin-right 6px

</style>
<script>
import { mapState } from 'vuex'
import HomeService from 'src/services/home/index'
import SlideBar from 'src/components/home/SlideBar'
import IdeEdit from 'src/components/home/IdeEdit'
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
      isShowSlide: true,
      propOffsetHeight: 0,
      clusterLoad: '-1',
      defaultQueryData: {
        databaseName: 'default',
        engine: 'IMPALA',
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
      isMoving: false
    }
  },
  components: { SlideBar, IdeEdit},
  watch: {
    currentGroupValue (value) {
      let data = JSON.parse(JSON.stringify(this.sqlData))
      data.map(item => {
        if (item.queryData.queryStatus == undefined || item.queryData.queryStatus == 'FAILED' || item.queryData.queryStatus == 'FINISHED') {
          item.queryData.currentGroupValue = value
        }
      })
      this.$nextTick(function () {
        this.sqlData = data
      })
    }
  },
  computed: {
    ...mapState({
      currentGroupValue: state => state.currentGroupValue // 用户信息
    }),
    getQueryData () {
      let queryData =  this.sqlData.length > 0 ? (this.sqlData.filter(item => item.id == this.selectTabId)[0].queryData) :
                        ({...this.defaultQueryData, currentGroupValue: this.$store.state.currentGroupValue})
      queryData['queryMainId'] = this.selectTabId
      return queryData
    }
  },
  methods: {
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
    loadCluster () {
      setTimeout(async () => {
        const { data: result } = await HomeService.loadCluster()
        this.clusterLoad = `${result}`
        this.loadCluster()
      }, 30000)
    },
    preAddSql (data) {
      // 未超出限定情况下, tab中已存在, 则直接打开; 若不存在, 则访问接口获取信息
      !data.isAdd ? (this.selectedTreeId = data.id) : '' //设置左侧树选中节点ID
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
         this.$message.error('最多打开10个sql文件！')
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
      function getFull(val, tail = '') {
         return (val < 10 ? ('0' + val) : val) + tail
      }
      // 添加代码注释
      let des = '-- ===============================================\n' +
             '-- Author: ' + this.$store.state.userInfo.name + '（' + this.$store.state.userInfo.jobNumber + ')\n' +
            '-- Create date: ' + year + '-' + getFull(month, '-') + getFull(day,' ') + getFull(hour,':') + getFull(minute,':') + getFull(second) + '\n' +
            '-- Description: (请填写)\n' +
            '-- Modify [1]: --\n' +
            '-- ================================================\n\n'
      return des
    },
    buildQuery () {
      this.addSqlText({isAdd: true, id: (--this.initNewMaxId), fileName: '(新查询)-' + (++this.initNewCount), editorValue: this.getDescription()})
    },
    addSqlText (data) {
      // 新增一条数据
      if (!this.preAddSql(data)) {
          return
      }
//      if (!!data.isAppendTreeNode) { // 来自左侧树新增sql
//          data['editorValue'] = this.getDescription()
//      }
      this.saveSqlId(data)
      data.initNewCount && (this.initNewCount = data.initNewCount) // 同步新增序号初始值

      const hasThisData = this.sqlData.filter(item => item.id == data.id)
      this.$nextTick(() => {
        if (hasThisData.length === 0) {
          let sqlData = [...this.sqlData, {
            label: data.fileName,
            isAdd: !!data.isAdd,
            id: data.id,
            editorValue: data.editorValue, 
            queryData: {...this.defaultQueryData, currentGroupValue: this.$store.state.currentGroupValue},
          }]
          this.sqlData = sqlData
          this.editorValue = data.editorValue
        }

        this.selectTabId = data.id //设置右侧tab选中节点ID
        !!data.isAdd && this.$refs.aceEdit && (this.$refs.aceEdit.addDes())
        this.initSelectedResultId = ''
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
      // 切换tab
      this.selectedTreeId = id
      this.selectTabId = id
      let data = JSON.parse(JSON.stringify(this.sqlData))
      data.map(item => {
        if (item.id === id) {
          this.editorValue = item.editorValue
          this.initSelectedResultId = item.queryData.idTimeStamp
        }
      })
    },
    setEditorValue (value) {
      // 设置编辑器value
      this.sqlData.map(item => {
        if (item.id == this.selectTabId) {
          item.editorValue = value
        }
      })
      this.editorValue = value
    },
    removeSqlText (removeId) {
      // 移除一条tab
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
        return
      }
      const sqlData = this.sqlData.filter(item => item.id !== removeId)
      this.sqlData = sqlData
      // 如果删除的是当前选中的tab, 则初始化默认值
      if (removeId === this.selectTabId) {
        this.editorValue = sqlData[0] && sqlData[0].editorValue
        this.selectTabId = sqlData[0] && sqlData[0].id
        this.selectedTreeId = this.selectTabId
        setTimeout(() => {
            this.getQueryData.queryMainId === this.selectTabId ? (this.initSelectedResultId = this.getQueryData.idTimeStamp) : ''
        }, 0)
      }
      this.queryAllObj[removeId] && (delete this.queryAllObj[removeId])
      this.initQueryCount[removeId] && (delete this.initQueryCount[removeId]) // 恢复结果统计
      this.queryAllObj[removeId] && this.$refs.aceEdit && this.$refs.aceEdit.resetResTable() // 重置结果表
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
                          searchValue: '',
                          recordNum: this.defaultQueryData.recordNum,
                          queryId: data.queryId,
                          columnNames: data.columnNames,
                          allResultData: allResultData,
                          tableData: allResultData.slice(0, this.defaultQueryData.recordNum),
                          total: allResultData.length,
                          currentPage: 1,
                          order: '',
                          prop: ''
                      }
                      if (this.queryAllObj[item.id]) {
                          this.queryAllObj[item.id].length > 3 && this.queryAllObj[item.id].shift()
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
                  item['queryData'].queryStatus = 'STOPPED'
                break
              case 'addSuccess':
                  let oldQueryMainId = item['queryData'].queryMainId
                  this.selectTabId = data.id
                  this.editorValue = data.fileContent
                  item.editorValue = this.editorValue
                  item.id = data.id
                  item.label = data.fileName
                  item.isAdd = false
                  item['queryData'].isChanged = false
                  item['queryData'].queryMainId =  item.id // 新增成功,更新queryMainId以及相关参数
                  item['queryData'].idTimeStamp =  item['queryData'].idTimeStamp.replace(oldQueryMainId + '', item.id)
                  if (this.queryAllObj[oldQueryMainId]) { // 若存在结果集, 更新相关参数
                      let arr = JSON.parse(JSON.stringify(this.queryAllObj[oldQueryMainId]))
                      this.queryAllObj[data.id] = arr.map( lItem => {
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
       this.queryAllObj[this.selectTabId].map( item => {
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
        let arr = idTimeStamp.split('_')
        let tabId = arr[2]
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
       const availHeight = parseInt(window.screen.availHeight)
       const clientHeight = parseInt(document.body.clientHeight)
       this.propOffsetHeight = window.document.body.offsetHeight
       let wholeHeight = this.propOffsetHeight
       if (availHeight - clientHeight > 150) {
           wholeHeight = availHeight - 150
       }
       this.offsetHeight = wholeHeight - 60
    },
    handleMouseDown (evt) {
          // 左右拉动左侧导航区域
          evt = evt || event
          let mouseDownX = evt.clientX

          if (this.$refs.slideBar.$refs.resizeSDiv.setCapture) {
              this.$refs.slideBar.$refs.resizeSDiv.setCapture()
          }
          let _this = this
          let slideWidth = this.$refs.slideBar.$refs.slidePage.style.width
          window.document.onmousemove = function (ev) {
              _this.isMoving = true
              let sev = ev || event
              let mouseMoveX = sev.clientX
              let rSlideWidth = +((slideWidth).replace('px', '')) + (mouseMoveX - mouseDownX)
              if (rSlideWidth > 349.9 && rSlideWidth < 1000) {
                  _this.$refs.slideBar.$refs.slidePage.style.width = rSlideWidth + 'px'
                  _this.$refs.rightWrap.style.marginLeft = (rSlideWidth + 10) + 'px'
              } else if (rSlideWidth < 350) {
                  _this.$refs.slideBar.$refs.slidePage.style.width = '350px'
                  _this.$refs.rightWrap.style.marginLeft = '360px'
              }
          }
    }
  },
  created () {
    this.setHeightParams()
    this.oldOffsetHeight = this.offsetHeight

    //    this.loadCluster() // 根据产品需求,关闭原有的集群访问
    this.loadLocationSql()
  },
  mounted () {
    let _this = this
    window.onresize = () => {
        this.setHeightParams()
        if (this.offsetHeight !== this.oldOffsetHeight) {
            let height = this.offsetHeight - this.oldOffsetHeight
            this.$refs.aceEdit && (height !== 0) &&(this.$refs.aceEdit.updateEditorHeight(height))
            this.oldOffsetHeight = this.offsetHeight
        }
    }

    // 左侧拉伸, 代码编辑区结果区上下拉伸
    window.document.onmouseup = function () {
        window.document.onmousemove = null
        _this.isMoving = false
        // 释放全局捕获
        if (_this.$refs.slideBar.$refs.resizeSDiv && _this.$refs.slideBar.$refs.resizeSDiv.releaseCapture) {
            _this.$refs.slideBar.$refs.resizeSDiv.releaseCapture()
        }
        if (_this.$refs.aceEdit && _this.$refs.aceEdit.$refs && _this.$refs.aceEdit.$refs.resizeDiv.releaseCapture) {
            _this.$refs.aceEdit.$refs.resizeDiv.releaseCapture()
        }
    }
  }
}
</script>
