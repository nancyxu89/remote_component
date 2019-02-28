<template>
    <div>
        <button @click="sortTable">click</button>
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane :label="item.label" :name="item.name" v-for="(item,index) in tabs" :key="item.label">
                <el-table
                        ref="multipleTable"
                        @sort-change="handleTableSort"
                        :data="results[index]"
                        border
                        stripe
                        show-overflow-tooltip
                        size="mini"
                        style="width: 100%">
                    <el-table-column
                            sortable="custom"
                            show-overflow-tooltip
                            :prop="`name_${index}`"
                            :label="item[`name_${index}`]"
                            v-for="(item, index) in columnNames" :key="item[`name_${index}`]">
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
        <!--<el-table-->
                <!--ref="multipleTable"-->
                <!--@sort-change="handleTableSort"-->
                <!--:data="results"-->
                <!--border-->
                <!--stripe-->
                <!--show-overflow-tooltip-->
                <!--size="mini"-->
                <!--style="width: 100%">-->
            <!--<el-table-column-->
                    <!--sortable="custom"-->
                    <!--show-overflow-tooltip-->
                    <!--:prop="`name_${index}`"-->
                    <!--:label="item[`name_${index}`]"-->
                    <!--v-for="(item, index) in columnNames" :key="item[`name_${index}`]">-->
            <!--</el-table-column>-->
        <!--</el-table>-->
    </div>
</template>
<script>
import * as arr from "../assets/table.json";
let allResultData = arr.default[0].allResultData;
export default {
  data() {
    return {
      sortOrder: "",
      sortProp: "",
      data: arr.default,
      //      results: [allResultData.slice(0, 50),allResultData.slice(50, 100),allResultData.slice(100, 200), allResultData],
      results: [
        allResultData.slice(1, 199),
        allResultData.slice(2, 200),
        allResultData,
        allResultData.slice(1, 198)
      ],
      columnNames: arr.default[0].columnNames,
      sortArr: [],
      activeName: "1",
      tabs: [
        { label: "结果1", name: "1" },
        { label: "结果2", name: "2" },
        { label: "结果3", name: "3" },
        { label: "结果4", name: "4" }
      ]
    };
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
    filterTableData() {},
    handleTableSort(column) {
      this.sortOrder = column.order;
      this.sortProp = column.prop;
      let prop = this.sortProp;

      let isDes = this.sortOrder === "descending";
      this.sortArr = JSON.parse(JSON.stringify(this.results.slice(0, 10))).sort(
        (a, b) => {
          let c = isFinite(a[prop]);
          let d = isFinite(b[prop]);
          return (
            (c != d && (!isDes ? d - c : c - d)) ||
            (!isDes ? a[prop] - b[prop] : b[prop] - a[prop])
          );
          //                  if(a[prop].length === b[prop].length){
          //                      return isDes ? b[prop].localeCompare(a[prop]) : a[prop].localeCompare(b[prop])
          //                  } else {
          //                      return isDes ? (b[prop].length - a[prop].length) : (a[prop].length - b[prop].length)
          //                  }
          //                  return isDes ? b - a : a - b
        }
      );
      //          this.filterTableData(1)
      let arr = this.sortArr.map(item => {
        return item[prop];
      });
      console.log(arr);
      console.log(column, this.sortProp, this.sortOrder);
      console.log(this.sortOrder === "descending" ? "降序" : "升序");
    },
    sortTable() {
      //      this.$refs.multipleTable.sort({
      //        prop: 'name_11',
      //        order: 'descending'
      //      });
      let arr = [
        "云A018G6",
        "云A0183V",
        "云A0033X",
        "云A00258",
        "予QC7000",
        "予N8298J",
        "予G83608",
        "予BHB675",
        "一L34448",
        "0902012注"
      ];
      arr.sort((a, b) => {
        return a - b;
      });
      console.log(arr);
    }
  },
  mounted() {}
};
</script>
