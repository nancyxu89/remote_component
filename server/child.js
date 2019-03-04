let path = require('path')
let exec = require('child_process').exec
let absPath = process.cwd()
let execSync = require("child_process").execSync
let child = exec("git symbolic-ref --short -q HEAD")
let curBranch = execSync(`git symbolic-ref --short -q HEAD`, {cwd: absPath}).toString().split('\n')
let fetchBranch = execSync(`git branch -r`, {cwd: absPath}).toString().split('\n')
let isGitPath = false
function hasGitPath() {
  let pathExec = exec(`find .git`)
  try{
    console.log(execSync('find "../.git"', {cwd: absPath}).toString().split('\n'))
    isGitPath = true
  }catch (err){
    console.log(err)
  }
  pathExec.stdout.on("data", function (data) {
    console.log("stdout", data)
  })
  pathExec.stderr.on("data", function (data) {
    console.log("stderr", data)
  })
  pathExec.on("close", function (data) {
    console.log("close", data)
  })
}
hasGitPath()
console.log(curBranch)
console.log(fetchBranch)
console.log(absPath)

// 1 获取Git当前分支名称, git symbolic-ref --short -q HEAD
// 2 获取Git版本号, git rev-parse --short HEAD
// 3 获取Git tags, git describe --tags
// 4 获取Git 提交次数, git rev-list --count HEAD

child.stdout.on("data", function (data) {
  console.log("stdout", data)
})
child.stderr.on("data", function (data) {
  console.log("stderr", data)
})
child.on("close", function (data) {
  console.log("close", data)
})