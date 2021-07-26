const express = require('express')
const mysql = require('../../model/myDB')
const sha256 = require('sha256')
const log = require('loglevel')
const co = require('co')
const Promise = require('bluebird');

const router = express.Router()
const pool = mysql.getPool()

log.setDefaultLevel('INFO')

router.get('/', function (req, res, next) {
  res.render('pages/signup', {
    title: 'SignUp'
  })
})

router.post('/', function (req, res, next) {
  log.info(req.body)
  let json = {
    code: 2000,
    data: {},
    msg: ''
  }
  pool.getConnection((err, connect) => {
    if (err) {
      log.error(err)
      json.code = 6000
      json.msg = 'connect error'
      res.send(json)
    } else {
      let u_account = req.body.account
      let u_password = req.body.password
      if (u_account && u_password){
        let condition, result
      const query = Promise.promisify(connect.query, {
        context: connect
      })
      const SelectAllUsers = 'SELECT * FROM user'
      const CreateUser = ' INSERT INTO user (uID,account,password) VALUES (?,?,?) '
      co(function* exec() {
        result = yield query(SelectAllUsers)
        if (result) {
          let u_ID = result.length + 1

          let hex = sha256(u_password)
          let count = 0
          for (let i = 0; i < result.length; i++) {
            if (result[i]['account'] === u_account) {
              count = 1
            }
          }
          if (count === 0) {
            condition = [
              "u"+u_ID,
              u_account,
              hex
            ]
            result = yield query(CreateUser, condition)
            log.info(result)
            if (result) {
              json.code = 2001
              json.msg = 'create success!'
              json.data = result
              res.send(json)
              connect.release()
            } else {
              json.code = 6000
              json.msg = 'create error'
              res.send(json)
              connect.release()
            }
          } else {
            json.code = 6000
            json.msg = 'someone have this account name'
            res.send(json)
            connect.release()
          }
        } else {
          json.code = 6000
          json.msg = 'no data'
          res.send(json)
          connect.release()
        }

      }).catch(err => {
        log.error(err)
        json.code = 6000
        json.msg = 'database is having a problem '
        res.send(json)
        connect.release()
      })
    }else{
      log.error(err)
        json.code = 6000
        json.msg = 'account & password can not be null'
        res.send(json)
        connect.release()
    }}
  })
})

module.exports = router