/*
* @title  sql编辑器
* @author huangjian
* @time   2018-11-08
*/
<template>
  <div class="ide-edit-page" ref="ideEditPage">
    <div class="title-tab" id="ideTitleBox">
      <li v-if="sqlData.length > 1" v-for="item in sqlData" :key="item.id"
          :class="selectTabId == item.id? 'tab_active': 'tab-li'" :id="item.id">
        <span class="tab-name" @click.stop.prevent="selectTab(item.id)"><i :class="getStatusIcon(item)"></i>{{item.label}}</span>
          <span title="close" class="delete"
                @click.stop.prevent="removeItem(item, item.queryData.isChanged, item.queryData.loading)">
              <i class="el-icon-close" v-if="!item.queryData.isChanged"></i>
              <span class="is-digest" v-else></span>
          </span>
      </li>
      <li class="tab_active" :id="sqlData[0].id" v-else>
        <span class="tab-name"><i :class="getStatusIcon(sqlData[0])"></i>{{sqlData[0].label}}</span>
        <span @click.stop.prevent="removeItem(sqlData[0], sqlData[0].queryData.isChanged, sqlData[0].queryData.loading)"
              title="close" class="delete">
            <i class="el-icon-close" v-if="!sqlData[0].queryData.isChanged"></i>
            <span class="is-digest" v-else></span>
        </span>
      </li>
      <i class="fa fa-plus add-new cursor-pointer" @click="buildQuery"></i>
    </div>
    <div class="action user-select clearfix" v-if="sqlData.length > 0">
      <span class="is-running" v-if="queryData.loading" @click="runTips"></span>
      <span class="action-run fs-14" title="执行SQL" @click="runSql"><i class="fa fa-play-circle"></i>执行<span
          class="fs-12">(ctrl+enter)</span></span>
      <ins> |</ins>
      <span class="action-stop fs-14" title="停止执行SQL" @click="stopSql"><i class="fa fa-stop-circle-o"></i>停止</span>
      <ins> |</ins>
        <span class="action-save fs-14" title="保存代码到目录文件" @click="saveSql"><i class="fa fa-save"></i>保存
          <!--<span class="fs-12">(alt+s)</span>-->
        </span>

      <div class="opt-right">
        <span class="action-format pdlr-0 h-36" title="格式化代码" @click="sqlFormat"><img
            src="../../assets/image/format.png"><span class="fs-vm mgl-4">格式化</span></span>
        <span class="action-change pdlr-0 h-36" @click="dialogThemeVisible=true" title="代码主题"><i
            class="fa fa-eyedropper mgl-4"></i><span class="fs-vm">主题</span></span>
        <span class="action-change pdlr-0 h-36" @click="addDes" title="插入注释"><i class="fa fa-code mgl-4"></i><span
            class="fs-vm">注释</span></span>
        <span class="action-change pdlr-0 h-36" @click="changeFontSize" title="字体大小切换"><i
            class="fa fa-font mgl-4"></i><span class="fs-vm">字体</span></span>
            <span class="action-alt pdlr-0 h-36" @click="toggleEditorWindow" title="代码区域缩展"><i
                :class="['fa mgl-4',!isEnLarge?'fa-expand':'fa-compress']"></i>
                <span class="fs-vm">窗口</span></span>
        <span class="fs-14 mgl-4">执行引擎：</span>
        <select class="fs-12" v-model="engine" @change="selectEngine" size="mini" :disabled="queryData.loading">
          <option :value="item.value" :key="item.value" v-for="item in engines">{{item.name}}</option>
        </select>
      </div>
    </div>
    <div
        class="ace-edit"
        ref="aceEdit"
        v-loading="!queryData.canEdit"
        element-loading-background="rgba(255, 255, 255, 0)">
    </div>
    <div class="result-log" ref="resultLog" :style="'height:'+resultLogHeight+'px'">
      <div ref="resizeDiv" class="up-down-resize" @mousedown="handleMouseDown"></div>
      <div class="tab">
        <li :class="statusType=='log' ? 'active': ''" @click="logOrResult('log')">日志</li>
        <li v-for="(item,index) in queryAllObj[selectTabId]"
            :key="item.idTimeStamp"
            :class="(statusType == 'result' && item.idTimeStamp==selectedResultId)? 'active': ''"
            @click="logOrResult('result',item.idTimeStamp)">
          <el-popover popper-class="result-sql" placement="top-start" trigger="hover" width="424">
            <pre class="sql-statement">{{item.sqlStatement ? item.sqlStatement : ''}}</pre>
            <span slot="reference">结果{{item.idxOfExe}}</span>
          </el-popover>
          <i class="el-icon-close" @click.stop.prevent="removeResultItem(item.idTimeStamp)"></i></li>
        <div class="tab-right">
          <a class="history" href="#/history/list" target="_blank">查询统计与历史记录</a>
        </div>
      </div>
      <div class="log-detail" v-if="statusType==='log'">
        <div class="status-detail">
          <div class="detail fs-12">
            <span>文件名：{{queryData.tabName || ''}}；</span>
            <span>执行引擎：{{queryData.engine || ''}}；</span>
            <span>开发组：{{queryData.currentGroupValue || ''}}；</span>
            <span v-if="queryData.queryStatus">查询状态：<span
                :class="queryData.queryStatus">{{queryData.queryStatus || ''}}</span></span>
          </div>
        </div>
        <div class="log-info" ref="logInfo"
             :style="'display:'+(!isEnLarge?'block':'none')+';height:'+logInfoHeight+'px'">
          <div class="error-tips" v-if="queryData.serviceTips">错误原因：{{queryData.serviceTips}}</div>
          <div class="query-log" v-html="queryData.queryLog"></div>
        </div>
      </div>
      <div class="result-table" v-else>
        <div class="result-action">
          <div class="left">
            <span>显示<select v-model="recordNum" @change="selectRecordNum">
              <option v-for="val in recordNums" :value="val">{{val}}</option>
            </select>记录</span>
          </div>
          <div class="opt-right">
            <span class="download"><i class="fa fa-question cursor-pointer"
                                      @click="dialogResHelpVisible=true"></i></span>
            <span class="toggle-res" @click="toggleResultWindow" title="结果区域缩展"><i
                :class="['fs-14 fa',!isEnLargeRes?'fa-expand':'fa-compress']"></i>&nbsp;窗口</span>
            <a class="cursor-pointer" @click="dialogDownloadVisible=true"><i class="fa fa-arrow-circle-o-down"></i>结果下载</a>
            <span>在结果中搜索：</span>
            <el-input v-model="searchValue" placeholder="输入后回车" clearable size="mini" @clear="searchResult"
                      @keyup.enter.native="searchResult"></el-input>
            <!--<span class="copy">-->
            <!--<a v-clipboard:copy="searchValue" v-clipboard:success="onCopy" v-clipboard:error="onError">复制</a>-->
            <!--</span>-->
          </div>
        </div>
        <div class="table-mask"
             v-loading="isNeedLoading"
             element-loading-spinner="el-icon-loading"
             :style="'display:'+(!isEnLarge&&tableMaxHeight>0?'block':'none')+';'+'height:'+tableMaxHeight+'px;'"
             element-loading-background="rgba(255, 255, 255, 0)"></div>
        <div class="table" ref="logTable"
             :style="'display:'+(!isEnLarge&&tableMaxHeight>0?'block':'none')+';'+'max-height:'+(tableMaxHeight+42)+'px;'">
          <div :style="'max-height:'+tableMaxHeight+'px'" v-for="itemQuery in resTableData"
               :key="itemQuery.queryMainId+itemQuery.queryId" v-if="itemQuery.idTimeStamp === selectedResultId">
            <el-table
                :ref="'eltable'+itemQuery.idTimeStamp"
                :data="itemQuery.tableData"
                @sort-change="handleTableSort"
                :default-sort="getDefaultSort(itemQuery)"
                border
                stripe
                show-overflow-tooltip
                size="mini"
                :max-height="tableMaxHeight"
                @row-dblclick="handleRowDBClick"
                style="width: 100%">
              <el-table-column
                  sortable
                  show-overflow-tooltip
                  :prop="`name_${index}`"
                  :label="item[`name_${index}`]"
                  v-for="(item, index) in itemQuery.columnNames" :key="item[`name_${index}`]">
              </el-table-column>
            </el-table>
                <span class="el-pagination__total fr mgtb-inline"
                      style="line-height: 32px;"
                      v-if="itemQuery.total<recordNum+1">共 {{itemQuery.total}} 条</span>
            <el-pagination
                v-show="itemQuery.total>recordNum"
                class="fr mgtb-inline"
                @current-change="filterTableData"
                :current-page.sync="itemQuery.currentPage"
                :page-size="itemQuery.recordNum"
                layout="total, prev, pager, next, jumper"
                :total="itemQuery.total">
            </el-pagination>
          </div>
        </div>
      </div>
    </div>

    <!-------------------新查询保存- 开始------------------>
    <el-dialog title="保存文件" :visible.sync="dialogSaveVisible" @close="handleSaveClose">
      <el-form ref="saveNewForm" :model="saveNewForm" label-width="110px">
        <el-form-item label="文件目录：">
          <el-select v-model="saveNewForm.id" placeholder="请选择文件目录" size="small">
            <el-option v-for="item in fileDirs" :label="item.fileName" :value="item.id" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文件名：">
          <el-input v-model="saveNewForm.fileName" size="small" maxlength="20"
                    @input="limitFileName(saveNewForm.fileName,2)"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer clearfix">
        <el-button style="float: left" type="primary" @click="saveFast" size="small">快速保存</el-button>
        <el-button class="white-btn" @click="dialogSaveVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="saveMakeSure" size="small">确 认</el-button>
      </div>
    </el-dialog>
    <!-------------------新查询保存- 结束------------------>
    <!-------------------数据查询结果提示---记录---- 开始------------------>
    <el-dialog title="数据查询结果提示" :visible.sync="dialogResHelpVisible">
      <p class="fs-14 lh-24">查询结果最多列出200行数据。</p>
      <!--<p class="fs-14 lh-24" style="color:red;">接到最新通知，撸数全面停止下载数据功能。</p>-->
      <p class="fs-14 lh-24">撸数将提供最多200条数据下载，如果您需要下载更多数据，可以前往Rubik系统，制作报表，按照设计的规则进行数据下载。</p>
      <p class="fs-14 lh-24">注意：查询结果排序，仅做了本页排序。如果你想做200条全量排序，可以选中每页200条。</p>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogResHelpVisible=false" size="small">确 认</el-button>
      </div>
    </el-dialog>
    <!-------------------数据查询结果提示---记录---- 结束------------------>
    <!-------------------数据查询结果---row details---- 开始------------------>
    <el-dialog class="w-800" title="Row details" :visible.sync="dialogResRowVisible">
      <div class="selected-row">
        <p v-for="(item,index) in curQueryResult.columnNames" class="row-item">
          <span class="row-name">{{item['name_'+index]}}</span><span
            class="row-content">{{curRow['name_'+index]}}</span></p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogResRowVisible=false" size="small">确 认</el-button>
      </div>
    </el-dialog>
    <!-------------------数据查询结果---row details---- 结束------------------>
    <!-------------------数据查询结果下载前提示------- 开始------------------>
    <el-dialog title="下载安全提示" :visible.sync="dialogDownloadVisible">
      <p class="fs-14">亲爱的同学：</p>
      <p class="fs-14 mgl-28">你将下载部分数据！</p>
      <p class="fs-14 mgl-28">系统将记录你的行为，记录下载的数据内容。请一定注意数据安全！</p>
      <p class="fs-14 mgl-28">严禁对内不相关的同学传播数据，严禁以任何形式对外提供数据！</p>
      <p class="fs-14 mgl-28">请大家谨记！谨记！</p>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="download('csv')" size="small">同意并下载(.csv)</el-button>
        <el-button type="primary" @click="download('xlsx')" size="small">同意并下载(.xlsx)</el-button>
        <el-button type="primary" @click="dialogDownloadVisible=false" size="small">放弃</el-button>
      </div>
    </el-dialog>
    <!-------------------数据查询结果下载前提示------- 结束------------------>
    <!-------------------代码编辑器主题- 开始------------------>
    <el-dialog title="代码编辑器主题" :visible.sync="dialogThemeVisible">
      <el-form label-width="110px">
        <el-form-item label="主题名：">
          <el-select ref="themeSelect" v-model="aceTheme" placeholder="" size="small">
            <el-option v-for="item in aceThemes" :label="item.label" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="说明：">
          <span class="fs-14">暂时仅支持代码编辑器以及日志、结果主题同步切换，希望能理解！</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="white-btn" @click="dialogThemeVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="toggleThemeOK" size="small">确 认</el-button>
      </div>
    </el-dialog>
    <!-------------------代码编辑器主题- 结束------------------>
  </div>
</template>

<script type="text/ecmascript-6">
  import Config from '../../config'
  import HomeService from 'src/services/home/index'
  import ACE from 'src/assets/js/ace/ace.js'
  import 'src/assets/js/ace/ext-language_tools.js'
//  import 'src/assets/js/ace/expand-language_tools.js'
  import 'src/assets/js/ace/mode-sql.js'
  import 'src/assets/js/ace/snippets/sql.js'

  import SqlFormatter from 'sql-formatter'

  export default {
    props: {
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
    },
    data () {
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
    watch: {
      initSelectedResultId (to) {
        if (to === undefined || to === '' || to.indexOf('log_') !== -1) { // 结果列表中, 该selectedTab无历史记录
          this.statusType = 'log'
          this.selectedResultId = ''
          this.$nextTick(() => {
            this.resTableData = JSON.parse(JSON.stringify(this.queryAllObj))[this.selectTabId] || []
          })
        } else {
          let fromId = parseInt(to.split('_')[2])
          if (!isNaN(fromId) && this.selectTabId === fromId) { // 当前selectedTab与异步结果返回的id一致
            this.statusType = 'result'
            this.selectedResultId = to
            this.isNeedLoading = true
            this.setCurQueryResult(to, true)
          } else if (!isNaN(fromId) && this.selectTabId !== fromId) { // 异步结果, 非当前selectedTab
            this.setQueryData({
              selectTabId: fromId,
              idTimeStamp: to
            }, 'change')
          }
        }
      },
      propOffsetHeight (to) {
        this.offsetHeight = to
        this.setReOffsetHeight()
      },
      initEditorValue (to) {
        this.editor.setValue(to, 1)
        this.setQueryData({
          isChanged: this.queryData.isChanged
        }, 'change')
      }
    },
    methods: {
      resetSession () {
        this.$nextTick(() => {
          // ctrl + z, 重置返回栈
          this.editor.session.getUndoManager().reset()
        })
      },
      getDefaultSort(item) {
        return {order: item.order, prop: item.prop}
      },
      // 当前文件执行状态
      getStatusIcon (item) {
        let classMap = {
          'FAILED': 'warning icon',
          'FINISHED': 'success icon',
          'RUNNING': 'query icon',
          'READY': 'query icon'
        }
        return classMap[item.queryData.queryStatus] || 'fa fa-file-o'
      },
      selectTab (id) {
        this.isChangeTab = true
        this.isNeedLoading = false
        this.resTimer && clearTimeout(this.resTimer) // 清除结果tab切换产生的timer
        // 切换文件
        this.setEditorValue(this.editor.getValue())
        this.setQueryData({
          selectTabId: this.selectTabId,
          idTimeStamp: (this.statusType === 'log' && this.resTableData.length !== 0) ? ('log_' + this.selectTabId) : this.selectedResultId,
          isChanged: this.queryData.isChanged
        }, 'change')
        this.changeTab(id)
        this.resetSession()
      },
      removeItem (removeItem, isChanged, loading) {
        // 移除tab
        let removeId = removeItem.id
        if (isChanged) {
          this.$confirm('文件已被修改，是否保存?', '提示', {
            distinguishCancelAndClose: true,
            confirmButtonText: '是',
            cancelButtonText: '否',
            type: 'warning',
            confirmButtonClass: 'confirm-btn',
            cancelButtonClass: 'confirm-btn'
          }).then(() => {
            !!removeItem.isAdd ? (this.dialogSaveVisible = true) : this.saveSql()
          }).catch((action) => {
            if (action === 'cancel') {
              loading ? this.removeRunSql(removeId): this.removeSqlText(removeId)
            } else {
              this.dialogSaveVisible = false
            }
          })
        } else {
          loading ? this.removeRunSql(removeId): this.removeSqlText(removeId)
        }
      },
      removeRunSql (removeId) {
        // 如果sql正在执行
        this.$confirm('文件正在执行SQL，关闭后SQL将会停止，是否关闭?', '提示', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning',
          confirmButtonClass: 'confirm-btn',
          cancelButtonClass: 'confirm-btn'
        }).then(() => {
          this.removeSqlText(removeId)
          this.stopSql()
        })
      },
      logOrResult (type, idTimeStamp = '') {
        if (idTimeStamp === this.selectedResultId) {
          return
        }
        // 查看日志或者结果
        this.selectedResultId = idTimeStamp
        this.statusType = type
        this.resTableData = []
        this.statusType !== 'log' ? this.setCurQueryResult(idTimeStamp, true) : ''
      },
      resetResTable () {
        this.selectedResultId = ''
        this.statusType = 'log'
        this.resTableData = []
      },
      getResultStatus (queryId, selectTabId, sqlStatement = '') {
        // 获取执行SQL结果数据
        HomeService.runSQLResult({queryId: queryId}).then((res) => {
          let result = res.data
          result.queryLog = result.queryLog.replace(/\n/g, "<br/>")

          let columnNames = result.columnNames || []
          columnNames = columnNames.filter(item => {
            return JSON.stringify(item) && (JSON.stringify(item) !== '"﻿"')
          })
          let tableData = result.data || []
          let newColumns = []
          let newTable = []
          columnNames.map((column, index) => {
            let obj = {}
            obj[`name_${index}`] = column
            newColumns = [...newColumns, obj]
          })

          tableData.map(item => {
            let obj = {}
            item.map((value, index) => {
              obj[`name_${index}`] = value
            })
            newTable = [...newTable, obj]
          })

          !this.isStop ? this.setQueryData({
            queryStatus: result.queryStatus,
            execTime: result.execTime,
            queryLog: result.queryLog,
            allResultData: newTable,
            sqlStatement: sqlStatement,
            queryId: queryId,
            columnNames: newColumns,
            selectTabId: selectTabId
          }, 'logSuccess') : this.setQueryData({loading: false}, 'loading')
          if (result.queryStatus !== 'STOPPED' && result.queryStatus !== 'FINISHED' && result.queryStatus !== 'FAILED' && !this.isStop) {
            setTimeout(() => {
              this.getResultStatus(queryId, selectTabId, sqlStatement)
            }, 3000)
          }
        }).catch(() => {
          this.setQueryData({loading: false}, 'loading')
        })
      },
      async runSql () {
        // 执行sql
        let editorValue = this.editor.getValue()
        // 是否执行选中的sql
        if (this.editor.getCopyText()) {
          editorValue = this.editor.getCopyText()
        }
        if (!editorValue) {
          this.$message.error('请先填写SQL！')
          return
        }
        if (!this.queryData.currentGroupValue) {
          this.$message.error('您还没有开发组，请先与大数据部门同学【钉钉：刘征】联系。')
          return
        }

        this.setQueryData({loading: true}, 'loading')
        this.setQueryData({canEdit: false}, 'canEdit')
        this.isStop = false

        let selectedSQL = {}
        let isAdd = false
        let isChanged = false
        let selectTabId = this.selectTabId
        this.sqlData.map(item => {
          item.id === selectTabId ? (selectedSQL = item, isAdd = !!item.isAdd, isChanged = item.queryData.isChanged) : ''
        })
        !isAdd && isChanged && this.saveSql(true)

        HomeService.runSQLSubmit({
          application: "hive-web",   //提交sql的项目代号，撸数指定 hive-web
          execMode: this.engine,   //执行引擎，目前支持：IMPALA,HIVE
          roleName: this.queryData.currentGroupValue, //用户所属开发组this.queryData.currentGroupValue
          hql: editorValue,          // 执行sql
          rowLimit: 200,      // 查询结果限制，目前最大支持1000 ，
          properties: ""       //其他一些查询属性设置，保留字段，目前传空字符串
        }).then((res) => {
          let resData = res.data
          if (resData.code === 200 && !this.isStop) {
            this.$message.success('SQL递交执行中……')
            this.getResultStatus(resData.queryId, this.selectTabId, editorValue.slice(0, 300))
            this.setQueryData({selectTabId: selectTabId, canEdit: true}, 'canEdit')
          } else {
            this.$message.error(resData.message)
            this.setQueryData({
              serviceTips: resData.message,
              queryStatus: 'FAILED',
              queryLog: 'FAILED',
              selectTabId: selectTabId
            }, 'logError')
          }
        }).catch(() => {
          this.setQueryData({loading: false}, 'loading')
          this.setQueryData({canEdit: true}, 'canEdit')
        })
      },
      async stopSql () {
        if (!this.queryData.loading) {
          return
        }
        //停止执行sql
        if (this.queryData.queryId) {
          this.isStop = true
          await HomeService.stopSQLQuery({queryId: this.queryData.queryId})
          this.setQueryData({selectTabId: this.selectTabId}, 'stopSql')
        }
      },
      async saveSql (isFromRun = false) {
        // 保存
        let selectedItem = {}
        this.sqlData.map(item => {
          item.id === this.selectTabId ? (selectedItem = item) : ''
        })
        if (selectedItem.isAdd) {
          this.dialogSaveVisible = true
        } else {
          this.setEditorValue(this.editor.getValue())
          const {data: resData}  = await HomeService.saveFileContent({
            fileId: this.selectTabId,
            fileContent: this.editor.getValue()
          }).catch(() => {
            !isFromRun && this.$message.error('保存失败！')
          })

          if (resData.success) {
            if (typeof(isFromRun) !== 'boolean') { // 来自@click
              isFromRun = false
            }
            !isFromRun ? this.$message.success('保存成功！') : ''
            this.setQueryData({
              isChanged: false
            }, 'change')
          } else {
            !isFromRun && this.$message.error(resData.messages || '保存失败！')
          }
        }
      },
      sqlFormat () {
        // sql格式化
        let editorValue = this.editor.getValue()
        let config = {language: 'sql'}
        // 格式选中的sql
        if (this.editor.getCopyText()) {
          editorValue = this.editor.getCopyText()
          // editorValue: 要查找的字符串或正则表达式
          // backwards: 是否反向搜索，默认为false
          // wrap: 搜索到文档底部是否回到顶端，默认为false
          // caseSensitive: 是否匹配大小写搜索，默认为false
          // wholeWord: 是否匹配整个单词搜素，默认为false
          // range: 搜索范围，要搜素整个文档则设置为空
          // regExp: 搜索内容是否是正则表达式，默认为false
          // start: 搜索起始位置
          // skipCurrent: 是否不搜索当前行，默认为false
          this.editor.find(editorValue, {
            backwards: false,
            wrap: false,
            caseSensitive: false,
            wholeWord: false,
            regExp: false
          });
          this.editor.replaceAll(SqlFormatter.format(editorValue, config))
          return
        }
        let newValue = SqlFormatter.format(editorValue, config)
        this.editor.setValue(newValue, 1)
      },
      download (type) {
        this.dialogDownloadVisible = false
        let a = document.createElement('a')
        a.href = Config.cosmosHost + 'lushu/rest/query/download/' + type + '/' + this.curQueryResult.queryId
        a.setAttribute('target', '_blank' + this.curQueryResult.queryId)
        a.click()
      },
      onCopy (e) {
        this.$message.success('复制成功！')
      },
      onError (e) {
        this.$message.success('复制失败！')
      },
      selectEngine () {
        // 选择执行引擎
        this.setQueryData({
          engine: this.engine
        }, 'selectEngine')
      },
      selectRecordNum () {
        // 选择结果显示记录
        this.updateQueryResult({
          idTimeStamp: this.selectedResultId,
          recordNum: this.recordNum
        }, 'selectRecord')
        this.setQueryData({
          recordNum: this.recordNum
        }, 'selectRecord')
        this.filterTableData(1)
      },
      searchResult () {
        // 查询结果,在结果中搜索【输入后回车】
        this.updateQueryResult({
          idTimeStamp: this.selectedResultId,
          searchValue: this.searchValue
        }, 'search')
        this.setCurQueryResult(this.selectedResultId)
        this.filterTableData(1)
      },
      runTips () {
        // 提示
        this.$message.success('上次提交的SQL还未完成。')
      },
      removeResultItem (idTimeStamp) {
        let isDeletedIndex = -1
        let curData = JSON.parse(JSON.stringify(this.queryAllObj[this.selectTabId]))
        curData.map((item, index) => {
          item.idTimeStamp === idTimeStamp && (isDeletedIndex = index)
        })
        let isDisplace = ( this.selectedResultId === idTimeStamp )

        this.$nextTick(() => {
          if (this.statusType !== 'log' && isDisplace) {// 删除项是选中项
            // 变更选中结果, 左移, 设置简单的当前选中结果项
            let addItem = isDeletedIndex === 0 && curData.length > 1 ? curData[1] : null
            let toggleItem = addItem || curData[isDeletedIndex - 1] || curData[isDeletedIndex - 2] || {idTimeStamp: ''}
            this.selectedResultId = toggleItem.idTimeStamp
            if (this.selectedResultId === '') {
              this.statusType = 'log'
              this.resTableData = []
              this.curQueryResult.idTimeStamp = ''
              this.setQueryData({
                selectTabId: this.selectTabId,
                idTimeStamp: ''
              }, 'change')
            } else {
              this.setCurQueryResult(this.selectedResultId)
            }
          } else {
            this.resTableData.splice(isDeletedIndex, 1)
          }
        })

        // 移除结果
        this.$emit('removeResultItem', idTimeStamp)
      },
      setCurQueryResult (idTimeStamp, isNeedAssign = false) {
        this.isNeedLoading = true //上方tab切换、结果tab切换
//          this.isNeedLoading = isNeedAssign
        let resTableData = JSON.parse(JSON.stringify(this.queryAllObj))[this.selectTabId] || []
        let oldTabId = idTimeStamp.split('_')[2]
        if (oldTabId && (oldTabId !== (this.selectTabId + ''))) {
          (resTableData === undefined || resTableData.length === 0) ? (this.statusType = 'log') : ''
        } else {
          // 设置简单的当前选中结果项
          let params = ['columnNames', 'engine', 'recordNum', 'searchValue', 'queryId', 'idTimeStamp', 'currentPage']
          resTableData.map((item, index) => {
            if (item.idTimeStamp === idTimeStamp) {
              for (let i = 0; i < params.length; i++) {
                this.curQueryResult[params[i]] = item[params[i]]
              }
              this.curQueryResult['index'] = index
            }
          })
          this.engine = this.curQueryResult.engine
          this.recordNum = this.curQueryResult.recordNum
          this.searchValue = this.curQueryResult.searchValue

          // 执行SQL tab 切换时
          // 每页展示数量 * 当前table属性值个数, 预计渲染 tr 个数, 预计涉及html标签个数
          // total 超过1600, 放入宏队列; 未超出采用$nextTick(支持promise情况下,放入微队列); 延迟加载
//              let total = this.recordNum * (this.curQueryResult.columnNames.length + 1)

          this.resTimer && clearTimeout(this.resTimer)
          this.resTimer = setTimeout(() => {
            assignTableData()
          }, 150) //统一延迟加载, 部分结果单个属性,存储数据量大
//              if (total > 1600) {
//                  this.resTimer = setTimeout(() => { assignTableData() }, 300)
//              } else {
////                  this.$nextTick( () => { assignTableData() })
//                  this.resTimer = setTimeout(() => { assignTableData() }, 100) //考虑到部分结果,表属性单个存储量大
//              }

          let _this = this

          function assignTableData() {
            !isNeedAssign ? (isNeedAssign = resTableData.length > 0 && _this.resTableData.length === 0) : '' // 数据拉取未及时, 切换时重新赋值
            isNeedAssign && (_this.resTableData = resTableData)
            _this.$nextTick(() => {
              _this.isNeedLoading = false
            }) //视图渲染完毕, 不显示加载圈
          }
        }
      },
      filterTableData (pageIdx = 1) {
        // 根据查询条件重组tableData
        let curData = this.resTableData[this.curQueryResult.index]
        let allDatas = curData.allResultData || []
        let searchValue = this.curQueryResult.searchValue
        let data = JSON.parse(JSON.stringify(allDatas))
        let pageSize = parseInt(this.recordNum)
        let columnNames = this.curQueryResult.columnNames || []
        if (searchValue !== '') {
          data = data.filter(item => {
            let isHas = false
            columnNames.map((value, index) => {
              if (item[`name_${index}`].indexOf(searchValue) !== -1 && !isHas) {
                isHas = true
              }
            })
            return isHas
          })
        }

        // 更新当前SQL tab的结果集
        curData.tableData = JSON.parse(JSON.stringify(data)).splice((pageIdx - 1) * pageSize, pageSize)
        curData.total = data.length
        curData.currentPage = pageIdx
        curData.recordNum = pageSize
        curData.searchValue = searchValue

        this.queryAllObj[this.selectTabId] = JSON.parse(JSON.stringify(this.resTableData))
        this.curQueryResult.currentPage = pageIdx
        this.curQueryResult.recordNum = pageSize
      },
      getAllDir () {
        HomeService.getAllDir().then(res => {
          this.fileDirs = res.data
        })
      },
      saveCallback (res, isFast = false) {
        if (res.data.success) {
          this.$message.success('新增成功！')
          this.setQueryData({
            ...res.data.result,
            parentId: res.data.result.parentid,
            isFast: isFast
          }, 'addSuccess')
          this.dialogSaveVisible = false
        } else {
          this.$message.error(res.data.messages)
        }
      },
      saveFast () {
        HomeService.createFileQuick({fileContent: this.editor.getValue()}).then(res => {
          this.saveCallback(res, true)
        })
      },
      saveMakeSure () {
        let params = {
          type: 0, level: 1,
          parentid: this.saveNewForm.id,
          fileName: this.saveNewForm.fileName,
          fileContent: this.editor.getValue()
        }
        // 新增sql, 点击保存后弹出中的确认操作
        HomeService.createFile(params).then(res => {
          this.saveCallback(res)
        })
      },
      buildQuery () {
        this.addSqlText({
          isAdd: true, id: (--this.newMaxId), fileName: '(新查询)-' + (++this.newCount), editorValue: '',
          initNewCount: this.newCount
        })
        this.$nextTick(() => {
          this.setQueryData({isChanged: false}, 'change')
          this.statusType = 'log'
          this.selectedResultId = ''
          this.resTableData = []
        })
      },
      insertComment (val) {
        // 1. 点击左侧 表名 字段名,插入到代码编辑器
        this.editor.insert(val)
      },
      addDes () {
        let editorVal = this.editor.getValue()
        this.editor.setValue(this.getDescription() + editorVal, 1)
      },
      changeFontSize () {
        // 循环变更字体大小 12px 14px 16px
        this.defaultIndex = (++this.defaultIndex) % 3
        this.editor.setFontSize(this.fontSizes[this.defaultIndex])
      },
      toggleEditorWindow () {
        // 放大 缩小 代码编辑区区域
        this.isEnLarge = !this.isEnLarge
        this.isEnLargeRes = false
        let _this = this

        this.tableMaxHeight = 100
        !this.isEnLarge && this.$refs.logTable && (this.$refs.logTable.style.height = `${(this.reOffsetHeight * 0.3) - 76}px`)
        !this.isEnLarge && (this.logInfoHeight = this.reOffsetHeight * 0.3 - 76)
        this.resultLogHeight = !this.isEnLarge ? (this.reOffsetHeight * 0.3) : 76

        let aceOffset = this.isEnLarge ? (75 + 136) : (this.reOffsetHeight * 0.3 + 136)
        this.timer && clearTimeout(this.timer)
        this.isEnLarge ? resizeEditor(aceOffset) : ''
        this.timer = setTimeout(() => { // 缩小时, 延迟变更编辑器高度, 提升体验
          !this.isEnLarge ? resizeEditor(aceOffset) : ''
          this.timer = null
        }, 300)

        function resizeEditor(aceOffset) {
          _this.$refs.aceEdit.style.height = (_this.offsetHeight - aceOffset) + 'px'
          _this.editor.resize(true)
        }

        this.$emit('toggleWindow', !this.isEnLarge)
      },
      toggleResultWindow () {
        // 放大 缩小 结果区域
        this.isEnLargeRes = !this.isEnLargeRes
        this.isEnLarge = false

        let resultHeight = this.reOffsetHeight * (!this.isEnLargeRes ? 0.3 : 1)
        this.$refs.resultLog && (this.$refs.resultLog.style.height = resultHeight + 'px')
        this.$refs.logTable && (this.$refs.logTable.style.height = (resultHeight - 76) + 'px')
        this.tableMaxHeight = resultHeight - 118
        this.logInfoHeight = resultHeight - 76
        this.resultLogHeight = resultHeight

        this.$refs.logTable && (this.$refs.logTable.style.display = 'block')
        this.$refs.logInfo && (this.$refs.logInfo.style.display = 'block')
        if (this.isEnLargeRes) {
          this.$refs.aceEdit.style.height = (this.reOffsetHeight * 0.7) + 'px'
        }
        this.editor.resize(true)

        this.$emit('toggleWindow', !this.isEnLargeRes)
      },
      handleSaveClose () {
        this.saveNewForm = {id: '', fileName: ''}
      },
      handleRowDBClick (row) {
        //双击结果表格,弹窗当前行数据
        this.dialogResRowVisible = true
        this.curRow = row
      },
      handleTableSort (column) {
        this.curQueryResult['order'] = column.order
        this.curQueryResult['prop'] = column.prop
        this.resTableData[this.curQueryResult.index].order = column.order
        this.resTableData[this.curQueryResult.index].prop = column.prop
        this.filterTableData(this.curQueryResult.currentPage)
      },
      handleMouseDown (evt) {
        // 上下拉动结果区域
        evt = evt || event
        let mouseDownY = evt.clientY
        if (this.$refs.resizeDiv.setCapture) {
          this.$refs.resizeDiv.setCapture()
        }
        let resultLogHeight = (this.$refs.resultLog.style.height + '').replace('px', '')
        let aceEditHeight = (this.$refs.aceEdit.style.height + '').replace('px', '')

        this.isEnLarge = false
        this.isEnLargeRes = false
        window.document.onmousemove = (ev) => {
          let sev = ev || event
          let mouseMoveY = sev.clientY
          let resultHeight = Number(resultLogHeight) + (mouseDownY - mouseMoveY)
          let aceEditMHeight = Number(aceEditHeight) + (mouseMoveY - mouseDownY)
          aceEditMHeight = this.reOffsetHeight - resultHeight < aceEditMHeight ? (this.reOffsetHeight - resultHeight) : aceEditMHeight // 修正编辑器高度
          if (resultHeight > 76 && resultHeight < this.reOffsetHeight) {
            this.tableMaxHeight = resultHeight - 80 - 40
            this.resultLogHeight = resultHeight
            this.$refs.logTable && (this.$refs.logTable.style.height = (resultHeight - 76) + 'px') // 76 结果导航+下一行说明
            this.logInfoHeight = resultHeight - 76
            this.$refs.logTable && (this.$refs.logTable.style.display = 'block')
            this.$refs.logInfo && (this.$refs.logInfo.style.display = 'block')
            this.$refs.aceEdit.style.height = aceEditMHeight + 'px'
            this.editor.resize(true)
          }
          if (resultHeight <= 100) {
            this.$refs.logTable && (this.$refs.logTable.style.display = 'none')
            this.$refs.logInfo && (this.$refs.logInfo.style.display = 'none')
            this.logInfoHeight = 0
            this.tableMaxHeight = -42
          }
        }
      },
      updateEditorHeight (height) {
        // ctrl+F,全屏来回切换,更新编辑器高度
        let aceEditRawHeight = (this.$refs.aceEdit.style.height + '').replace('px', '')
        let aceEditHeight = (+aceEditRawHeight + height)
        this.$refs.aceEdit.style.height = aceEditHeight + 'px'
        this.editor.resize(true)
        if (this.isEnLargeRes) { //放大结果区时, 调整结果窗口大小
          this.tableMaxHeight = this.tableMaxHeight + height
          this.logInfoHeight = this.logInfoHeight + height
          this.resultLogHeight = this.resultLogHeight + height
        }
      },
      toggleThemeOK () {
        let oldTheme = window.localStorage.getItem('aceTheme') || ''
        oldTheme = 'theme-' + oldTheme
        let bodyClassName = document.body.className || ''
        bodyClassName = bodyClassName.replace(' ' + oldTheme, '').replace(oldTheme + ' ', '').replace(oldTheme, '')
        window.localStorage.setItem('aceTheme', this.aceTheme)
        this.editor.setTheme(this.aceThemeArr[this.aceTheme])
        this.dialogThemeVisible = false
        document.body.className = bodyClassName + ' ' + ('theme-' + this.aceTheme)
      },
      setReOffsetHeight () {
        this.reOffsetHeight = (parseInt(this.offsetHeight) - 136)
        const availHeight = window.screen.availHeight
        const clientHeight = document.body.clientHeight
        if (availHeight - clientHeight > 150) {
          this.offsetHeight = availHeight - 150
          this.reOffsetHeight = (parseInt(this.offsetHeight) - 136)
        }
      }
    },
    mounted () {
      this.setReOffsetHeight()
      this.getAllDir()
      // 编辑器api参考 https://ace.c9.io/
      // this.editor.getValue() 获取值
      // this.editor.setValue(value, index) 设置值
      // this.editor.insert(value) 插入字段
      // this.editor.getCopyText() 获取选中的值
      const aceEdit = this.$refs.aceEdit
      aceEdit.style.fontSize = this.fontSizes[this.defaultIndex]
      aceEdit.style.height = `${(this.reOffsetHeight * 0.7) - 1}px`
      this.$refs.resultLog.style.bottom = 0
      this.logInfoHeight = (this.reOffsetHeight * 0.3) - 76 // 获取日志信息高度
      this.resultLogHeight = this.reOffsetHeight * 0.3 // 日志+结果tab高度
      let aceTheme = window.localStorage.getItem('aceTheme') || 'merbivore'
      let editor = ACE.edit(aceEdit)
      this.aceTheme = aceTheme
      editor.setTheme(this.aceThemeArr[aceTheme]) //设置主题
      editor.session.setMode('ace/mode/sql') //设置语法
      editor.setShowPrintMargin(false) //是否分屏
      editor.setHighlightActiveLine(false)
      editor.setOptions({
        enableAssociateAutocompletion: true, // 设置表字段联想提示
        enableLiveAutocompletion: true, // 设置提示
        enableSnippets: true // 设置snippets提示
      })
      editor.resize(true) // 触发尺寸缩放
      editor.setShowInvisibles(false) // 设置空格符、换行符
      this.editor = editor
      this.editor.setValue(this.initEditorValue, 1)
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
      this.resetSession()
      //执行(ctrl + enter),保存(alt + s)
      window.addEventListener(
          "keydown",
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
            }
            else if (this.dialogThemeVisible && e.keyCode === 13) { // enter, 主题切换
              this.$refs.themeSelect.blur()
              this.toggleThemeOK()
            }
//                  else if (e.altKey && e.keyCode == 83) { // alt + s
//                      this.saveSql()
//                  }
          },
          false
      )

      // 设置body-class
      let bodyClassName = document.body.className || ''
      let themeClass = 'theme-' + aceTheme
      bodyClassName = bodyClassName.replace(' ' + themeClass, '').replace(themeClass + ' ', '').replace(themeClass, '')
      document.body.className = bodyClassName + (bodyClassName != '' ? ' ' : '') + 'theme-' + this.aceTheme

      this.editor.completers.length > 3 ? this.editor.completers.pop() : ''
      this.editor.completers.push({
        getCompletions: function(editor, session, pos, prefix, callback) {
          if (prefix.length === 0) {
            return callback(null, [])
          } else {
            return callback(null, [{meta: "库", isLib: true, value: "sonic", score:10},
              {meta: "库", isLib: true, value: "dwt", score:10},
//              {meta: "表名称", isLib: false, value: "svn_1220", score:9},
//              {meta: "表名称", isLib: false, value: "dbid_ol_crm_test2", score:9, libName: 'dwt'},
//              {meta: "表名称", isLib: false, value: "dbid_test2", score:9, libName: 'sonic'}
            ])
          }
        }
      })
//      var langTools = ACE.require("ace/ext/language_tools")
//      langTools.addCompleter({
//        getCompletions: function(editor, session, pos, prefix, callback) {
//          if (prefix.length === 0) {
//            return callback(null, [])
//          } else {
//            return callback(null, [{meta: "库", isLib: true, caption: "sonic", value: "sonic", score:10},
//              {meta: "库", isLib: true, caption: "dwt", value: "dwt", score:10},
//              {meta: "表名称", isLib: false, caption: "svn_1220", value: "svn_1220", score:9},
//              {meta: "表名称", isLib: false, caption: "dbid_ol_crm_test2", value: "dbid_ol_crm_test2", score:9, libName: 'dwt'},
//              {meta: "表名称", isLib: false, caption: "dbid_test2", value: "dbid_test2", score:9, libName: 'sonic'}])
//          }
//        }
//      })
    },
    destroyed () {
      // 组件销毁时, 移除代码补全弹框
      for(let item of document.getElementsByClassName('ace_editor')) {
        document.body.removeChild(item)
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" type="text/stylus" scoped>
  @import "../../assets/style/ideEdit.styl"

  .lh-24
    line-height 24px

  >>>  .ace_content
    z-index 1
</style>
