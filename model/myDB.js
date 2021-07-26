var mysql = require('mysql')

function mysqlPool() {
  var pool = mysql.createPool({
    host: 'localhost',
    port: 5678,
    user: 'root',
    password: 's870110s',
    database: 'test'
  })

  this.getPool = function getpool() {
    return pool
  }
}

module.exports =new mysqlPool()