import Vue from "vue";
/**
 * 首字母大写
 * @param str 字符串
 * @example heheHaha
 * @return {string} HeheHaha
 */
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * 对符合'xx/xx.vue'组件格式的组件取组件名
 * @param str fileName
 * @example abc/bcd/def/basicTable.vue
 * @return {string} BasicTable
 */
function validateFileName(str) {
  return (
    /^\S+\.vue$/.test(str) &&
    str.replace(/^\S+\/(\w+)\.vue$/, (rs, $1) => capitalizeFirstLetter($1))
  );
}
const requireComponent = require.context("./", true, /\.vue$/);
requireComponent.keys().forEach(filePath => {
  const componentConfig = requireComponent(filePath);
  const fileName = validateFileName(filePath);
  const componentName =
    fileName.toLowerCase() === "index"
      ? capitalizeFirstLetter(componentConfig.default.name)
      : fileName;
  Vue.component(componentName, componentConfig.default || componentConfig);
  console.log(componentName);
});
