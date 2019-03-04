var fs = require("fs");
var path = require("path");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use("/static", express.static(path.join(__dirname, "../static"))); //指定静态文件目录


//获取数据库连接对象
var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "123456",
  port: "3306",
  database: "db_test"
});


//处理post字段请求
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//处理跨域请求
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});


app.get("/", function (req, res) {
  res.send("请求home成功");
})

//用户登录
app.post("/user/login", (req, res) => {
  var name = req.body.username;
  var passwd = req.body.password;
  var userStr = `select * from user where name="${name}" and psw="${passwd}"`;
  connection.connect();
  connection.query(userStr, function (err, result) {
    connection.end();
    if (err) {
      throw err;
    } else {
      res.send(result ? {code: 1, data: result} : {code: -1, msg: '无该用户信息'})
    }
  })
})

app.get("/template/:name", (req, res) => {
  console.log(req.params)
  console.log(req.query)
  fs.readFile("../static/components/a.js", "utf-8", function(err, data){
    res.send(data)
  });
  // res.send(req.query)
})

fs.readFile("../static/components/a.js", "utf-8", function(err, data){
  // console.log(data);
});

const port = 13001;
app.listen(port, () => {
  console.log("Express server listening on port " + port);
});
