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
  res.render('pages/homepage', {
    title: 'Homepage'
  })
  console.log('homepage page')
  //next()
})

router.post('/', function (req, res, next) {
  console.log(req.body)
  let json = {
    code: 2000,
    data: {},
    storedata : {},
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
      condition = ''
      log.info("check if out of store")
      const outOfStore = 'SELECT * FROM product WHERE store<safeStore '
      const GetOrder = 'SELECT * FROM orders '
      co(function* exec() {
        result = yield query(outOfStore, condition)
        //log.info(result)
        if (result) {
          json.storedata = result
          result = yield query(GetOrder, condition)
          if (result) {
            json.code = 2001
            json.msg = 'get order success '
            json.data = result
            res.send(json)
            connect.release()
          } else {
            log.info(err)
            json.code = 6000
            json.msg = 'get order error '
            res.send(json)
            connect.release()
          }
        } else {
          log.info(err)
          json.code = 6000
          json.msg = 'get store error '
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