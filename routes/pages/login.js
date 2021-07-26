const express = require('express')
const mysql = require('../../model/myDB')
const sha256 = require('sha256')
const log = require('loglevel')
const uuid = require('uuid/v4')
const co = require('co')
const Promise = require('bluebird');

const router = express.Router()
const pool = mysql.getPool()

log.setDefaultLevel('INFO')

router.get('/', function (req, res, next) {
  // res.send('respond with a resource');
  res.render('pages/login', {
    title: 'Login'
  })
  console.log('login page')
  //next()
})

router.post('/', function (req, res, next) {
  console.log(req.body)
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
      let condition, result
      const query = Promise.promisify(connect.query, {
        context: connect
      })
      const SelectUserByAcc = 'SELECT * FROM user WHERE account = ? '
      const InsertSession = ' INSERT INTO session (sID,uID,sessionID,deviceType) VALUES (?,?,?,?) '
      condition = [req.body.account]
      co(function* exec() {
        result = yield query(SelectUserByAcc, condition)
        let hex = sha256(req.body.password)
        if (result && hex === result[0]['password']) {
          let s_ID = uuid()
          let u_ID = result[0]['uID']
          // log.info(u_ID)
          let session_ID = s_ID
          let device_Type = 'mob'
          condition = [
            s_ID,
            u_ID,
            session_ID,
            device_Type
          ]
          result = yield query(InsertSession, condition)
          //log.info(result)
          log.info(u_ID)
          log.info("--------------------")
          if (result) {
            json.code = 2001
            json.msg = 'login success!'
            json.data = {
              SessionID: session_ID,
              u_ID:u_ID
            }
            log.info("database inserted")
            log.info(json)
            res.send(json)
            //log.info(json)
            connect.release()
            
          } else {
            json.code = 6000
            json.msg = 'login error'
            res.send(json)
            connect.release()
          }
        } else {
          json.code = 6000
          json.msg = 'password error'
          res.send(json)
          connect.release()
        }
      }).catch(err => {
        log.info(err)
        json.code = 6000
        json.msg = 'database is having a problem '
        res.send(json)
        connect.release()
      })
    }
  })
})

module.exports = router