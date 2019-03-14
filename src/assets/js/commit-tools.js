#! /usr/bin/env node
let execSync = require('child_process').execSync
let path = require('path')
let args = require('./command')
let summit = require('./inquirer')
let rp = require('request-promise')
let fs = require('fs')
let request = require('request')
let accessUrl = 'http://h5-deploy-jenkins.ymmoa.com'
async function getData () {
  let absPath = process.cwd()
  let currBranch = execSync('git symbolic-ref --short -q HEAD',  {cwd: absPath}).toString().split('\n')[0]
  let fetchBranch = execSync(`git branch -r`, {cwd: absPath}).toString().split('\n')
  let localBranch = execSync(`git branch`, {cwd: absPath}).toString().split('\n')
  let envMap = {
    'dev': 'dev',
    'beta': 'beta'
  }
  let gitStatus = execSync('git status').toString()
  if (gitStatus.indexOf('modified:') !== -1 || gitStatus.indexOf('git add') !== -1) {
    execSync('git add .', {cwd: absPath})
    record = await summit.commit('commit')
    execSync('git commit -m ' + '"' + record.commit + '"', {cwd: absPath})
    execSync(`git push origin ${currBranch}`, {cwd: absPath})
  } else {
    if (!isHasBranch(fetchBranch, `origin/${currBranch}`)) {
      execSync(`git push origin ${currBranch}`, {cwd: absPath})
    }
  }
  if (currBranch === 'master') {
    console.warn(`dev环境和beta环境不允许发布master分支,请切换到分支${args.environment}或者自己的开发分支`)
    process.exit(0)
    return
  }
  if (currBranch === 'dev' && args.environment === 'beta') {
    console.warn(`beta环境不允许发布dev分支,请切换到分支${args.environment}或者自己的开发分支`)
    process.exit(0)
    return
  }
  if (currBranch === 'beta' && args.environment === 'dev') {
    console.warn(`dev环境不允许发布beta分支, 请切换到分支${args.environment}或者自己的开发分支`)
    process.exit(0)
    return
  }
  if (currBranch !== 'dev' && currBranch !== 'beta') {
    if (currBranch !== envMap[args.environment]) {
      if (isHasBranch(localBranch, envMap[args.environment])) {
        execSync(`git checkout ${envMap[args.environment]}`, {cwd: absPath})
        if (!isHasBranch(fetchBranch, `origin/${envMap[args.environment]}`)) {
          execSync(`git pull origin  ${envMap[args.environment]}`, {cwd: absPath})
        }
      } else {
        execSync(`git checkout master`, {cwd: absPath})
        execSync(`git pull origin master`, {cwd: absPath})
        execSync(`git checkout -b ${envMap[args.environment]}`, {cwd: absPath})
        if (!isHasBranch(fetchBranch,`origin/${envMap[args.environment]}`)) {
          execSync(`git pull origin ${envMap[args.environment]}`, {cwd: absPath})
        }
      }
      execSync(`git merge --no-ff ${currBranch}`, {cwd: absPath})
      execSync(`git push origin ${envMap[args.environment]}`, {cwd: absPath})
    }
  }
  let add = execSync('git remote -v').toString()
  let originAddress = add.split('\n')[0].replace(/^origin/, '').replace(/\(fetch\)/, '').trim()
  let package =  fs.readFileSync(path.resolve(absPath, './package.json'))
  let jobName = 'base-' + envMap[args.environment] + '-' + JSON.parse(package).packageName
  // 获取所有job
  let resJobs = await rp({
    headers: {
      'Authorization': 'Basic cm9vdDoxMjM0NTY3ODk='
    },
    url: `${accessUrl}/api/json?pretty=true`,
    method: 'get',
    json: true
  })
  let findJobs = resJobs.jobs.filter((item) => {
    return item.name === jobName
  })
  if (findJobs.length === 0) {
    await rp({
      headers: {
        'Authorization': 'Basic cm9vdDoxMjM0NTY3ODk='
      },
      url: `${accessUrl}/createItem`,
      qs: {
        name: jobName,
        mode: 'copy',
        from: 'h5-common-other'
      },
      method: 'post'
    })
  }
  let packageInfo = JSON.parse(package)
  let deploy = `deploy_${envMap[args.environment]}`
  let command = `npm run ${deploy}`
  await rp({
    url: `${accessUrl}/job/${jobName}/buildWithParameters`,
    headers: {
      'Authorization': 'Basic cm9vdDoxMjM0NTY3ODk='
    },
    method: 'post',
    formData: {
      branch: `${envMap[args.environment]}`,
      command: command,
      git_url: `${originAddress}`,
      project_name: `${packageInfo.packageName}`
    },
    json: true
  })
  execSync(`git checkout ${currBranch}`)
  let status = true
  let result = "false"
  console.log('开始构建.......')
  function downloading() {
    if (status) {
      setTimeout(function (){
        request({
          url: `${accessUrl}/job/${jobName}/lastBuild/api/json`,
          headers: {
            'Authorization': 'Basic cm9vdDoxMjM0NTY3ODk=',
          },
          json: true
        }, function (err, res, body) {
          if (!err && res.statusCode === 200) {
            status = body.building
            result = body.result
          }
        })
        downloading()
      }, 500)
    } else {
      console.info('构建' + (result ===  'SUCCESS' ? '成功' : '失败'))
    }
  }
  setTimeout(function () {
    console.info(`${accessUrl}/job/${jobName}/lastBuild/console`)
    downloading()
  }, 15000)

}
getData()
function isHasBranch (arr, branchName) {
  let index = arr.findIndex((item) => {
    return item.replace(/\s+/g, '').replace('*', '') === branchName
  })
  return index !== -1
}
function findIndexByName (arr, name) {
  return arr.findIndex((item) => item === name)
}
