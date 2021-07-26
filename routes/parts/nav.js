const express = require('express')
const mysql = require('../../model/myDB')
const log = require('loglevel')
const co = require('co')
const Promise = require('bluebird');

const router = express.Router()
const pool = mysql.getPool()

log.setDefaultLevel('INFO')

router.post('/logout', function (req, res, next) {
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
      connect.release()
    } else {
      let condition, result
      const query = Promise.promisify(connect.query, {
        context: connect
      })
      const DeleteSession = 'DELETE FROM session WHERE sessionID = ?'
      condition = req.cookies.sID
      co(function* exec() {
        result = yield query(DeleteSession, condition)
        if (result) {
          json.code = 2000
          json.msg = 'logout success '
          res.send(json)
          connect.release()
        } else {
          log.info(err)
          json.code = 6000
          json.msg = 'logout error '
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

router.post('/getName', function (req, res, next) {
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
      connect.release()
    } else {
      let condition, result
      const query = Promise.promisify(connect.query, {
        context: connect
      })
      log.info("get name from user")
      const GetName = 'SELECT username FROM user WHERE uID = ? '
      condition = req.cookies.uID
      log.info("******************")
      log.info(req.body)
      log.info(condition)
      co(function* exec() {
        result = yield query(GetName, condition)
        log.info(result)
        if (result && result.length!==0) {
          json.code = 2001
          json.msg = 'get name success '
          json.data = result[0]
          res.send(json)
          connect.release()
        } else {
          log.info(err)
          json.code = 6000
          json.msg = 'get name error '
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