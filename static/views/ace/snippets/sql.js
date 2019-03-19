ace.define("ace/snippets/sql",["require","exports","module"], function(require, exports, module) {
  "use strict";

  exports.snippetText = "snippet tb1\n\
	create table ${1:table} (\n\
		${2:columns}\n\
	);\n\
snippet s*\n\
	select * from ${1:table}\n\
	where day = 20180101;\n\
snippet sf*\n\
	select *\n\
	from ${1:table}\n\
	where ${2:column} = ''\n\
	and day = 20180101\n\
	group by ${3:column}\n\
	order by ${4:column};\n\
snippet sj*\n\
	select * from\n\
	(select * from ${2:table}) t1\n\
	left join\n\
	(select * from ${3:table}) t2\n\
	on t1.${3:column} = t2.${4:column};\n\
snippet tb2\n\
	create table if not exists ${1:table} (\n\
		${2:columns} ${3:type} comment '列1',\n\
		${4:columns} ${5:type} comment '列2',\n\
		${6:columns} ${7:type} comment '列3',\n\
		${8:columns} ${9:type} comment '列4',\n\
		${10:columns} ${11:type} comment '列5'\n\
	)comment '表中文名'\n\
	stored as parquet;\n\
snippet ins*\n\
	insert overwrite table ${1:table}\n\
	select;\n\
snippet cas*\n\
	case when ${1:columns} = 1 then ${2:value}\n\
	case when ${3:columns} = 2 then ${4:value}\n\
	case when ${5:columns} = 2 then ${6:value}\n\
	else ${7:value}\n\
	end;\n\
";
  exports.scope = "sql";

});                (function() {
  ace.require(["ace/snippets/sql"], function(m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();